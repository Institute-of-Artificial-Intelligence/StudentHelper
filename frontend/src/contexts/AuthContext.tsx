
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Profile } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  hasActiveSubscription: boolean;
  remainingRequests: number;
  useRequest: () => boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: { 
    name?: string | null,
    user_type?: string,
    phone?: string,
    school?: string,
    referral_source?: string
  }) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading } = useAuthState();
  const { signIn, signUp, signOut, resetPassword } = useAuthActions();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [remainingRequests, setRemainingRequests] = useState<number>(0);
  const lastFetchedUserIdRef = useRef<string | null>(null);
  
  // Запрос профиля из Supabase при изменении пользователя
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setHasActiveSubscription(false);
        setRemainingRequests(0);
        lastFetchedUserIdRef.current = null;
        return;
      }
      
      // Проверяем, не загружали ли мы уже профиль для этого пользователя
      if (lastFetchedUserIdRef.current === user.id) {
        console.log('Profile already loaded for user', user.id);
        return;
      }
      
      setProfileLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setProfileLoading(false);
          return;
        }
        
        if (data) {
          setProfile({
            name: data.name || null,
            user_type: data.user_type || '',
            phone: data.phone || '',
            school: data.school || '',
            referral_source: data.referral_source || ''
          });
          
          setHasActiveSubscription(data.subscribe === true);
          setRemainingRequests(data.remaining_requests || 0);
          lastFetchedUserIdRef.current = user.id;
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user]);
  
  // Function to use a request and update the count in the database
  const useRequest = (): boolean => {
    if (remainingRequests > 0) {
      const newRemainingRequests = remainingRequests - 1;
      
      // Update the remaining requests in the database
      if (user) {
        supabase
          .from('profiles')
          .update({ remaining_requests: newRemainingRequests })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating remaining requests:', error);
            }
          });
      }
      
      // Update the state
      setRemainingRequests(newRemainingRequests);
      return true;
    }
    
    if (remainingRequests <= 0) {
      toast.error("У вас закончились доступные запросы. Обновите подписку, чтобы продолжить.");
      return false;
    }
    
    return false;
  };
  
  // Функция обновления профиля пользователя
  const updateProfile = async (data: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) {
        toast.error(error.message || 'Ошибка при обновлении профиля');
        return false;
      }
      
      // Обновляем локальное состояние
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Профиль успешно обновлен');
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Ошибка при обновлении профиля');
      return false;
    }
  };
  
  const contextValue = {
    user,
    session,
    loading,
    profile,
    profileLoading,
    hasActiveSubscription,
    remainingRequests,
    useRequest,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };
  
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
