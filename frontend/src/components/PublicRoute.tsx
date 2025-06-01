
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Показываем индикатор загрузки во время проверки авторизации
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Если пользователь уже авторизован, перенаправляем на главную страницу
  // Или на страницу, с которой пользователь пытался перейти
  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // Если пользователь не авторизован, показываем публичный контент
  return <>{children}</>;
};

export default PublicRoute;
