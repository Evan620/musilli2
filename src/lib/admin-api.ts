import { supabase } from './supabase';
import { User } from '@/types';

// Types for admin API
export interface UserListFilters {
  search?: string;
  role?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  usersByRole: {
    admin: number;
    provider: number;
    user: number;
  };
}

export interface ActivityItem {
  id: string;
  adminId: string;
  adminName: string;
  actionType: string;
  targetType: string;
  targetId: string;
  targetEmail: string;
  details: any;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface DashboardAnalytics {
  overview: {
    total_users: number;
    active_users: number;
    suspended_users: number;
    new_users_30_days: number;
    total_providers: number;
    pending_providers: number;
    active_providers: number;
    total_properties: number;
    pending_properties: number;
    active_properties: number;
    new_properties_30_days: number;
    daily_activities: number;
    daily_logins: number;
    total_revenue: number;
    revenue_30_days: number;
  };
  user_growth: Array<{
    date: string;
    new_users: number;
  }>;
  property_performance: Array<{
    date: string;
    total_views: number;
    total_inquiries: number;
  }>;
  activity_trends: Array<{
    date: string;
    activity_count: number;
  }>;
}

export interface PropertyAnalytics {
  property_id: string;
  date: string;
  views: number;
  inquiries: number;
  favorites: number;
  shares: number;
}

export interface RevenueRecord {
  id: string;
  provider_id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  description: string;
  status: string;
  created_at: string;
}

// Admin API service
export const adminAPI = {
  // User Management
  async getUsers(
    filters: UserListFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<UserListResponse> {
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .is('deleted_at', null) // Don't show soft-deleted users
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const users: User[] = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        role: profile.role,
        status: profile.status,
        avatar: profile.avatar_url,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
        lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at) : undefined,
        loginCount: profile.login_count || 0,
        suspensionReason: profile.suspension_reason,
        suspendedAt: profile.suspended_at ? new Date(profile.suspended_at) : undefined,
        notes: profile.notes
      }));

      return {
        users,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserStats(): Promise<UserStats> {
    try {
      // Get total counts by status and role
      const { data: statusCounts } = await supabase
        .from('profiles')
        .select('status, role')
        .is('deleted_at', null);

      if (!statusCounts) throw new Error('Failed to fetch user stats');

      const stats = statusCounts.reduce((acc, user) => {
        // Count by status
        if (user.status === 'approved') acc.activeUsers++;
        if (user.status === 'suspended') acc.suspendedUsers++;
        
        // Count by role
        if (user.role === 'admin') acc.usersByRole.admin++;
        else if (user.role === 'provider') acc.usersByRole.provider++;
        else acc.usersByRole.user++;
        
        return acc;
      }, {
        totalUsers: statusCounts.length,
        activeUsers: 0,
        suspendedUsers: 0,
        usersByRole: { admin: 0, provider: 0, user: 0 }
      });

      // Get new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())
        .is('deleted_at', null);

      return {
        ...stats,
        newUsersThisMonth: newUsersCount || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  async suspendUser(
    userId: string,
    reason: string,
    adminId: string
  ): Promise<ActionResult> {
    try {
      console.log('🚫 suspendUser: Suspending user with activity logging...');

      // Use database function with activity logging
      const { data, error } = await supabase.rpc('suspend_user_with_logging', {
        p_user_id: userId,
        p_admin_id: adminId,
        p_reason: reason
      });

      if (error) {
        console.error('❌ suspendUser: Database function error:', error);
        
        // Fallback to basic update if function doesn't exist
        console.log('🔄 suspendUser: Falling back to basic update...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .update({
            status: 'suspended',
            suspension_reason: reason,
            suspended_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (fallbackError) {
          return {
            success: false,
            message: 'Failed to suspend user',
            error: fallbackError.message
          };
        }

        console.log('✅ suspendUser: User suspended with fallback method');
        return {
          success: true,
          message: 'User suspended successfully'
        };
      }

      if (data) {
        console.log('✅ suspendUser: User suspended with activity logging');
        return {
          success: true,
          message: 'User suspended successfully'
        };
      } else {
        return {
          success: false,
          message: 'User not found'
        };
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      return {
        success: false,
        message: 'Failed to suspend user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async activateUser(userId: string, adminId: string): Promise<ActionResult> {
    try {
      console.log('✅ activateUser: Activating user with activity logging...');

      // Use database function with activity logging
      const { data, error } = await supabase.rpc('activate_user_with_logging', {
        p_user_id: userId,
        p_admin_id: adminId
      });

      if (error) {
        console.error('❌ activateUser: Database function error:', error);
        
        // Fallback to basic update if function doesn't exist
        console.log('🔄 activateUser: Falling back to basic update...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .update({
            status: 'approved',
            suspension_reason: null,
            suspended_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (fallbackError) {
          return {
            success: false,
            message: 'Failed to activate user',
            error: fallbackError.message
          };
        }

        console.log('✅ activateUser: User activated with fallback method');
        return {
          success: true,
          message: 'User activated successfully'
        };
      }

      if (data) {
        console.log('✅ activateUser: User activated with activity logging');
        return {
          success: true,
          message: 'User activated successfully'
        };
      } else {
        return {
          success: false,
          message: 'User not found'
        };
      }
    } catch (error) {
      console.error('Error activating user:', error);
      return {
        success: false,
        message: 'Failed to activate user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async deleteUser(
    userId: string,
    adminId: string,
    reason: string = 'Admin deletion'
  ): Promise<ActionResult> {
    try {
      console.log('🗑️ deleteUser: Soft deleting user with activity logging...');

      // Use database function with activity logging
      const { data, error } = await supabase.rpc('soft_delete_user_with_logging', {
        p_user_id: userId,
        p_admin_id: adminId,
        p_reason: reason
      });

      if (error) {
        console.error('❌ deleteUser: Database function error:', error);
        
        // Fallback to basic update if function doesn't exist
        console.log('🔄 deleteUser: Falling back to basic update...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .update({
            deleted_at: new Date().toISOString(),
            deletion_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();

        if (fallbackError) {
          return {
            success: false,
            message: 'Failed to delete user',
            error: fallbackError.message
          };
        }

        console.log('✅ deleteUser: User deleted with fallback method');
        return {
          success: true,
          message: 'User deleted successfully'
        };
      }

      if (data) {
        console.log('✅ deleteUser: User deleted with activity logging');
        return {
          success: true,
          message: 'User deleted successfully'
        };
      } else {
        return {
          success: false,
          message: 'User not found'
        };
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async getActivityFeed(limit: number = 20): Promise<ActivityItem[]> {
    try {


      // Try to get activity logs, but don't fail if table doesn't exist
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('⚠️ getActivityFeed: Activity logs table not available:', error);
        // Return empty array instead of throwing
        return [];
      }

      if (!data || data.length === 0) {

        return [];
      }

      // Get admin names separately to avoid complex joins
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
      console.error('Error fetching activity feed:', error);
      // Return empty array instead of throwing
      return [];
    }
  },

  async getNotifications(adminId?: string): Promise<AdminNotification[]> {
    try {
      let query = supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // If adminId is provided, get notifications for that admin or global notifications
      if (adminId) {
        query = query.or(`admin_id.eq.${adminId},admin_id.is.null`);
      } else {
        // Get only global notifications
        query = query.is('admin_id', null);
      }

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
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<ActionResult> {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: 'Failed to mark notification as read',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Analytics & Monitoring - Simplified version using basic queries
  async getDashboardAnalytics(days: number = 30): Promise<DashboardAnalytics> {
    try {


      // Get basic counts with simple queries
      const [usersResult, providersResult, propertiesResult] = await Promise.all([
        // Users count
        supabase
          .from('profiles')
          .select('id, role, status, created_at', { count: 'exact' })
          .is('deleted_at', null),

        // Providers count
        supabase
          .from('profiles')
          .select('id, status, created_at', { count: 'exact' })
          .eq('role', 'provider')
          .is('deleted_at', null),

        // Properties count
        supabase
          .from('properties')
          .select('id, status, created_at', { count: 'exact' })
      ]);



      // Calculate stats from the results
      const totalUsers = usersResult.count || 0;
      const activeUsers = usersResult.data?.filter(u => u.status === 'approved').length || 0;
      const suspendedUsers = usersResult.data?.filter(u => u.status === 'suspended').length || 0;

      const totalProviders = providersResult.count || 0;
      const pendingProviders = providersResult.data?.filter(p => p.status === 'pending').length || 0;
      const activeProviders = providersResult.data?.filter(p => p.status === 'approved').length || 0;

      const totalProperties = propertiesResult.count || 0;
      const pendingProperties = propertiesResult.data?.filter(p => p.status === 'pending').length || 0;
      const activeProperties = propertiesResult.data?.filter(p => p.status === 'approved').length || 0;

      // Calculate new users in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);
      const newUsers30Days = usersResult.data?.filter(u =>
        new Date(u.created_at) >= thirtyDaysAgo
      ).length || 0;

      const newProperties30Days = propertiesResult.data?.filter(p =>
        new Date(p.created_at) >= thirtyDaysAgo
      ).length || 0;

      return {
        overview: {
          total_users: totalUsers,
          active_users: activeUsers,
          suspended_users: suspendedUsers,
          new_users_30_days: newUsers30Days,
          total_providers: totalProviders,
          pending_providers: pendingProviders,
          active_providers: activeProviders,
          total_properties: totalProperties,
          pending_properties: pendingProperties,
          active_properties: activeProperties,
          new_properties_30_days: newProperties30Days,
          daily_activities: 0, // Will implement later
          daily_logins: 0, // Will implement later
          total_revenue: 0, // Will implement later
          revenue_30_days: 0 // Will implement later
        },
        user_growth: [], // Will implement later
        property_performance: [], // Will implement later
        activity_trends: [] // Will implement later
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      // Return default data instead of throwing
      return {
        overview: {
          total_users: 0,
          active_users: 0,
          suspended_users: 0,
          new_users_30_days: 0,
          total_providers: 0,
          pending_providers: 0,
          active_providers: 0,
          total_properties: 0,
          pending_properties: 0,
          active_properties: 0,
          new_properties_30_days: 0,
          daily_activities: 0,
          daily_logins: 0,
          total_revenue: 0,
          revenue_30_days: 0
        },
        user_growth: [],
        property_performance: [],
        activity_trends: []
      };
    }
  },

  async getPropertyAnalytics(
    propertyId?: string,
    days: number = 30
  ): Promise<PropertyAnalytics[]> {
    try {
      let query = supabase
        .from('property_analytics')
        .select('*')
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching property analytics:', error);
      throw error;
    }
  },

  async trackUserActivity(
    userId: string,
    activityType: string,
    entityType?: string,
    entityId?: string,
    metadata?: any
  ): Promise<ActionResult> {
    try {
      const { error } = await supabase.rpc('track_user_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_metadata: metadata || {}
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Activity tracked successfully'
      };
    } catch (error) {
      console.error('Error tracking user activity:', error);
      return {
        success: false,
        message: 'Failed to track activity',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async updatePropertyAnalytics(
    propertyId: string,
    metricType: 'view' | 'inquiry' | 'favorite' | 'share',
    increment: number = 1
  ): Promise<ActionResult> {
    try {
      const { error } = await supabase.rpc('update_property_analytics', {
        p_property_id: propertyId,
        p_metric_type: metricType,
        p_increment: increment
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Property analytics updated'
      };
    } catch (error) {
      console.error('Error updating property analytics:', error);
      return {
        success: false,
        message: 'Failed to update analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async getRevenueRecords(
    providerId?: string,
    days: number = 30
  ): Promise<RevenueRecord[]> {
    try {
      let query = supabase
        .from('revenue_records')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(record => ({
        id: record.id,
        provider_id: record.provider_id,
        amount: parseFloat(record.amount),
        currency: record.currency,
        transaction_type: record.transaction_type,
        description: record.description,
        status: record.status,
        created_at: record.created_at
      }));
    } catch (error) {
      console.error('Error fetching revenue records:', error);
      throw error;
    }
  }
};
