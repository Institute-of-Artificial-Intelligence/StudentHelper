import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionTab: React.FC = () => {
  const {
    user,
    profile
  } = useAuth();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const SUBSCRIPTION_AMOUNT = 300; // Фиксированная сумма подписки

  useEffect(() => {
    if (paymentInitiated) {
      // Загружаем скрипт Tinkoff для оплаты
      const script = document.createElement('script');
      script.src = "https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js";
      script.async = true;
      document.body.appendChild(script);

      // Генерируем случайный номер заказа для каждой сессии
      const orderInput = document.querySelector('input[name="order"]') as HTMLInputElement;
      if (orderInput) {
        const orderNumber = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        orderInput.value = orderNumber;
      }

      // Устанавливаем описание подписки
      const descriptionInput = document.querySelector('input[name="description"]') as HTMLInputElement;
      if (descriptionInput) {
        descriptionInput.value = "Платная подписка на 30 дней";
      }

      // Предзаполняем информацию о пользователе, если она доступна
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
        // Очищаем скрипт при размонтировании компонента
        document.body.removeChild(script);
      };
    }
  }, [user, profile, paymentInitiated]);
  const handleInitiatePayment = async () => {
    setIsLoading(true);
    try {
      // Генерируем номер заказа
      const orderNumber = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Проверяем, что у нас есть ID пользователя
      if (!user || !user.id) {
        toast.error("Не удалось определить пользователя. Пожалуйста, войдите в систему.");
        setIsLoading(false);
        return;
      }

      // Отправляем POST запрос на сервер
      const response = await fetch('https://postupi.site/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user.id,
          order_id: orderNumber
        })
      });
      if (!response.ok) {
        throw new Error("Ошибка при создании заказа");
      }

      // Продолжаем с платежом Tinkoff после успешной отправки заказа
      setPaymentInitiated(true);

      // Небольшая задержка для обеспечения загрузки скрипта
      setTimeout(() => {
        const form = document.querySelector('form[name="payform-tbank"]') as HTMLFormElement;
        if (form) {
          // Устанавливаем номер заказа в форме
          const orderInput = form.querySelector('input[name="order"]') as HTMLInputElement;
          if (orderInput) {
            orderInput.value = orderNumber;
          }

          // Проверка суммы перед отправкой
          const amountInput = form.querySelector('input[name="amount"]') as HTMLInputElement;
          if (amountInput && parseInt(amountInput.value) !== SUBSCRIPTION_AMOUNT) {
            toast.error("Обнаружена попытка изменения суммы платежа. Платеж отменен.");
            setIsLoading(false);
            return;
          }
          try {
            // @ts-ignore - использование глобальной функции pay из скрипта Tinkoff
            window.pay(form);
            setIsLoading(false);
          } catch (error) {
            toast.error("Не удалось инициализировать платеж. Попробуйте позже.");
            console.error("Payment error:", error);
            setIsLoading(false);
          }
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending order data:", error);
      toast.error("Произошла ошибка. Пожалуйста, попробуйте позже.");
      setIsLoading(false);
      setPaymentInitiated(false);
    }
  };
  return <div className="flex-1 flex flex-col">
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
        
        <div className="flex justify-start">
          {!paymentInitiated ? <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={handleInitiatePayment} disabled={isLoading}>
              {isLoading ? <>
                  <LoadingSpinner size="sm" /> 
                  Обработка...
                </> : 'Оформить подписку'}
            </Button> : <div className="w-full">
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
                {/* Значение терминала */}
                <input className="payform-tbank-row" type="hidden" name="terminalkey" value="1744273478496DEMO" />
                {/* Открытие в модальном окне */}
                <input className="payform-tbank-row" type="hidden" name="frame" value="false" />
                {/* Язык страницы оплаты */}
                <input className="payform-tbank-row" type="hidden" name="language" value="ru" />
                {/* Параметры оплаты */}
                <input className="payform-tbank-row" type="hidden" name="amount" value={SUBSCRIPTION_AMOUNT.toString()} readOnly />
                <input className="payform-tbank-row" type="hidden" name="order" />
                <input className="payform-tbank-row" type="hidden" name="description" />
                <input className="payform-tbank-row" type="hidden" placeholder="ФИО плательщика" name="name" required />
                <input className="payform-tbank-row" type="hidden" placeholder="E-mail" name="email" required />
                <input className="payform-tbank-row" type="hidden" placeholder="Контактный телефон" name="phone" required />
                {/* Кнопка оплаты */}
                <button className="payform-tbank-row payform-tbank-btn" type="button" style={{
              display: "none"
            }} onClick={(e) => {
              e.preventDefault();
              // Проверка суммы перед отправкой
              const form = e.currentTarget.closest('form') as HTMLFormElement;
              const amountInput = form.querySelector('input[name="amount"]') as HTMLInputElement;
              if (amountInput && parseInt(amountInput.value) !== SUBSCRIPTION_AMOUNT) {
                toast.error("Обнаружена попытка изменения суммы платежа. Платеж отменен.");
                return;
              }
              try {
                // @ts-ignore - использование глобальной функции pay из скрипта Tinkoff
                window.pay(form);
              } catch (error) {
                toast.error("Не удалось инициализировать платеж. Попробуйте позже.");
                console.error("Payment error:", error);
              }
            }}>
                  Переадресация на страницу оплаты...
                </button>
              </form>
            </div>}
        </div>
      </Card>
    </div>;
};

export default SubscriptionTab;
