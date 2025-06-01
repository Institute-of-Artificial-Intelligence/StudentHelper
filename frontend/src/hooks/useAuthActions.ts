
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = () => {
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Проверяем, если ошибка связана с неподтвержденной почтой
        if (error.message === 'Email not confirmed') {
          toast.error('Пожалуйста подтвердите почту по ссылке в письме');
        } else {
          toast.error(error.message || 'Ошибка при входе');
        }
        return false;
      }
      
      toast.success('Вы успешно вошли в систему');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при входе');
      return false;
    }
  };
  
  const signUp = async (
    email: string, 
    password: string, 
    userData: { 
      name?: string | null,
      user_type?: string,
      phone?: string,
      school?: string,
      referral_source?: string
    }
  ): Promise<boolean> => {
    try {
      // Проверяем, существует ли пользователь с таким email
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            user_type: userData.user_type,
            phone: userData.phone,
            school: userData.school,
            referral_source: userData.referral_source
          }
        }
      });
      
      if (signUpError) {
        // Проверяем ошибку о минимальной длине пароля
        if (signUpError.message.includes('Password should be at least')) {
          toast.error('Пароль должен содержать не менее 6 символов');
        } else if (signUpError.message.toLowerCase().includes('email already') || 
            signUpError.message.toLowerCase().includes('already registered')) {
          toast.error('Пользователь с таким email уже существует');
        } else {
          toast.error(signUpError.message || 'Ошибка при регистрации');
        }
        return false;
      }
      
      // Проверка, если пользователь уже существует
      if (data.user?.identities?.length === 0) {
        toast.error('Пользователь с таким email уже существует');
        return false;
      }
      
      if (!data.user) {
        toast.error('Ошибка: не удалось создать пользователя');
        return false;
      }
      
      console.log('User created with ID:', data.user.id);
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Проверяем сообщение об ошибке на наличие ключевых слов о минимальной длине пароля
      if (error.message && error.message.includes('Password should be at least')) {
        toast.error('Пароль должен содержать не менее 6 символов');
      } else if (error.message && (
        error.message.toLowerCase().includes('already') || 
        error.message.toLowerCase().includes('существует') ||
        error.message.toLowerCase().includes('exist')
      )) {
        toast.error('Пользователь с таким email уже существует');
      } else {
        toast.error(error.message || 'Ошибка при регистрации');
      }
      return false;
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.info('Вы вышли из системы');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при выходе из системы');
    }
  };
  
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message || 'Ошибка при сбросе пароля');
        return false;
      }
      
      toast.success('Инструкции по сбросу пароля отправлены на почту');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при сбросе пароля');
      return false;
    }
  };
  
  return {
    signIn,
    signUp,
    signOut,
    resetPassword
  };
};
