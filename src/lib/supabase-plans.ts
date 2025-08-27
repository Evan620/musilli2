import { supabase } from './supabase';
import { 
  ArchitecturalPlan, 
  PlanFile, 
  PlanPurchase, 
  PlanReview, 
  PlanSearchFilters,
  PlanCategory,
  PlanStatus,
  PlanFileType 
} from '@/types';

export const planService = {
  // Get all published plans
  async getPublishedPlans(): Promise<ArchitecturalPlan[]> {
    try {
      const { data, error } = await supabase
        .from('architectural_plans')
        .select(`
          *,
          plan_files (*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching published plans:', error);
        return [];
      }

      return data?.map(this.mapDatabaseToPlan) || [];
    } catch (error) {
      console.error('Error in getPublishedPlans:', error);
      return [];
    }
  },

  // Search plans with filters
  async searchPlans(filters: PlanSearchFilters): Promise<ArchitecturalPlan[]> {
    try {
      let query = supabase
        .from('architectural_plans')
        .select(`
          *,
          plan_files (*)
        `)
        .eq('status', 'published');

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.minBedrooms) {
        query = query.gte('bedrooms', filters.minBedrooms);
      }

      if (filters.maxBedrooms) {
        query = query.lte('bedrooms', filters.maxBedrooms);
      }

      if (filters.minArea) {
        query = query.gte('area', filters.minArea);
      }

      if (filters.maxArea) {
        query = query.lte('area', filters.maxArea);
      }

      if (filters.style) {
        query = query.eq('style', filters.style);
      }

      if (filters.features && filters.features.length > 0) {
        query = query.overlaps('features', filters.features);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'date';
      const sortOrder = filters.sortOrder || 'desc';
      
      switch (sortBy) {
        case 'price':
          query = query.order('price', { ascending: sortOrder === 'asc' });
          break;
        case 'popularity':
          query = query.order('views', { ascending: sortOrder === 'asc' });
          break;
        case 'downloads':
          query = query.order('downloads', { ascending: sortOrder === 'asc' });
          break;
        default:
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching plans:', error);
        return [];
      }

      return data?.map(this.mapDatabaseToPlan) || [];
    } catch (error) {
      console.error('Error in searchPlans:', error);
      return [];
    }
  },

  // Get plan by ID
  async getPlanById(id: string): Promise<ArchitecturalPlan | null> {
    try {
      const { data, error } = await supabase
        .from('architectural_plans')
        .select(`
          *,
          plan_files (*),
          plan_reviews (*)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching plan:', error);
        return null;
      }

      return data ? this.mapDatabaseToPlan(data) : null;
    } catch (error) {
      console.error('Error in getPlanById:', error);
      return null;
    }
  },

  // Track plan view
  async trackPlanView(planId: string, userIp?: string, userAgent?: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_plan_view', {
        p_plan_id: planId,
        p_user_ip: userIp,
        p_user_agent: userAgent
      });

      if (error) {
        console.error('Error tracking plan view:', error);
      }
    } catch (error) {
      console.error('Error in trackPlanView:', error);
    }
  },

  // Process plan purchase
  async processPlanPurchase(
    planId: string,
    customerEmail: string,
    customerName: string,
    customerPhone?: string,
    paymentMethod?: string,
    paymentReference?: string
  ): Promise<{ success: boolean; purchaseId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('process_plan_purchase', {
        p_plan_id: planId,
        p_customer_email: customerEmail,
        p_customer_name: customerName,
        p_customer_phone: customerPhone,
        p_payment_method: paymentMethod,
        p_payment_reference: paymentReference
      });

      if (error) {
        console.error('Error processing purchase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, purchaseId: data };
    } catch (error) {
      console.error('Error in processPlanPurchase:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get customer purchases
  async getCustomerPurchases(customerEmail: string): Promise<PlanPurchase[]> {
    try {
      const { data, error } = await supabase
        .from('plan_purchases')
        .select(`
          *,
          architectural_plans (title, category)
        `)
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer purchases:', error);
        return [];
      }

      return data?.map(this.mapDatabaseToPurchase) || [];
    } catch (error) {
      console.error('Error in getCustomerPurchases:', error);
      return [];
    }
  },

  // Admin functions
  async getAllPlans(): Promise<ArchitecturalPlan[]> {
    try {
      const { data, error } = await supabase
        .from('architectural_plans')
        .select(`
          *,
          plan_files (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all plans:', error);
        return [];
      }

      return data?.map(this.mapDatabaseToPlan) || [];
    } catch (error) {
      console.error('Error in getAllPlans:', error);
      return [];
    }
  },

  async approvePlan(planId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('approve_architectural_plan', {
        p_plan_id: planId,
        p_admin_id: adminId
      });

      if (error) {
        console.error('Error approving plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in approvePlan:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  async rejectPlan(planId: string, adminId: string, rejectionReason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('reject_architectural_plan', {
        p_plan_id: planId,
        p_admin_id: adminId,
        p_rejection_reason: rejectionReason
      });

      if (error) {
        console.error('Error rejecting plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in rejectPlan:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Helper functions
  mapDatabaseToPlan(data: any): ArchitecturalPlan {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      areaUnit: data.area_unit,
      floors: data.floors,
      price: data.price,
      currency: data.currency,
      discountPercentage: data.discount_percentage,
      features: data.features || [],
      style: data.style,
      isFeatured: data.is_featured,
      tags: data.tags || [],
      views: data.views,
      downloads: data.downloads,
      purchases: data.purchases,
      createdBy: data.created_by,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      rejectionReason: data.rejection_reason,
      rejectedAt: data.rejected_at ? new Date(data.rejected_at) : undefined,
      rejectedBy: data.rejected_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      files: data.plan_files?.map(this.mapDatabaseToPlanFile) || [],
      reviews: data.plan_reviews?.map(this.mapDatabaseToReview) || []
    };
  },

  mapDatabaseToPlanFile(data: any): PlanFile {
    return {
      id: data.id,
      planId: data.plan_id,
      fileType: data.file_type,
      fileName: data.file_name,
      fileUrl: data.file_url,
      fileSize: data.file_size,
      isPrimary: data.is_primary,
      displayOrder: data.display_order,
      createdAt: new Date(data.created_at)
    };
  },

  mapDatabaseToPurchase(data: any): PlanPurchase {
    return {
      id: data.id,
      planId: data.plan_id,
      customerEmail: data.customer_email,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      purchasePrice: data.purchase_price,
      currency: data.currency,
      paymentMethod: data.payment_method,
      paymentReference: data.payment_reference,
      status: data.status,
      downloadCount: data.download_count,
      firstDownloadedAt: data.first_downloaded_at ? new Date(data.first_downloaded_at) : undefined,
      lastDownloadedAt: data.last_downloaded_at ? new Date(data.last_downloaded_at) : undefined,
      downloadExpiresAt: data.download_expires_at ? new Date(data.download_expires_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  mapDatabaseToReview(data: any): PlanReview {
    return {
      id: data.id,
      planId: data.plan_id,
      reviewerName: data.reviewer_name,
      reviewerEmail: data.reviewer_email,
      rating: data.rating,
      reviewText: data.review_text,
      isVerifiedPurchase: data.is_verified_purchase,
      isApproved: data.is_approved,
      createdAt: new Date(data.created_at)
    };
  }
};
