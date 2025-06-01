
import React from 'react';

export interface QuickReplyOption {
  id: string;
  text: string;
}

interface QuickReplyProps {
  options: QuickReplyOption[];
  onSelect: (option: QuickReplyOption) => void;
}

const QuickReply: React.FC<QuickReplyProps> = ({ options, onSelect }) => {
  if (!options.length) return null;
  
  return (
    <div className="flex flex-wrap gap-2 my-3 animate-fade-in">
      {options.map((option) => (
        <button
          key={option.id}
          className="quick-reply-btn"
          onClick={() => onSelect(option)}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};

export default QuickReply;
