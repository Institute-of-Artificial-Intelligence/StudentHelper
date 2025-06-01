
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    // Получаем текущую сессию при инициализации
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          console.log('Initial session found');
          setSession(currentSession);
          setUser(currentSession.user);
          initializedRef.current = true;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Устанавливаем слушатель изменений состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        
        // Игнорируем INITIAL_SESSION событие, так как мы уже обработали его выше
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        // Для SIGNED_IN событий проверяем, не была ли уже установлена сессия
        if (event === 'SIGNED_IN') {
          // Если пользователь уже авторизован и это тот же пользователь, игнорируем
          if (initializedRef.current && user && newSession?.user?.id === user.id) {
            console.log('User already signed in, ignoring duplicate SIGNED_IN event');
            return;
          }
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user && !initializedRef.current) {
          initializedRef.current = true;
        } else if (!newSession?.user) {
          initializedRef.current = false;
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return {
    user,
    session,
    loading
  };
};
