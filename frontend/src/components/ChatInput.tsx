
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');
  const { hasActiveSubscription, remainingRequests } = useAuth();
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && remainingRequests > 0) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && remainingRequests > 0) {
        onSend(message);
        setMessage('');
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Задайте вопрос о поступлении... (Enter для отправки, Shift+Enter для новой строки)"
          className="min-h-[60px] w-full resize-none bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 rounded-lg pr-16 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled || remainingRequests <= 0}
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled || remainingRequests <= 0}
          className="absolute right-2 bottom-2 h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center"
        >
          <Send size={18} />
        </Button>
      </form>
      
      <div className={`mt-2 text-sm ${isMobile ? 'text-left' : 'text-right'} text-gray-500 dark:text-gray-400`}>
        Осталось запросов: <span className="font-medium">{remainingRequests}</span>
        {!hasActiveSubscription && remainingRequests > 0 && (
          <span className="ml-1 text-orange-500"> (без подписки)</span>
        )}
      </div>
      
      {remainingRequests <= 0 && (
        <div className={`mt-1 text-sm ${isMobile ? 'text-left' : 'text-right'} text-red-500`}>
          Для получения дополнительных запросов оформите подписку
        </div>
      )}
    </div>
  );
};

export default ChatInput;
