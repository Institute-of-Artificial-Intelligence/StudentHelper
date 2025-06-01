import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { getBotResponse, sendMessageToBackend } from '@/utils/chatUtils';
import { Sidebar, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProfileFormValues } from '@/components/profile/ProfileFormTypes';
import SubscriptionTab from '@/components/SubscriptionTab';
import ChatArchive from '@/components/ChatArchive';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const {
    user,
    profile,
    loading,
    updateProfile,
    profileLoading,
    hasActiveSubscription,
    remainingRequests,
    useRequest
  } = useAuth();
  
  const navigate = useNavigate();
  
  const toggleShowProfile = (show: boolean) => {
    setShowProfile(show);
  };

  const toggleShowSubscription = (show: boolean) => {
    setShowSubscription(show);
  };

  const toggleShowArchive = (show: boolean) => {
    setShowArchive(show);
  };

  // Эффект для скролла к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // Эффект для приветственного сообщения только во вкладке ассистента
  useEffect(() => {
    if (!showProfile && !showSubscription && !showArchive && !welcomeShown && user) {
      const timer = setTimeout(() => {
        addBotMessage("Привет! Я ваш ассистент по поступлению в универ. Расскажи, что тебя интересует — документы, экзамены, факультеты? Постараюсь помочь со всем, что тебя волнует! 😊");
        setWelcomeShown(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showProfile, showSubscription, showArchive, welcomeShown, user]);

  // Сброс состояния чата при переключении на вкладку ассистента
  useEffect(() => {
    if (!showProfile && !showSubscription && !showArchive) {
      setMessages([]);
      setWelcomeShown(false);
    }
  }, [showProfile, showSubscription, showArchive]);

  // Эффект для обязательных полей профиля
  useEffect(() => {
    // Проверяем наличие обязательных полей профиля
    if (user && profile) {
      const isMissingData = !profile.user_type || !profile.phone || !profile.school || !profile.referral_source;
      if (isMissingData && !showProfile) {
        setShowProfile(true);
        toast.info("Пожалуйста, заполните все обязательные поля профиля");
      }
    }
  }, [user, profile, showProfile]);
  
  const addUserMessage = async (content: string) => {
    if (!user || isProcessingRequest) return;
    
    // Проверяем, может ли пользователь сделать запрос
    if (!useRequest()) {
      return;
    }
    
    setIsProcessingRequest(true);
    
    // Добавляем сообщение пользователя только в локальный интерфейс
    const userMessage = {
      id: Date.now().toString(),
      content,
      isBot: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    await handleUserMessage(content);
    setIsProcessingRequest(false);
  };
  
  const addBotMessage = async (content: string) => {
    if (!user) return;
    
    // Добавляем ответ бота только в локальный интерфейс
    const botMessage = {
      id: Date.now().toString(),
      content,
      isBot: true
    };
    
    setMessages(prev => [...prev, botMessage]);
  };
  
  const handleUserMessage = async (message: string) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setIsTyping(true);
    
    try {
      const response = await sendMessageToBackend(message, user.id);
      addBotMessage(response);
    } catch (error) {
      console.error("Error getting response from backend:", error);
      try {
        const fallbackResponse = await getBotResponse(message, user.id);
        addBotMessage(fallbackResponse.text);
      } catch (fallbackError) {
        console.error("Fallback response also failed:", fallbackError);
        addBotMessage("Извините, произошла ошибка. Попробуйте еще раз.");
      }
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleProfileUpdate = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const success = await updateProfile(data);
      if (!success) {
        throw new Error("Не удалось обновить профиль");
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка при обновлении профиля");
    } finally {
      setIsUpdating(false);
    }
  };

  // Показываем спиннер во время загрузки
  if (loading || profileLoading) {
    return <LoadingSpinner />;
  }

  // Перенаправляем неавторизованных пользователей
  if (!user) {
    navigate('/login');
    return null;
  }

  // Check if mandatory profile fields are missing
  const isMissingRequiredProfileData = profile && (!profile.user_type || !profile.phone || !profile.school || !profile.referral_source);
  
  return <ThemeProvider attribute="class" defaultTheme="light">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Панель с кнопками в левом верхнем углу */}
          <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 rounded-md shadow-sm p-1 px-[2px]">
            <SidebarTrigger className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white" />
            <ThemeToggle />
          </div>
          
          <AppSidebar 
            onShowProfile={toggleShowProfile} 
            showingProfile={showProfile} 
            onShowSubscription={toggleShowSubscription}
            showingSubscription={showSubscription}
            onShowArchive={toggleShowArchive}
            showingArchive={showArchive}
          />
          
          <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : 'w-[80%]'} mx-auto p-4 pt-14`}>
              {showProfile || isMissingRequiredProfileData ? (
                <div className="flex-1 flex flex-col">
                  <h1 className="mb-6 text-2xl font-bold">Профиль пользователя</h1>
                  
                  <Card className="p-6 shadow-sm">
                    <CardHeader>
                      <CardTitle>Информация о пользователе</CardTitle>
                      {isMissingRequiredProfileData && (
                        <p className="text-orange-500 font-medium mt-2">
                          Пожалуйста, заполните все обязательные поля
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      <ProfileForm profile={profile} onSubmit={handleProfileUpdate} isLoading={isUpdating} />
                    </CardContent>
                  </Card>
                </div>
              ) : showSubscription ? (
                <SubscriptionTab />
              ) : showArchive ? (
                <ChatArchive />
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {!hasActiveSubscription && (
                    <Card className="mb-6 border-orange-300 bg-orange-50 dark:bg-orange-900/20">
                      <CardContent className={`p-4 ${isMobile ? 'flex flex-col' : 'flex items-center justify-between'}`}>
                        <div className={isMobile ? 'mb-3' : ''}>
                          <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                            Бесплатный режим: {remainingRequests} запросов из 5
                          </h3>
                          <p className="text-sm text-orange-700 dark:text-orange-400">
                            Оформите подписку, чтобы получить доступ к 50 запросам в месяц ИИ-ассистенту
                          </p>
                        </div>
                        <Button 
                          variant="default" 
                          className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto" 
                          onClick={() => setShowSubscription(true)}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Оформить подписку
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  
                  {hasActiveSubscription && remainingRequests <= 10 && (
                    <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                      <CardContent className="p-4">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          <span className="font-semibold">Внимание!</span> У вас осталось {remainingRequests} запросов. 
                          При необходимости обновите подписку.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-4">
                    {messages.map(message => (
                      <ChatMessage key={message.id} content={message.content} isBot={message.isBot} animate={true} />
                    ))}
                    
                    {isTyping && (
                      <div className="chat-message chat-message-bot">
                        <div className="typing-indicator">
                          <div className="flex items-center">
                            <span className="typing-dot typing-dot-1"></span>
                            <span className="typing-dot typing-dot-2"></span>
                            <span className="typing-dot typing-dot-3"></span>
                            <span className="typing-text dark:text-gray-300">Печатает...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="p-2 pt-4">
                    <ChatInput onSend={addUserMessage} disabled={isTyping} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>;
};

export default Index;
