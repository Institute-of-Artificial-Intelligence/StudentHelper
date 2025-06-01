
import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Bot, User, HelpCircle, CreditCard, LogOut, Mail, Archive } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import HelpDialog from './HelpDialog';
import SupportDialog from './SupportDialog';

interface AppSidebarProps {
  onShowProfile?: (show: boolean) => void;
  showingProfile?: boolean;
  onShowSubscription?: (show: boolean) => void;
  showingSubscription?: boolean;
  onShowArchive?: (show: boolean) => void;
  showingArchive?: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  onShowProfile,
  showingProfile = false,
  onShowSubscription,
  showingSubscription = false,
  onShowArchive,
  showingArchive = false
}) => {
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (onShowProfile) {
      onShowProfile(true);
      if (onShowSubscription) onShowSubscription(false);
      if (onShowArchive) onShowArchive(false);
    }
  };

  const handleAssistantClick = () => {
    if (onShowProfile) {
      onShowProfile(false);
      if (onShowSubscription) onShowSubscription(false);
      if (onShowArchive) onShowArchive(false);
    }
  };

  const handleSubscriptionClick = () => {
    if (onShowSubscription) {
      onShowSubscription(true);
      if (onShowProfile) onShowProfile(false);
      if (onShowArchive) onShowArchive(false);
    }
  };

  const handleArchiveClick = () => {
    if (onShowArchive) {
      onShowArchive(true);
      if (onShowProfile) onShowProfile(false);
      if (onShowSubscription) onShowSubscription(false);
    }
  };

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  const handleSupportClick = () => {
    setIsSupportOpen(true);
  };

  return <>
      <Sidebar>
        <SidebarHeader>
          <div className="px-4 py-4">
            <h2 className="text-sm font-medium text-center text-sidebar-foreground">
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 pt-12 py-[30px]">
          <SidebarMenu className="px-0">
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Виртуальный помощник" isActive={!showingProfile && !showingSubscription && !showingArchive} onClick={handleAssistantClick}>
                <Bot />
                <span>Виртуальный помощник</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Архив сообщений" isActive={showingArchive} onClick={handleArchiveClick}>
                <Archive />
                <span>Архив сообщений</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Профиль" isActive={showingProfile} onClick={handleProfileClick}>
                <User />
                <span>Профиль</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Платная подписка" isActive={showingSubscription} onClick={handleSubscriptionClick}>
                <CreditCard />
                <span>Платная подписка</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Поддержка" onClick={handleSupportClick}>
                <Mail />
                <span>Поддержка</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Справка" onClick={handleHelpClick}>
                <HelpCircle />
                <span>Справка</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="mb-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-sidebar-foreground">
              <span>Ты справишься, а мы поможем!</span>
            </div>
          </div>
          {user ? <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{profile?.name || 'Пользователь'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleSignOut} className="rounded-full p-1 hover:bg-muted" title="Выйти">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div> : <div className="space-y-2">
              <Link to="/login" className="w-full">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2">
                  <User className="h-4 w-4" />
                  <span>Войти в систему</span>
                </button>
              </Link>
            </div>}
        </SidebarFooter>
      </Sidebar>

      <HelpDialog isOpen={isHelpOpen} onOpenChange={setIsHelpOpen} />
      
      <SupportDialog isOpen={isSupportOpen} onOpenChange={setIsSupportOpen} />
    </>;
};

export default AppSidebar;
