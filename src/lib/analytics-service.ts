import { supabase } from './supabase';
import { DashboardAnalytics } from './admin-api';

export interface AnalyticsService {
  // Property view tracking
  recordPropertyView: (propertyId: string, source?: string) => Promise<void>;
  recordPropertyImpression: (propertyId: string, source: string) => Promise<void>;
  
  // Analytics aggregation
  getDashboardAnalytics: (days?: number) => Promise<DashboardAnalytics>;
  getPropertyAnalytics: (propertyId?: string, days?: number) => Promise<any[]>;
  
  // Backfill and maintenance
  backfillAnalytics: () => Promise<void>;
  generateSampleData: () => Promise<void>;
}

class AnalyticsServiceImpl implements AnalyticsService {
  
  /**
   * Record a property view (when user visits property details page)
   */
  async recordPropertyView(propertyId: string, source: string = 'direct'): Promise<void> {
    try {
      console.log('📊 Recording property view:', propertyId, 'from:', source);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert into property_views table
      const { error: viewError } = await supabase
        .from('property_views')
        .insert({
          property_id: propertyId,
          viewer_id: user?.id || null,
          viewer_ip: null, // Could be populated from request
          source: source,
          viewed_at: new Date().toISOString()
        });

      if (viewError) {
        console.error('❌ Error recording property view:', viewError);
        return;
      }

      // Update property analytics using the database function
      const { error: analyticsError } = await supabase.rpc('update_property_analytics', {
        p_property_id: propertyId,
        p_metric_type: 'view',
        p_increment: 1
      });

      if (analyticsError) {
        console.warn('⚠️ Analytics function not available:', analyticsError.message);
        // Fallback: direct insert/update to property_analytics
        await this.updatePropertyAnalyticsDirect(propertyId, 'view', 1);
      }

      console.log('✅ Property view recorded successfully');
    } catch (error) {
      console.error('❌ Exception recording property view:', error);
    }
  }

  /**
   * Record a property impression (when property appears in a list)
   */
  async recordPropertyImpression(propertyId: string, source: string): Promise<void> {
    try {
      // Only record impressions for authenticated users to avoid spam
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use a more lightweight approach for impressions
      // We'll batch these or use a different table to avoid overwhelming the DB
      console.log('👁️ Property impression:', propertyId, 'from:', source);
      
      // For now, we'll just log impressions. In production, you might want to:
      // 1. Batch impressions and flush periodically
      // 2. Use a separate impressions table
      // 3. Sample impressions (only record 1 in N)
      
    } catch (error) {
      console.error('❌ Exception recording property impression:', error);
    }
  }

