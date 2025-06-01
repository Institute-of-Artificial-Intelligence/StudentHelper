
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useTheme } from 'next-themes';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Toggle 
      onClick={toggleTheme} 
      aria-label="Переключить тему"
      className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white transition-colors"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Toggle>
  );
};

export default ThemeToggle;
