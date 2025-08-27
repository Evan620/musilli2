import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationService, ProviderNotification } from '@/lib/supabase-notifications';

interface NotificationContextType {
  notifications: ProviderNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ProviderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications when user changes
  useEffect(() => {
    if (user && user.role === 'provider') {
      loadNotifications();
      
      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribeToProviderNotifications(
        user.id,
        (updatedNotifications) => {
          setNotifications(updatedNotifications);
          setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
        }
      );

      return unsubscribe;
    } else {
      // Clear notifications if user is not a provider
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user || user.role !== 'provider') return;

    setIsLoading(true);
    try {
      console.log('🔄 Loading provider notifications...');
      
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getProviderNotifications(user.id),
        notificationService.getUnreadNotificationCount(user.id)
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      
      console.log('✅ Loaded', notificationsData.length, 'notifications,', unreadCountData, 'unread');
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const result = await notificationService.markNotificationAsRead(notificationId, user.id);
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const result = await notificationService.markAllNotificationsAsRead(user.id);
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
