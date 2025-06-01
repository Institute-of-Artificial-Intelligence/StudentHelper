
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Bot, User, Archive, Search, Calendar, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatMessage {
  author: string;
  text: string;
  created_at: string;
}

const ChatArchive = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log('Loading messages for user:', user.id);
        
        const { data, error } = await supabase
          .from('chat_history')
          .select('author, text, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading chat messages:', error);
          setMessages([]);
          setFilteredMessages([]);
        } else {
          console.log('Loaded messages:', data);
          const messageData = data || [];
          setMessages(messageData);
          setFilteredMessages(messageData);
        }
      } catch (error) {
        console.error('Error in loadMessages:', error);
        setMessages([]);
        setFilteredMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user]);

  useEffect(() => {
    filterMessages();
  }, [messages, searchQuery, dateFilter]);

  const filterMessages = () => {
    let filtered = [...messages];

    // Фильтр по тексту
    if (searchQuery.trim()) {
      filtered = filtered.filter(message =>
        message.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по дате
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const startDate = startOfDay(filterDate);
      const endDate = endOfDay(filterDate);
      
      filtered = filtered.filter(message => {
        const messageDate = parseISO(message.created_at);
        return isWithinInterval(messageDate, { start: startDate, end: endDate });
      });
    }

    setFilteredMessages(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('');
  };

  const hasActiveFilters = searchQuery.trim() || dateFilter;

  const isTableLike = (text: string): boolean => {
    const lines = text.trim().split("\n");
    const hasPipeLines = lines.filter((line) => line.includes("|")).length;
    return hasPipeLines >= 2 && lines[0].includes("|");
  };

  const renderMarkdownTable = (text: string, keyPrefix = "table") => {
    const lines = text
      .split("\n")
      .filter((line) => line.includes("|") && !/^[-| ]+$/.test(line));
  
    const rows = lines.map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter((_, i, arr) => !(i === 0 && arr[i] === "") && !(i === arr.length - 1 && arr[i] === ""))
    );
  
    const [header, ...body] = rows;
  
    return (
      <div key={keyPrefix} className={`overflow-auto my-4 rounded border border-gray-300 dark:border-gray-600 shadow-sm ${isMobile ? 'text-xs' : 'text-sm'}`}>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {header.map((cell, i) => (
                <th key={`head-${i}`} className={`${isMobile ? 'px-2 py-1' : 'px-4 py-2'} border border-gray-300 dark:border-gray-600 font-bold text-left dark:text-white`}>
                  {parseMarkdown(cell, `head-${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={`row-${i}`} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                {row.map((cell, j) => (
                  <td key={`cell-${i}-${j}`} className={`${isMobile ? 'px-2 py-1' : 'px-4 py-2'} border border-gray-300 dark:border-gray-600 whitespace-pre-wrap align-top dark:text-gray-200`}>
                    {parseMarkdown(cell, `cell-${i}-${j}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const parseMarkdown = (text: string, keyPrefix = '') => {
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let index = 0;

    while ((match = regex.exec(text)) !== null) {
      const matchStart = match.index;

      if (matchStart > lastIndex) {
        elements.push(
          <span key={`${keyPrefix}-text-${index++}`}>
            {text.slice(lastIndex, matchStart)}
          </span>
        );
      }

      if (match[2]) {
        elements.push(
          <strong key={`${keyPrefix}-bold-${index++}`}>{match[2]}</strong>
        );
      } else if (match[3]) {
        elements.push(
          <em key={`${keyPrefix}-italic-${index++}`}>{match[3]}</em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(
        <span key={`${keyPrefix}-text-${index++}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  const formatContent = (text: string) => {
    const cleanedText = text
      .replace(/\n{3,}/g, '\n\n');
  
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  
    const blocks = cleanedText.split(/\n\s*\n/);
  
    const elements: React.ReactNode[] = [];
  
    blocks.forEach((block, i) => {
      if (block.includes('|') && block.split('\n').length >= 2) {
        elements.push(renderMarkdownTable(block, `table-${i}`));
      } else {
        const processedBlock = block.replace(/---/g, '\n');
      
        const inner: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;
        while ((match = markdownLinkRegex.exec(processedBlock)) !== null) {
          const [fullMatch, linkText, url] = match;
          const matchStart = match.index;
      
          const beforeText = processedBlock.slice(lastIndex, matchStart);
          if (beforeText) {
            inner.push(...parseMarkdown(beforeText, `block-${i}-before-${lastIndex}`));
          }
      
          inner.push(
            <span key={`link-${i}-${lastIndex}`} className="inline-flex items-center gap-1">
              <img
                src={`https://www.google.com/s2/favicons?domain=${url}`}
                alt="favicon"
                className="w-4 h-4"
              />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {linkText}
              </a>
            </span>
          );
      
          lastIndex = matchStart + fullMatch.length;
        }
      
        const remainingText = processedBlock.slice(lastIndex);
        if (remainingText) {
          inner.push(...parseMarkdown(remainingText, `block-${i}-after-${lastIndex}`));
        }
      
        elements.push(
          <p key={`p-${i}`} className="mb-2">
            {inner}
          </p>
        );
      }
    });
  
    return elements;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 flex flex-col w-full">
      <h1 className={`mb-4 ${isMobile ? 'text-lg' : 'text-2xl'} font-bold px-2`}>Архив сообщений</h1>
      
      {/* Панель поиска */}
      <Card className={`mb-4 ${isMobile ? 'mx-2' : ''}`}>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={`flex flex-col gap-3`}>
            <div className="relative w-full">
              <Search className={`absolute left-3 top-3 h-4 w-4 text-gray-400`} />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 w-full ${isMobile ? 'text-sm' : ''}`}
              />
            </div>
            
            <div className="relative w-full">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                placeholder="Фильтр по дате"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`pl-10 w-full ${isMobile ? 'text-sm' : ''}`}
              />
            </div>
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center gap-2 w-full"
                size={isMobile ? "sm" : "default"}
              >
                <X className="h-4 w-4" />
                Очистить
              </Button>
            )}
          </div>
          
          {hasActiveFilters && (
            <div className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
              Найдено сообщений: {filteredMessages.length} из {messages.length}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredMessages.length === 0 ? (
        <Card className={`${isMobile ? 'mx-2 p-3' : 'p-8'} text-center`}>
          <CardContent className={isMobile ? 'p-3' : ''}>
            {hasActiveFilters ? (
              <div>
                <p className={`text-gray-500 dark:text-gray-400 mb-4 ${isMobile ? 'text-xs' : ''}`}>
                  По вашему запросу сообщения не найдены
                </p>
                <Button variant="outline" onClick={clearFilters} size={isMobile ? "sm" : "default"}>
                  Показать все сообщения
                </Button>
              </div>
            ) : (
              <div>
                <p className={`text-gray-500 dark:text-gray-400 mb-4 ${isMobile ? 'text-xs' : ''}`}>
                  Пока нет сообщений в архиве. Начните общение с ассистентом, и ваша переписка появится здесь.
                </p>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
                  Всего сообщений в базе: {messages.length}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className={`flex-1 ${isMobile ? 'mx-2' : ''}`}>
          <CardHeader className={isMobile ? 'p-3 pb-2' : ''}>
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
              <Archive className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              История переписки ({filteredMessages.length} сообщений)
            </CardTitle>
          </CardHeader>
          
          <CardContent className={`${isMobile ? 'max-h-[calc(100vh-200px)] p-2' : 'max-h-[calc(100vh-300px)] p-4'} overflow-y-auto space-y-${isMobile ? '2' : '4'}`}>
            {filteredMessages.map((message, index) => (
              <div
                key={`${message.created_at}-${index}`}
                className={`flex gap-${isMobile ? '2' : '3'} ${isMobile ? 'p-2 text-xs' : 'p-4'} rounded-lg ${
                  message.author === 'bot' || message.author === 'assistant'
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-gray-50 dark:bg-gray-800/50'
                } w-full overflow-hidden`}
              >
                <div className="flex-shrink-0">
                  {message.author === 'bot' || message.author === 'assistant' ? (
                    <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-blue-500 rounded-full flex items-center justify-center`}>
                      <Bot className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                    </div>
                  ) : (
                    <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-gray-500 rounded-full flex items-center justify-center`}>
                      <User className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-2'} mb-1`}>
                    <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} flex-shrink-0`}>
                      {message.author === 'bot' || message.author === 'assistant' ? 'Ассистент' : 'Вы'}
                    </span>
                    <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400 flex-shrink-0`}>
                      {format(parseISO(message.created_at), isMobile ? 'dd.MM, HH:mm' : 'dd MMM yyyy, HH:mm', { locale: ru })}
                    </span>
                  </div>
                  
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-300 break-words overflow-hidden`}>
                    {formatContent(message.text)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatArchive;
