import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import {
  adminAPI,
  UserListFilters,
  UserListResponse,
  UserStats,
  ActivityItem,
  AdminNotification,
  ActionResult,
  DashboardAnalytics
} from '@/lib/admin-api';
import { adminRealtimeService } from '@/lib/admin-realtime';
import { useAuth } from './AuthContext';

interface AdminContextType {
  // Admin Identity
  isMusilliAdmin: boolean;

  // User Management
  users: User[];
  userStats: UserStats | null;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  isLoadingUsers: boolean;
  userFilters: UserListFilters;

  // Activity & Notifications
  activityFeed: ActivityItem[];
  notifications: AdminNotification[];
  unreadNotificationCount: number;
  isLoadingActivity: boolean;

  // Analytics
  dashboardAnalytics: DashboardAnalytics | null;
  isLoadingAnalytics: boolean;
  
  // Actions
  loadUsers: (page?: number, filters?: UserListFilters) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<ActionResult>;
  activateUser: (userId: string) => Promise<ActionResult>;
  deleteUser: (userId: string, reason?: string) => Promise<ActionResult>;
  refreshStats: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  
  // Filters
  setUserFilters: (filters: UserListFilters) => void;
  clearFilters: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // Admin Identity State - No longer needed for pure admin

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userFilters, setUserFilters] = useState<UserListFilters>({});

  // Activity & Notifications State
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Analytics State
  const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // Computed values
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;
  const isMusilliAdmin = user?.role === 'admin' && user?.email === 'musilli.luxury@gmail.com';
  
  // Load users with pagination and filters
  const loadUsers = async (page: number = 1, filters: UserListFilters = userFilters) => {
    if (!user || user.role !== 'admin') return;
    
    setIsLoadingUsers(true);
    try {
      const response: UserListResponse = await adminAPI.getUsers(filters, page, 10);
      setUsers(response.users);
      setTotalUsers(response.total);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setUserFilters(filters);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Search users
  const searchUsers = async (query: string) => {
    const searchFilters = { ...userFilters, search: query };
    await loadUsers(1, searchFilters);
  };
  
  // Suspend user
  const suspendUser = async (userId: string, reason: string): Promise<ActionResult> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }
    
    try {
      const result = await adminAPI.suspendUser(userId, reason, user.id);
      
      if (result.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId 
              ? { ...u, status: 'suspended', suspensionReason: reason, suspendedAt: new Date() }
              : u
          )
        );
        
        // Refresh stats and activity
        await Promise.all([refreshStats(), refreshActivity()]);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to suspend user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  // Activate user
  const activateUser = async (userId: string): Promise<ActionResult> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }
    
    try {
      const result = await adminAPI.activateUser(userId, user.id);
      
      if (result.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId 
              ? { ...u, status: 'approved', suspensionReason: undefined, suspendedAt: undefined }
              : u
          )
        );
        
        // Refresh stats and activity
        await Promise.all([refreshStats(), refreshActivity()]);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to activate user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  // Delete user
  const deleteUser = async (userId: string, reason: string = 'Admin deletion'): Promise<ActionResult> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }
    
    try {
      const result = await adminAPI.deleteUser(userId, user.id, reason);
      
      if (result.success) {
        // Remove from local state
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        setTotalUsers(prev => prev - 1);
        
        // Refresh stats and activity
        await Promise.all([refreshStats(), refreshActivity()]);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  // Refresh user stats
  const refreshStats = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      const stats = await adminAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };
  
  // Refresh activity feed
  const refreshActivity = async () => {
    if (!user || user.role !== 'admin') return;

    setIsLoadingActivity(true);
    try {
      const [activity, notifications] = await Promise.all([
        adminAPI.getActivityFeed(20),
        adminAPI.getNotifications(user.id)
      ]);

      setActivityFeed(activity);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error refreshing activity:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // Refresh analytics
  const refreshAnalytics = async () => {
    if (!user || user.role !== 'admin') return;

    setIsLoadingAnalytics(true);
    try {
      const analytics = await adminAPI.getDashboardAnalytics(30);
      setDashboardAnalytics(analytics);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      // Set default analytics instead of leaving it null
      setDashboardAnalytics({
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
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await adminAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    setUserFilters({});
    loadUsers(1, {});
  };
  
  // Initialize data and real-time subscriptions when admin user is available
  useEffect(() => {
    if (user && user.role === 'admin') {
      console.log('🔄 AdminContext: Initializing admin dashboard for user:', user.id);
      
      // Load initial data
      Promise.all([
        loadUsers(),
        refreshStats(),
        refreshActivity(),
        refreshAnalytics()
      ]);

      // Initialize real-time subscriptions
      adminRealtimeService.initialize(user.id, {
        onActivityUpdate: (activities) => {
          console.log('📢 AdminContext: Received real-time activity update:', activities.length, 'items');
          setActivityFeed(activities);
        },
        onNotificationUpdate: (notifications) => {
          console.log('📢 AdminContext: Received real-time notification update:', notifications.length, 'items');
          setNotifications(notifications);
        },
        onConnectionChange: (connected) => {
          console.log('📡 AdminContext: Real-time connection status:', connected ? 'Connected' : 'Disconnected');
          if (!connected) {
            // Fallback to polling if real-time connection fails
            console.log('🔄 AdminContext: Falling back to polling mode');
            const fallbackInterval = setInterval(() => {
              refreshActivity();
            }, 30000);
            
            return () => clearInterval(fallbackInterval);
          }
        }
      });

      // Keep analytics on a slower refresh cycle (not real-time)
      const analyticsInterval = setInterval(refreshAnalytics, 60000); // Every minute

      return () => {
        console.log('🧹 AdminContext: Cleaning up admin subscriptions');
        adminRealtimeService.cleanup();
        clearInterval(analyticsInterval);
      };
    } else {
      // Clean up if user is no longer admin
      adminRealtimeService.cleanup();
    }
  }, [user]);
  
  const value: AdminContextType = {
    // Admin Identity
    isMusilliAdmin,

    // User Management
    users,
    userStats,
    totalUsers,
    currentPage,
    totalPages,
    isLoadingUsers,
    userFilters,

    // Activity & Notifications
    activityFeed,
    notifications,
    unreadNotificationCount,
    isLoadingActivity,

    // Analytics
    dashboardAnalytics,
    isLoadingAnalytics,
    
    // Actions
    loadUsers,
    searchUsers,
    suspendUser,
    activateUser,
    deleteUser,
    refreshStats,
    refreshActivity,
    refreshAnalytics,
    markNotificationAsRead,
    
    // Filters
    setUserFilters,
    clearFilters
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
