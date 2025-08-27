import { supabase } from './supabase';

export interface ProviderNotification {
  id: string;
  providerId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: Date;
  readAt?: Date;
}

export const notificationService = {
  // Get provider notifications
  async getProviderNotifications(userId: string): Promise<ProviderNotification[]> {
    try {
      console.log('🔍 Fetching provider notifications for user:', userId);

      const { data, error } = await supabase
        .from('provider_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching provider notifications:', error);
        return [];
      }

      console.log('✅ Loaded', data?.length || 0, 'provider notifications');
      return data?.map(this.transformNotificationData) || [];
    } catch (error) {
      console.error('Error fetching provider notifications:', error);
      return [];
    }
  },

  // Get unread notification count
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_provider_unread_notifications_count', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Error getting unread count:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('mark_provider_notification_read', {
        p_notification_id: notificationId,
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Notification not found or not authorized' };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Exception marking notification as read:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('provider_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Exception marking all notifications as read:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Create notification (admin only)
  async createProviderNotification(notification: {
    providerId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('provider_notifications')
        .insert({
          provider_id: notification.providerId,
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          severity: notification.severity || 'info',
          related_entity_type: notification.relatedEntityType,
          related_entity_id: notification.relatedEntityId
        });

      if (error) {
        console.error('❌ Error creating provider notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Exception creating provider notification:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Subscribe to real-time notifications
  subscribeToProviderNotifications(userId: string, callback: (notifications: ProviderNotification[]) => void) {
    const channel = supabase
      .channel(`provider-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'provider_notifications',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Refetch notifications when any change occurs
          const notifications = await this.getProviderNotifications(userId);
          callback(notifications);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Transform database data to ProviderNotification type
  transformNotificationData(data: any): ProviderNotification {
    return {
      id: data.id,
      providerId: data.provider_id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      severity: data.severity,
      isRead: data.is_read,
      relatedEntityType: data.related_entity_type,
      relatedEntityId: data.related_entity_id,
      createdAt: new Date(data.created_at),
      readAt: data.read_at ? new Date(data.read_at) : undefined
    };
  }
};
