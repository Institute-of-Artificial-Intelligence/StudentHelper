import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import UniversityLogo from '@/components/UniversityLogo';
import { getBotResponse, sendMessageToBackend } from '@/utils/chatUtils';
import { Card } from '@/components/ui/card';
import { Book, Calendar, Search } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      addBotMessage("Привет! Я твой помощник по поступлению в универ. Расскажи, что тебя интересует — документы, экзамены, факультеты? Постараюсь помочь со всем, что тебя волнует! 😊");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const addUserMessage = (content: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), content, isBot: false }
    ]);
    handleUserMessage(content);
  };

  const addBotMessage = (content: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), content, isBot: true }
    ]);
  };

  const handleUserMessage = (message: string) => {
    setIsTyping(true);
    
    sendMessageToBackend(message)
      .then(response => {
        addBotMessage(response);
        setIsTyping(false);
      })
      .catch(error => {
        console.error("Error getting response from backend:", error);
        const fallbackResponse = getBotResponse(message);
        addBotMessage(fallbackResponse.text);
        setIsTyping(false);
      });
  };

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-edu-pattern">
        <Card className="max-w-3xl w-full p-8 shadow-lg bg-white/95 backdrop-blur-sm">
          <div className="mb-6 flex flex-col items-center">
            <UniversityLogo />
            <h1 className="text-3xl font-bold text-edu-primary mt-4">Виртуальный помощник абитуриента</h1>
            <p className="text-edu-dark/70 mt-2">Ваш гид в мире высшего образования</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-edu-light p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
              <Search className="text-edu-secondary mb-2" size={28} />
              <h3 className="font-medium text-edu-primary">Информация о поступлении</h3>
              <p className="text-sm text-edu-dark/70 mt-1">Ответы на вопросы о процессе поступления</p>
            </div>
            
            <div className="bg-edu-light p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
              <Calendar className="text-edu-secondary mb-2" size={28} />
              <h3 className="font-medium text-edu-primary">Важные даты</h3>
              <p className="text-sm text-edu-dark/70 mt-1">Сроки подачи документов и зачисления</p>
            </div>
            
            <div className="bg-edu-light p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
              <Book className="text-edu-secondary mb-2" size={28} />
              <h3 className="font-medium text-edu-primary">Программы обучения</h3>
              <p className="text-sm text-edu-dark/70 mt-1">Информация о факультетах и специальностях</p>
            </div>
          </div>
          
          <button 
            onClick={handleStartChat} 
            className="w-full py-3 bg-edu-secondary text-white rounded-lg hover:bg-edu-secondary/90 transition-colors font-medium animate-pulse-slow"
          >
            Начать консультацию
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-edu-pattern">
      <header className="bg-edu-primary text-white py-3 px-6 shadow-md">
        <div className="flex items-center w-[75%] mx-auto">
          <UniversityLogo />
          <div className="ml-3">
            <h1 className="font-bold">Виртуальный помощник абитуриента</h1>
            <p className="text-xs opacity-80">Онлайн консультация по вопросам поступления</p>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col w-[75%] mx-auto p-4">
        <Card className="flex-1 flex flex-col bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                content={message.content} 
                isBot={message.isBot}
                animate={true}
              />
            ))}
            
            {isTyping && (
              <div className="chat-message chat-message-bot">
                <div className="typing-indicator">
                  <div className="flex items-center">
                    <span className="typing-dot typing-dot-1"></span>
                    <span className="typing-dot typing-dot-2"></span>
                    <span className="typing-dot typing-dot-3"></span>
                    <span className="typing-text">Печатает...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <ChatInput onSend={addUserMessage} disabled={isTyping} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
