
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AppSidebar from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading, profile } = useAuth();
  
  // Перенаправляем неавторизованного пользователя на страницу входа
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-2xl font-bold">Профиль пользователя</h1>
          
          <Card className="p-6 shadow-sm">
            <CardHeader>
              <CardTitle>Информация о пользователе</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="mt-2">
                <p>
                  <span className="font-medium">Email: </span>
                  {user.email}
                </p>
              </div>
              
              {user.user_metadata?.name && (
                <div className="mt-2">
                  <p>
                    <span className="font-medium">Имя: </span>
                    {user.user_metadata.name}
                  </p>
                </div>
              )}
            </CardContent>
            
            <div className="mt-8 px-6 pb-6">
              <Button 
                variant="destructive" 
                onClick={() => {
                  signOut();
                  navigate('/login');
                }}
              >
                Выйти из системы
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
