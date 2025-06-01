import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
interface HelpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
const HelpDialog: React.FC<HelpDialogProps> = ({
  isOpen,
  onOpenChange
}) => {
  const isMobile = useIsMobile();
  return <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] m-2' : 'max-w-3xl max-h-[85vh]'} overflow-hidden`}>
        <DialogHeader>
          <DialogTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Справка</DialogTitle>
          <DialogDescription className={`${isMobile ? 'text-sm' : 'text-lg'}`}>
            Информация о проекте и его возможностях
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className={`${isMobile ? 'max-h-[calc(90vh-80px)]' : 'max-h-[calc(85vh-100px)]'} pr-4`}>
          <div className={`space-y-${isMobile ? '4' : '6'} py-2`}>
            <section>
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-primary mb-3`}>Умный помощник для абитуриентов – ваш гид в мире высшего образования</h3>
              
              <div className="mb-4">
                <p className={`font-semibold mb-2 ${isMobile ? 'text-sm' : ''}`}>Описание проекта:</p>
                <p className={`text-muted-foreground mb-4 ${isMobile ? 'text-xs' : ''}`}>
                  Мы разработали интеллектуального чат-бота, который помогает абитуриентам находить актуальную информацию о вузах, программах обучения, вступительных экзаменах и других важных аспектах поступления. Бот использует современные языковые модели и векторные базы данных для точных и развернутых ответов.
                </p>
              </div>

              <div className="mb-4">
                <p className={`font-semibold mb-2 ${isMobile ? 'text-sm' : ''}`}>Ключевые возможности:</p>
                <ul className={`space-y-2 text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                  <li className="flex items-start">
                    <span className="text-green-500 font-bold mr-2">✅</span>
                    <span><span className="font-semibold">Поиск информации о вузах</span> – рейтинги, факультеты, проходные баллы.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-bold mr-2">✅</span>
                    <span><span className="font-semibold">Ответы на частые вопросы</span> – условия поступления, сроки подачи документов, стипендии.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-bold mr-2">✅</span>
                    <span><span className="font-semibold">Персонализированные рекомендации</span> – подбор университета на основе интересов и ЕГЭ.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 font-bold mr-2">✅</span>
                    <span><span className="font-semibold">Гибкая система подписок</span> – бесплатный доступ с ограниченным числом запросов и расширенные возможности для платных пользователей.</span>
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <p className={`font-semibold mb-2 ${isMobile ? 'text-sm' : ''}`}>Технологии:</p>
                <ul className={`space-y-2 text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span><span className="font-semibold">Frontend:</span> React (интуитивно понятный интерфейс)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span><span className="font-semibold">Backend:</span> Flask (гибкость и масштабируемость)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span><span className="font-semibold">ИИ-модели:</span> интеграция языковых моделей для обработки запросов</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 font-bold mr-2">🔹</span>
                    <span><span className="font-semibold">Хранение данных:</span> векторное хранилище для быстрого поиска информации</span>
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <p className={`font-semibold mb-2 ${isMobile ? 'text-sm' : ''}`}>Разработка:</p>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                  Проект создан командой студентов-разработчиков из технического университета Санкт-Петербурга, что обеспечило глубокое понимание потребностей абитуриентов и актуальность данных.
                </p>
              </div>

              <div className="mb-4">
                <p className={`font-semibold mb-2 ${isMobile ? 'text-sm' : ''}`}>Бизнес-модель:</p>
                <ul className={`space-y-2 text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                  <li className="flex items-start">
                    <span className="text-orange-500 font-bold mr-2">🔸</span>
                    <span><span className="font-semibold">Бесплатный доступ</span> с базовыми функциями</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 font-bold mr-2">🔸</span>
                    <span><span className="font-semibold">Платная подписка</span> – увеличенное количество запросов, приоритетная поддержка, расширенная аналитика</span>
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <p className={`font-semibold mb-2 ${isMobile ? 'text-sm' : ''}`}>Почему это выгодно?</p>
                <ul className={`space-y-2 text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                  <li className="flex items-start">
                    <span className="text-purple-500 font-bold mr-2">📌</span>
                    <span>Помогает абитуриентам принимать осознанные решения</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 font-bold mr-2">📌</span>
                    <span>Снижает нагрузку на приёмные комиссии вузов</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 font-bold mr-2">📌</span>
                    <span>Может быть адаптирован под конкретные университеты как корпоративное решение</span>
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <p className={`${isMobile ? 'text-xs' : ''}`}>
                  <span className="font-semibold">Хотите внедрить подобный чат-бот для вашего образовательного проекта?</span><br />
                  Мы готовы доработать решение под ваши требования! 🚀
                </p>
              </div>

              <div className={`text-center border-t pt-4 my-0 py-[15px] ${isMobile ? 'text-sm' : ''}`}>
                <p className="font-semibold text-primary my-[5px] py-[5px]">
                  📩 Свяжитесь с нами для сотрудничества!
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>;
};
export default HelpDialog;