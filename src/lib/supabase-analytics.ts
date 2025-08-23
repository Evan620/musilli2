import { supabase } from './supabase'

export interface GrowthMetrics {
  userGrowth: number
  providerGrowth: number
  propertyGrowth: number
  revenueGrowth: number
  inquiryGrowth: number
  viewsGrowth: number
}

export interface MonthlyStats {
  users: number
  providers: number
  properties: number
  revenue: number
  inquiries: number
  views: number
}

export const analyticsService = {
  // Get current month stats
  async getCurrentMonthStats(): Promise<MonthlyStats> {
    try {
      const currentMonth = new Date()
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      
      // Get users created this month
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', startOfMonth.toISOString())
        .is('deleted_at', null)

      // Get providers created this month
      const { data: providersData } = await supabase
        .from('providers')
        .select('id')
        .gte('created_at', startOfMonth.toISOString())

      // Get properties created this month
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id')
        .gte('created_at', startOfMonth.toISOString())

      // Get inquiries this month
      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select('id')
        .gte('created_at', startOfMonth.toISOString())

      // Get total views this month (from property_views table)
      const { data: viewsData } = await supabase
        .from('property_views')
        .select('id')
        .gte('viewed_at', startOfMonth.toISOString())

      // Calculate revenue this month (mock calculation based on properties)
      const revenue = (propertiesData?.length || 0) * 5000 // Assume 5000 KSH per property listing fee

      return {
        users: usersData?.length || 0,
        providers: providersData?.length || 0,
        properties: propertiesData?.length || 0,
        revenue,
        inquiries: inquiriesData?.length || 0,
        views: viewsData?.length || 0
      }
    } catch (error) {
      console.error('Error fetching current month stats:', error)
      return {
        users: 0,
        providers: 0,
        properties: 0,
        revenue: 0,
        inquiries: 0,
        views: 0
      }
    }
  },

  // Get previous month stats
  async getPreviousMonthStats(): Promise<MonthlyStats> {
    try {
      const currentMonth = new Date()
      const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      const endOfPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0, 23, 59, 59)
      
      // Get users created last month
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', previousMonth.toISOString())
        .lte('created_at', endOfPreviousMonth.toISOString())
        .is('deleted_at', null)

      // Get providers created last month
      const { data: providersData } = await supabase
        .from('providers')
        .select('id')
        .gte('created_at', previousMonth.toISOString())
        .lte('created_at', endOfPreviousMonth.toISOString())

      // Get properties created last month
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id')
        .gte('created_at', previousMonth.toISOString())
        .lte('created_at', endOfPreviousMonth.toISOString())

      // Get inquiries last month
      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select('id')
        .gte('created_at', previousMonth.toISOString())
        .lte('created_at', endOfPreviousMonth.toISOString())

      // Get views last month
      const { data: viewsData } = await supabase
        .from('property_views')
        .select('id')
        .gte('viewed_at', previousMonth.toISOString())
        .lte('viewed_at', endOfPreviousMonth.toISOString())

      // Calculate revenue last month
      const revenue = (propertiesData?.length || 0) * 5000

      return {
        users: usersData?.length || 0,
        providers: providersData?.length || 0,
        properties: propertiesData?.length || 0,
        revenue,
        inquiries: inquiriesData?.length || 0,
        views: viewsData?.length || 0
      }
    } catch (error) {
      console.error('Error fetching previous month stats:', error)
      return {
        users: 0,
        providers: 0,
        properties: 0,
        revenue: 0,
        inquiries: 0,
        views: 0
      }
    }
  },

  // Calculate growth percentages
  calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0
    }
    return Math.round(((current - previous) / previous) * 100)
  },

  // Get all growth metrics
  async getGrowthMetrics(): Promise<GrowthMetrics> {
    try {
      const [currentStats, previousStats] = await Promise.all([
        this.getCurrentMonthStats(),
        this.getPreviousMonthStats()
      ])

      return {
        userGrowth: this.calculateGrowthPercentage(currentStats.users, previousStats.users),
        providerGrowth: this.calculateGrowthPercentage(currentStats.providers, previousStats.providers),
        propertyGrowth: this.calculateGrowthPercentage(currentStats.properties, previousStats.properties),
        revenueGrowth: this.calculateGrowthPercentage(currentStats.revenue, previousStats.revenue),
        inquiryGrowth: this.calculateGrowthPercentage(currentStats.inquiries, previousStats.inquiries),
        viewsGrowth: this.calculateGrowthPercentage(currentStats.views, previousStats.views)
      }
    } catch (error) {
      console.error('Error calculating growth metrics:', error)
      return {
        userGrowth: 0,
        providerGrowth: 0,
        propertyGrowth: 0,
        revenueGrowth: 0,
        inquiryGrowth: 0,
        viewsGrowth: 0
      }
    }
  },

  // Get total stats (for current totals)
  async getTotalStats(): Promise<MonthlyStats> {
    try {
      // Get total users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id')
        .is('deleted_at', null)

      // Get total providers
      const { data: providersData } = await supabase
        .from('providers')
        .select('id')

      // Get total properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id')

      // Get total inquiries
      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select('id')

      // Get total views
      const { data: viewsData } = await supabase
        .from('property_views')
        .select('id')

      // Calculate total revenue
      const revenue = (propertiesData?.length || 0) * 5000

      return {
        users: usersData?.length || 0,
        providers: providersData?.length || 0,
        properties: propertiesData?.length || 0,
        revenue,
        inquiries: inquiriesData?.length || 0,
        views: viewsData?.length || 0
      }
    } catch (error) {
      console.error('Error fetching total stats:', error)
      return {
        users: 0,
        providers: 0,
        properties: 0,
        revenue: 0,
        inquiries: 0,
        views: 0
      }
    }
  },

  // Format growth percentage for display
  formatGrowthPercentage(growth: number): { text: string; isPositive: boolean; isNeutral: boolean } {
    const isPositive = growth > 0
    const isNeutral = growth === 0
    const sign = isPositive ? '+' : ''
    
    return {
      text: `${sign}${growth}% from last month`,
      isPositive,
      isNeutral
    }
  }
}
