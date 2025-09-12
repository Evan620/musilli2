import { supabase } from './supabase';
import { ActivityItem, AdminNotification } from './admin-api';

export interface AdminRealtimeCallbacks {
  onActivityUpdate?: (activities: ActivityItem[]) => void;
  onNotificationUpdate?: (notifications: AdminNotification[]) => void;
  onConnectionChange?: (connected: boolean) => void;
}

class AdminRealtimeService {
  private activityChannel: any = null;
  private notificationChannel: any = null;
  private callbacks: AdminRealtimeCallbacks = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Initialize real-time subscriptions for admin
   */
  async initialize(adminId: string, callbacks: AdminRealtimeCallbacks) {
    console.log('🔄 AdminRealtime: Initializing real-time subscriptions for admin:', adminId);
    
    this.callbacks = callbacks;
    
    try {
      // Subscribe to admin activity logs
      await this.subscribeToActivityLogs(adminId);
      
      // Subscribe to system notifications
      await this.subscribeToSystemNotifications(adminId);
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.callbacks.onConnectionChange?.(true);
      
      console.log('✅ AdminRealtime: Successfully initialized real-time subscriptions');
    } catch (error) {
      console.error('❌ AdminRealtime: Failed to initialize:', error);
      this.handleConnectionError();
    }
  }

