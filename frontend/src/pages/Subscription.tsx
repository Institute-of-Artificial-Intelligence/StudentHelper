
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import AppSidebar from '@/components/AppSidebar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { toast } from '@/components/ui/use-toast';

const Subscription = () => {
  const { user, profile, loading } = useAuth();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const SUBSCRIPTION_AMOUNT = 300; // Зафиксированная сумма подписки

  useEffect(() => {
    if (paymentInitiated) {
      // Load the Tinkoff payment script
      const script = document.createElement('script');
      script.src = "https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js";
      script.async = true;
      document.body.appendChild(script);

      // Generate a random order number for each session
      const orderInput = document.querySelector('input[name="order"]') as HTMLInputElement;
      if (orderInput) {
        const orderNumber = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        orderInput.value = orderNumber;
      }

      // Set description based on the subscription
      const descriptionInput = document.querySelector('input[name="description"]') as HTMLInputElement;
      if (descriptionInput) {
        descriptionInput.value = "Платная подписка на 30 дней";
      }

      // Pre-fill user information if available
      if (user && profile) {
        const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;

        if (nameInput && profile.name) {
          nameInput.value = profile.name;
        }
        
        if (emailInput && user.email) {
          emailInput.value = user.email;
        }
        
        if (phoneInput && profile.phone) {
          phoneInput.value = profile.phone;
        }
      }

      return () => {
        // Clean up the script when component unmounts
        document.body.removeChild(script);
      };
    }
  }, [user, profile, paymentInitiated]);

  const handleInitiatePayment = () => {
    setPaymentInitiated(true);
    
    // Небольшая задержка для обеспечения загрузки скрипта
    setTimeout(() => {
      const form = document.querySelector('form[name="payform-tbank"]') as HTMLFormElement;
      
      if (form) {
        // Проверка суммы перед отправкой
        const amountInput = form.querySelector('input[name="amount"]') as HTMLInputElement;
        
        if (amountInput && parseInt(amountInput.value) !== SUBSCRIPTION_AMOUNT) {
          toast({
            title: "Ошибка",
            description: "Обнаружена попытка изменения суммы платежа. Платеж отменен.",
            variant: "destructive"
          });
          return;
        }
        
        try {
          // @ts-ignore - использование глобальной функции pay из скрипта Tinkoff
          window.pay(form);
        } catch (error) {
          toast({
            title: "Ошибка",
            description: "Не удалось инициализировать платеж. Попробуйте позже.",
            variant: "destructive"
          });
          console.error("Payment error:", error);
        }
      }
    }, 1000);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <AppSidebar />
        
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-6 text-2xl font-bold">Платная подписка</h1>
            
            <Card className="p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Преимущества платной подписки:</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><b>AI-анализ вашего профиля:</b> Оценка шансов на поступление в выбранные вузы на основе среднего балла ЕГЭ, портфолио и конкурсной ситуации.</li>
                  <li><b>Календарь абитуриента:</b> Информация о датах подачи документов, экзаменах и олимпиадах.</li>
                  <li><b>База данных вузов:</b> Актуальные проходные баллы, список специальностей, контакты приёмных комиссий.</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <p className="font-medium mb-2">Стоимость подписки: {SUBSCRIPTION_AMOUNT} руб. за 30 дней</p>
              </div>
              
              {!paymentInitiated ? (
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md"
                  onClick={handleInitiatePayment}
                >
                  Оформить подписку
                </button>
              ) : (
                <div className="mt-6">
                  <style>
                    {`
                    .payform-tbank {
                      display: -webkit-box;
                      display: -ms-flexbox;
                      display: flex;
                      margin: 2px auto;
                      -webkit-box-orient: vertical;
                      -webkit-box-direction: normal;
                      -ms-flex-direction: column;
                      flex-direction: column;
                      max-width: 100%;
                      width: 100%;
                    }
                    .payform-tbank-row {
                      margin: 2px;
                      border-radius: 4px;
                      -webkit-box-flex: 1;
                      -ms-flex: 1;
                      flex: 1;
                      -webkit-transition: 0.3s;
                      -o-transition: 0.3s;
                      transition: 0.3s;
                      border: 1px solid #DFE3F3;
                      padding: 15px;
                      outline: none;
                      background-color: #DFE3F3;
                      font-size: 15px;
                    }
                    .payform-tbank-row:focus {
                      background-color: #FFFFFF;
                      border: 1px solid #616871;
                      border-radius: 4px;
                    }
                    .payform-tbank-btn {
                      background-color: #FBC520;
                      border: 1px solid #FBC520;
                      color: #3C2C0B;
                      cursor: pointer;
                      font-weight: 600;
                    }
                    .payform-tbank-btn:hover {
                      background-color: #FAB619;
                      border: 1px solid #FAB619;
                    }
                    `}
                  </style>
                  
                  <form className="payform-tbank" name="payform-tbank">
                    {/* Указывается значение терминала */}
                    <input className="payform-tbank-row" type="hidden" name="terminalkey" value="1744273478496DEMO" />
                    {/* Указывается открытие в модальном окне (не рекомендуется true) */}
                    <input className="payform-tbank-row" type="hidden" name="frame" value="false" />
                    {/* Язык страницы оплаты (стоит русский) */}
                    <input className="payform-tbank-row" type="hidden" name="language" value="ru" />
                    {/* Параметры оплачивающего человека (установим самостоятельно) */}
                    <input className="payform-tbank-row" type="hidden" name="amount" value={SUBSCRIPTION_AMOUNT.toString()} readOnly />
                    <input className="payform-tbank-row" type="hidden" name="order" />
                    <input className="payform-tbank-row" type="hidden" name="description" />
                    <input className="payform-tbank-row" type="text" placeholder="ФИО плательщика" name="name" required />
                    <input className="payform-tbank-row" type="email" placeholder="E-mail" name="email" required />
                    <input className="payform-tbank-row" type="tel" placeholder="Контактный телефон" name="phone" required />
                    {/* Кнопка оплаты */}
                    <button 
                      className="payform-tbank-row payform-tbank-btn" 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        // Проверка суммы перед отправкой
                        const form = e.currentTarget.closest('form') as HTMLFormElement;
                        const amountInput = form.querySelector('input[name="amount"]') as HTMLInputElement;
                        
                        if (amountInput && parseInt(amountInput.value) !== SUBSCRIPTION_AMOUNT) {
                          toast({
                            title: "Ошибка",
                            description: "Обнаружена попытка изменения суммы платежа. Платеж отменен.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        try {
                          // @ts-ignore - использование глобальной функции pay из скрипта Tinkoff
                          window.pay(form);
                        } catch (error) {
                          toast({
                            title: "Ошибка",
                            description: "Не удалось инициализировать платеж. Попробуйте позже.",
                            variant: "destructive"
                          });
                          console.error("Payment error:", error);
                        }
                      }}
                    >
                      Оплатить
                    </button>
                  </form>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Subscription;
