import React from 'react';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  content: string;
  isBot: boolean;
  animate?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isBot, animate = false }) => {
  const baseClass = "chat-message";
  const typeClass = isBot ? "chat-message-bot" : "chat-message-user";
  const animationClass = animate ? "animate-fade-in" : "";

  const formatContent = (text: string) => {
    const cleanedText = text
      .replace(/<think>.*?<\/think>\s*/gs, '') 
      .replace(/\n{3,}/g, '\n\n');

    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*([^*]+)\*/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Обработка ссылок
    let match;
    while ((match = markdownLinkRegex.exec(cleanedText)) !== null) {
      const [fullMatch, linkText, url] = match;
      const matchStart = match.index;

      // Текст до ссылки
      const beforeText = cleanedText.slice(lastIndex, matchStart).replace(/[()]/g, '');
      if (beforeText) {
        let tempText = beforeText;
        tempText = tempText.replace(boldRegex, (_, content) => `<strong>${content}</strong>`);
        tempText = tempText.replace(italicRegex, (_, content) => `<em>${content}</em>`);

        const parts = tempText.split(/(<strong>.*?<\/strong>|<em>.*?<\/em>)/g).filter(Boolean);
        parts.forEach((part, i) => {
          if (part.startsWith('<strong>')) {
            const content = part.slice(8, -9);
            elements.push(<strong key={`bold-${lastIndex}-${i}`}>{content}</strong>);
          } else if (part.startsWith('<em>')) {
            const content = part.slice(4, -5);
            elements.push(<em key={`italic-${lastIndex}-${i}`}>{content}</em>);
          } else {
            elements.push(<span key={`text-${lastIndex}-${i}`}>{part}</span>);
          }
        });
      }

      // Добавляем ссылку
      elements.push(
        <span key={`link-${lastIndex}`} className="inline-flex items-center gap-1">
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

    // Обработка оставшегося текста
    const remainingText = cleanedText.slice(lastIndex).replace(/[()]/g, '');
    if (remainingText) {
      let tempText = remainingText;
      tempText = tempText.replace(boldRegex, (_, content) => `<strong>${content}</strong>`);
      tempText = tempText.replace(italicRegex, (_, content) => `<em>${content}</em>`);

      const parts = tempText.split(/(<strong>.*?<\/strong>|<em>.*?<\/em>)/g).filter(Boolean);
      parts.forEach((part, i) => {
        if (part.startsWith('<strong>')) {
          const content = part.slice(8, -9);
          elements.push(<strong key={`bold-end-${i}`}>{content}</strong>);
        } else if (part.startsWith('<em>')) {
          const content = part.slice(4, -5);
          elements.push(<em key={`italic-end-${i}`}>{content}</em>);
        } else {
          elements.push(<span key={`text-end-${i}`}>{part}</span>);
        }
      });
    }

    return elements;
  };

  return (
    <div className={cn(baseClass, typeClass, animationClass)}>
      <div className="p-4 whitespace-pre-wrap">{formatContent(content)}</div>
    </div>
  );
};

export default ChatMessage;
