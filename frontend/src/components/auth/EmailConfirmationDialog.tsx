
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailConfirmationDialog: React.FC<EmailConfirmationDialogProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Подтвердите почту
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Вам на почту был отправлен запрос на подтверждение. Вы зайдете сразу после подтверждения почты.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button onClick={onClose} className="w-full">
            Понятно
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
