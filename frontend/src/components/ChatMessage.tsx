import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BrainCog } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ChatMessageProps {
  content: string;
  isBot: boolean;
  animate?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isBot, animate = false }) => {
  const [showThinking, setShowThinking] = useState(false);
  
  const baseClass = "chat-message";
  const typeClass = isBot ? "chat-message-bot" : "chat-message-user";
  const animationClass = animate ? "animate-fade-in" : "";

  const thinkingMatch = content.match(/<think>(.*?)<\/think>/s);
  const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null;
  
  const cleanedContent = content.replace(/<think>.*?<\/think>\s*/gs, '');

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
      <div key={keyPrefix} className="overflow-auto my-4 rounded border border-gray-300 dark:border-gray-600 shadow-sm">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {header.map((cell, i) => (
                <th key={`head-${i}`} className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold text-left dark:text-white">
                  {parseMarkdown(cell, `head-${i}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={`row-${i}`} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                {row.map((cell, j) => (
                  <td key={`cell-${i}-${j}`} className="px-4 py-2 border border-gray-300 dark:border-gray-600 whitespace-pre-wrap align-top dark:text-gray-200">
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
  
    const blocks = cleanedText.split(/\n\s*\n/); // делим на блоки по двойным переносам
  
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

  return (
    <div className={cn(baseClass, typeClass, animationClass)}>
      {thinkingContent && isBot && (
        <div className="px-4 pt-3 pb-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowThinking(!showThinking)}
            className="bg-black text-white border-black hover:bg-white hover:text-black dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white flex items-center gap-1 text-xs mb-1"
          >
            <BrainCog size={16} />
            {showThinking ? "Скрыть размышление" : "Показать размышление"}
          </Button>
          
          {showThinking && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">
              <h4 className="font-medium mb-1 text-edu-primary dark:text-blue-400">Размышление модели:</h4>
              <div className="whitespace-pre-wrap">{formatContent(thinkingContent)}</div>
            </div>
          )}
        </div>
      )}
      <div className="p-4 whitespace-pre-wrap">
        {formatContent(cleanedContent)}
      </div>
    </div>
  );
};

export default ChatMessage;