  /**
   * Direct update to property_analytics table (fallback method)
   */
  private async updatePropertyAnalyticsDirect(
    propertyId: string, 
    metricType: 'view' | 'inquiry' | 'favorite' | 'share', 
    increment: number
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to update existing record
      const { data: existing } = await supabase
        .from('property_analytics')
        .select('*')
        .eq('property_id', propertyId)
        .eq('date', today)
        .single();

      if (existing) {
        // Update existing record
        const updateData: any = {};
        updateData[metricType + 's'] = existing[metricType + 's'] + increment;
        
        await supabase
          .from('property_analytics')
          .update(updateData)
          .eq('property_id', propertyId)
          .eq('date', today);
      } else {
        // Insert new record
        const insertData: any = {
          property_id: propertyId,
          date: today,
          views: 0,
          inquiries: 0,
          favorites: 0,
          shares: 0
        };
        insertData[metricType + 's'] = increment;
        
        await supabase
          .from('property_analytics')
          .insert(insertData);
      }
    } catch (error) {
      console.error('❌ Error in direct analytics update:', error);
    }
  }

  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(days: number = 30): Promise<DashboardAnalytics> {
    try {
      console.log('📊 Fetching dashboard analytics for', days, 'days');

      // Get basic counts
      const [usersResult, providersResult, propertiesResult, viewsResult, inquiriesResult] = await Promise.all([
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
          .select('id, status, created_at', { count: 'exact' }),

        // Property views count
        supabase
          .from('property_views')
          .select('id, viewed_at', { count: 'exact' }),

        // Inquiries count
        supabase
          .from('inquiries')
          .select('id, created_at', { count: 'exact' })
      ]);

      // Calculate overview stats
      const totalUsers = usersResult.count || 0;
      const activeUsers = usersResult.data?.filter(u => u.status === 'approved').length || 0;
      const suspendedUsers = usersResult.data?.filter(u => u.status === 'suspended').length || 0;

      const totalProviders = providersResult.count || 0;
      const pendingProviders = providersResult.data?.filter(p => p.status === 'pending').length || 0;
      const activeProviders = providersResult.data?.filter(p => p.status === 'approved').length || 0;

      const totalProperties = propertiesResult.count || 0;
      const pendingProperties = propertiesResult.data?.filter(p => p.status === 'pending').length || 0;
      const activeProperties = propertiesResult.data?.filter(p => p.status === 'published').length || 0;

      // Calculate date ranges
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

      const newUsers30Days = usersResult.data?.filter(u =>
        new Date(u.created_at) >= thirtyDaysAgo
      ).length || 0;

      const newProperties30Days = propertiesResult.data?.filter(p =>
        new Date(p.created_at) >= thirtyDaysAgo
      ).length || 0;

      // Get trend data
      const [userGrowth, propertyPerformance, activityTrends] = await Promise.all([
        this.getUserGrowthTrends(days),
        this.getPropertyPerformanceTrends(days),
        this.getActivityTrends(days)
      ]);

      // Calculate revenue (mock calculation based on properties)
      const totalRevenue = totalProperties * 5000; // 5000 KSH per property listing
      const revenue30Days = newProperties30Days * 5000;

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
          daily_activities: await this.getDailyActivities(),
          daily_logins: await this.getDailyLogins(),
          total_revenue: totalRevenue,
          revenue_30_days: revenue30Days
        },
        user_growth: userGrowth,
        property_performance: propertyPerformance,
        activity_trends: activityTrends
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Get user growth trends over time
   */
  private async getUserGrowthTrends(days: number): Promise<Array<{ date: string; new_users: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData = (data || []).reduce((acc: Record<string, number>, user) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Fill in missing dates with 0
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          new_users: groupedData[dateStr] || 0
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error fetching user growth trends:', error);
      return [];
    }
  }

  /**
   * Get property performance trends
   */
  private async getPropertyPerformanceTrends(days: number): Promise<Array<{ date: string; total_views: number; total_inquiries: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Try to get from property_analytics table first
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('property_analytics')
        .select('date, views, inquiries')
        .gte('date', startDateStr)
        .order('date', { ascending: true });

      if (!analyticsError && analyticsData && analyticsData.length > 0) {
        // Group by date
        const groupedData = analyticsData.reduce((acc: Record<string, { views: number; inquiries: number }>, row) => {
          const date = row.date;
          if (!acc[date]) {
            acc[date] = { views: 0, inquiries: 0 };
          }
          acc[date].views += row.views || 0;
          acc[date].inquiries += row.inquiries || 0;
          return acc;
        }, {});

        // Fill in missing dates
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = groupedData[dateStr] || { views: 0, inquiries: 0 };
          result.push({
            date: dateStr,
            total_views: dayData.views,
            total_inquiries: dayData.inquiries
          });
        }

        return result;
      }

      // Fallback: aggregate from raw tables
      const [viewsData, inquiriesData] = await Promise.all([
        supabase
          .from('property_views')
          .select('viewed_at')
          .gte('viewed_at', startDate.toISOString()),
        
        supabase
          .from('inquiries')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
      ]);

      // Group views by date
      const viewsByDate = (viewsData.data || []).reduce((acc: Record<string, number>, view) => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Group inquiries by date
      const inquiriesByDate = (inquiriesData.data || []).reduce((acc: Record<string, number>, inquiry) => {
        const date = new Date(inquiry.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Combine and fill missing dates
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          total_views: viewsByDate[dateStr] || 0,
          total_inquiries: inquiriesByDate[dateStr] || 0
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error fetching property performance trends:', error);
      return [];
    }
  }

  /**
   * Get activity trends (admin actions, user registrations, etc.)
   */
  private async getActivityTrends(days: number): Promise<Array<{ date: string; activity_count: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get admin activity logs
      const { data: adminLogs } = await supabase
        .from('admin_activity_logs')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      // Get user registrations
      const { data: userRegs } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .is('deleted_at', null);

      // Get property submissions
      const { data: propSubs } = await supabase
        .from('properties')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      // Combine all activities
      const allActivities = [
        ...(adminLogs || []).map(log => ({ created_at: log.created_at })),
        ...(userRegs || []).map(user => ({ created_at: user.created_at })),
        ...(propSubs || []).map(prop => ({ created_at: prop.created_at }))
      ];

      // Group by date
      const groupedData = allActivities.reduce((acc: Record<string, number>, activity) => {
        const date = new Date(activity.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Fill in missing dates
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          activity_count: groupedData[dateStr] || 0
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error fetching activity trends:', error);
      return [];
    }
  }

  /**
   * Get daily activities count
   */
  private async getDailyActivities(): Promise<number> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const { count } = await supabase
        .from('admin_activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay.toISOString());

      return count || 0;
    } catch (error) {
      console.error('❌ Error fetching daily activities:', error);
      return 0;
    }
  }

  /**
   * Get daily logins count (mock for now)
   */
  private async getDailyLogins(): Promise<number> {
    try {
      // This would require tracking login events
      // For now, return a reasonable estimate based on daily activities
      const dailyActivities = await this.getDailyActivities();
      return Math.max(1, Math.floor(dailyActivities * 0.3)); // Assume 30% of activities are logins
    } catch (error) {
      console.error('❌ Error fetching daily logins:', error);
      return 0;
    }
  }

  /**
   * Get property analytics for specific property or all properties
   */
  async getPropertyAnalytics(propertyId?: string, days: number = 30): Promise<any[]> {
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
      console.error('❌ Error fetching property analytics:', error);
      return [];
    }
  }

  /**
   * Backfill analytics data for existing properties
   */
  async backfillAnalytics(): Promise<void> {
    try {
      console.log('🔄 Starting analytics backfill...');

      // Get all property views that don't have corresponding analytics entries
      const { data: views } = await supabase
        .from('property_views')
        .select('property_id, viewed_at')
        .order('viewed_at', { ascending: true });

      if (!views || views.length === 0) {
        console.log('⚠️ No property views found for backfill');
        return;
      }

      // Group views by property and date
      const viewsByPropertyAndDate: Record<string, Record<string, number>> = {};
      
      views.forEach(view => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        const key = `${view.property_id}-${date}`;
        
        if (!viewsByPropertyAndDate[view.property_id]) {
          viewsByPropertyAndDate[view.property_id] = {};
        }
        
        viewsByPropertyAndDate[view.property_id][date] = 
          (viewsByPropertyAndDate[view.property_id][date] || 0) + 1;
      });

      // Insert/update analytics records
      let processedCount = 0;
      for (const [propertyId, dateViews] of Object.entries(viewsByPropertyAndDate)) {
        for (const [date, viewCount] of Object.entries(dateViews)) {
          try {
            await supabase
              .from('property_analytics')
              .upsert({
                property_id: propertyId,
                date: date,
                views: viewCount,
                inquiries: 0,
                favorites: 0,
                shares: 0
              }, {
                onConflict: 'property_id,date'
              });
            
            processedCount++;
          } catch (error) {
            console.error('❌ Error upserting analytics for', propertyId, date, error);
          }
        }
      }

      console.log('✅ Analytics backfill completed:', processedCount, 'records processed');
    } catch (error) {
      console.error('❌ Error during analytics backfill:', error);
    }
  }

  /**
   * Generate sample analytics data for testing
   */
  async generateSampleData(): Promise<void> {
    try {
      console.log('🎲 Generating sample analytics data...');

      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .limit(10);

      if (!properties || properties.length === 0) {
        console.log('⚠️ No properties found for sample data generation');
        return;
      }

      const sampleData = [];
      const today = new Date();

      // Generate data for last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        properties.forEach(property => {
          sampleData.push({
            property_id: property.id,
            date: dateStr,
            views: Math.floor(Math.random() * 50) + 1,
            inquiries: Math.floor(Math.random() * 5),
            favorites: Math.floor(Math.random() * 10),
            shares: Math.floor(Math.random() * 3)
          });
        });
      }

      // Insert sample data
      const { error } = await supabase
        .from('property_analytics')
        .upsert(sampleData, {
          onConflict: 'property_id,date'
        });

      if (error) {
        console.error('❌ Error inserting sample data:', error);
        return;
      }

      console.log('✅ Sample analytics data generated:', sampleData.length, 'records');
    } catch (error) {
      console.error('❌ Error generating sample data:', error);
    }
  }

  /**
   * Get default analytics structure when data is unavailable
   */
  private getDefaultAnalytics(): DashboardAnalytics {
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
}

// Export singleton instance
export const analyticsService = new AnalyticsServiceImpl();