  /**
   * Subscribe to admin activity logs for real-time updates
   */
  private async subscribeToActivityLogs(adminId: string) {
    console.log('🔄 AdminRealtime: Setting up activity logs subscription...');
    
    this.activityChannel = supabase
      .channel('admin-activity-logs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_activity_logs'
        },
        async (payload) => {
          console.log('📢 AdminRealtime: Activity log change detected:', payload);
          await this.handleActivityChange(payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 AdminRealtime: Activity logs subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ AdminRealtime: Activity logs subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ AdminRealtime: Activity logs subscription error');
          this.handleConnectionError();
        }
      });
  }

  /**
   * Subscribe to system notifications for real-time updates
   */
  private async subscribeToSystemNotifications(adminId: string) {
    console.log('🔄 AdminRealtime: Setting up system notifications subscription...');
    
    this.notificationChannel = supabase
      .channel('admin-system-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_notifications'
        },
        async (payload) => {
          console.log('📢 AdminRealtime: System notification change detected:', payload);
          await this.handleNotificationChange(payload, adminId);
        }
      )
      .subscribe((status) => {
        console.log('📡 AdminRealtime: System notifications subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ AdminRealtime: System notifications subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ AdminRealtime: System notifications subscription error');
          this.handleConnectionError();
        }
      });
  }

  /**
   * Handle activity log changes
   */
  private async handleActivityChange(payload: any) {
    try {
      console.log('🔄 AdminRealtime: Processing activity change...');
      
      // Fetch updated activity feed
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ AdminRealtime: Error fetching updated activities:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ AdminRealtime: No activity data found');
        return;
      }

      // Get admin names for the activities
      const adminIds = [...new Set(data.map(log => log.admin_id))];
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', adminIds);

      const adminMap = new Map(admins?.map(admin => [admin.id, admin.name]) || []);

      const activities: ActivityItem[] = data.map(log => ({
        id: log.id,
        adminId: log.admin_id,
        adminName: adminMap.get(log.admin_id) || 'Unknown Admin',
        actionType: log.action_type,
        targetType: log.target_type,
        targetId: log.target_id,
        targetEmail: log.target_email || '',
        details: log.details || {},
        createdAt: log.created_at
      }));

      console.log('✅ AdminRealtime: Broadcasting', activities.length, 'updated activities');
      this.callbacks.onActivityUpdate?.(activities);
    } catch (error) {
      console.error('❌ AdminRealtime: Error handling activity change:', error);
    }
  }

  /**
   * Handle system notification changes
   */
  private async handleNotificationChange(payload: any, adminId: string) {
    try {
      console.log('🔄 AdminRealtime: Processing notification change...');
      
      // Fetch updated notifications
      let query = supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // Get notifications for this admin or global notifications
      query = query.or(`admin_id.eq.${adminId},admin_id.is.null`);

      const { data, error } = await query;

      if (error) {
        console.error('❌ AdminRealtime: Error fetching updated notifications:', error);
        return;
      }

      const notifications: AdminNotification[] = (data || []).map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        severity: notification.severity,
        isRead: notification.is_read,
        relatedEntityType: notification.related_entity_type,
        relatedEntityId: notification.related_entity_id,
        createdAt: notification.created_at
      }));

      console.log('✅ AdminRealtime: Broadcasting', notifications.length, 'updated notifications');
      this.callbacks.onNotificationUpdate?.(notifications);
    } catch (error) {
      console.error('❌ AdminRealtime: Error handling notification change:', error);
    }
  }

  /**
   * Handle connection errors and implement reconnection logic
   */
  private handleConnectionError() {
    this.isConnected = false;
    this.callbacks.onConnectionChange?.(false);

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      
      console.log(`🔄 AdminRealtime: Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
      
      setTimeout(() => {
        this.reconnect();
      }, delay);
    } else {
      console.error('❌ AdminRealtime: Max reconnection attempts reached');
    }
  }

  /**
   * Attempt to reconnect
   */
  private async reconnect() {
    try {
      console.log('🔄 AdminRealtime: Reconnecting...');
      
      // Clean up existing channels
      this.cleanup();
      
      // Re-initialize (this will require the adminId to be stored)
      // For now, we'll just log that reconnection is needed
      console.log('⚠️ AdminRealtime: Reconnection requires re-initialization');
    } catch (error) {
      console.error('❌ AdminRealtime: Reconnection failed:', error);
      this.handleConnectionError();
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Manually refresh activity feed
   */
  async refreshActivityFeed(): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Get admin names
      const adminIds = [...new Set(data.map(log => log.admin_id))];
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', adminIds);

      const adminMap = new Map(admins?.map(admin => [admin.id, admin.name]) || []);

      return data.map(log => ({
        id: log.id,
        adminId: log.admin_id,
        adminName: adminMap.get(log.admin_id) || 'Unknown Admin',
        actionType: log.action_type,
        targetType: log.target_type,
        targetId: log.target_id,
        targetEmail: log.target_email || '',
        details: log.details || {},
        createdAt: log.created_at
      }));
    } catch (error) {
      console.error('❌ AdminRealtime: Error refreshing activity feed:', error);
      return [];
    }
  }

  /**
   * Manually refresh notifications
   */
  async refreshNotifications(adminId: string): Promise<AdminNotification[]> {
    try {
      let query = supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      query = query.or(`admin_id.eq.${adminId},admin_id.is.null`);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        severity: notification.severity,
        isRead: notification.is_read,
        relatedEntityType: notification.related_entity_type,
        relatedEntityId: notification.related_entity_id,
        createdAt: notification.created_at
      }));
    } catch (error) {
      console.error('❌ AdminRealtime: Error refreshing notifications:', error);
      return [];
    }
  }

  /**
   * Clean up subscriptions
   */
  cleanup() {
    console.log('🧹 AdminRealtime: Cleaning up subscriptions...');
    
    if (this.activityChannel) {
      supabase.removeChannel(this.activityChannel);
      this.activityChannel = null;
    }
    
    if (this.notificationChannel) {
      supabase.removeChannel(this.notificationChannel);
      this.notificationChannel = null;
    }
    
    this.isConnected = false;
    this.callbacks = {};
    this.reconnectAttempts = 0;
    
    console.log('✅ AdminRealtime: Cleanup completed');
  }

  /**
   * Test the real-time connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 AdminRealtime: Testing connection...');
      
      // Try to fetch some data to test the connection
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ AdminRealtime: Connection test failed:', error);
        return false;
      }

      console.log('✅ AdminRealtime: Connection test passed');
      return true;
    } catch (error) {
      console.error('❌ AdminRealtime: Connection test error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const adminRealtimeService = new AdminRealtimeService();