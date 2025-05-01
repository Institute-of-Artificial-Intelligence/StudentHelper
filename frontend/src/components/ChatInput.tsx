import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Задайте вопрос о поступлении..."
          className="pr-10 bg-white border-edu-primary/20 focus:border-edu-primary focus:ring-edu-primary"
          disabled={disabled}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-edu-primary/50" size={18} />
      </div>
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className="bg-edu-secondary hover:bg-edu-secondary/90 text-white"
      >
        Отправить
      </Button>
    </form>
  );
};

export default ChatInput;
