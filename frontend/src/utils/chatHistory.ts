
import { supabase } from '@/integrations/supabase/client';

export interface ChatHistoryMessage {
  id: number;
  text: string;
  author: string;
  created_at: string;
  user_id: string;
}

export const loadChatHistory = async (userId: string): Promise<ChatHistoryMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading chat history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in loadChatHistory:', error);
    return [];
  }
};

export const saveMessageToHistory = async (
  userId: string,
  text: string,
  author: 'user' | 'bot'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        text: text,
        author: author
      });

    if (error) {
      console.error('Error saving message to history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveMessageToHistory:', error);
    return false;
  }
};
