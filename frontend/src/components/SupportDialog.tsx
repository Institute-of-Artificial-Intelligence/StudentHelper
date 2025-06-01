
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface SupportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SupportDialog: React.FC<SupportDialogProps> = ({ isOpen, onOpenChange }) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] m-2' : 'max-w-md'}`}>
        <DialogHeader>
          <DialogTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Свяжитесь с нами!</DialogTitle>
        </DialogHeader>
        
        <div className={`space-y-4 py-2 ${isMobile ? 'text-sm' : ''}`}>
          <p className="text-muted-foreground">
            Напишите на почту <span className="font-medium text-foreground">example@mail.ru</span>, и мы оперативно решим ваш вопрос.
          </p>
          <p className="text-muted-foreground">
            Опишите проблему подробно — это поможет нам помочь вам быстрее.
          </p>
          <p className="text-muted-foreground">
            Ответ обычно приходит в течение 1-2 рабочих дней.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;
