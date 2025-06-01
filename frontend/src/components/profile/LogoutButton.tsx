
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

interface LogoutButtonProps {
  onSignOut: () => Promise<void>;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    onSignOut();
    navigate('/login');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" type="button">
          Выход из системы
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Выход из системы</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите выйти из своей учетной записи?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut}>
            Выйти
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
