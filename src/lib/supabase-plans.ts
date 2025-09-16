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

      return data?.map((item) => this.mapDatabaseToPlan(item)) || [];
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

      return data?.map((item) => this.mapDatabaseToPlan(item)) || [];
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

      return data?.map((item) => this.mapDatabaseToPurchase(item)) || [];
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

      return data?.map((item) => this.mapDatabaseToPlan(item)) || [];
    } catch (error) {
      console.error('Error in getAllPlans:', error);
      return [];
    }
  },

  async createPlan(plan: Partial<ArchitecturalPlan>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('architectural_plans')
        .insert({
          title: plan.title,
          description: plan.description,
          category: plan.category,
          status: plan.status || 'draft',
          bedrooms: plan.bedrooms,
          bathrooms: plan.bathrooms,
          area: plan.area,
          area_unit: plan.areaUnit,
          floors: plan.floors || 1,
          price: plan.price,
          currency: plan.currency || 'KSH',
          discount_percentage: plan.discountPercentage || 0,
          features: plan.features || [],
          style: plan.style,
          is_featured: !!plan.isFeatured,
          tags: plan.tags || [],
          created_by: plan.createdBy || null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    } catch (error) {
      console.error('Error in createPlan:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  async updatePlan(id: string, plan: Partial<ArchitecturalPlan>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {};
      if (plan.title !== undefined) updateData.title = plan.title;
      if (plan.description !== undefined) updateData.description = plan.description;
      if (plan.category !== undefined) updateData.category = plan.category;
      if (plan.status !== undefined) updateData.status = plan.status;
      if (plan.bedrooms !== undefined) updateData.bedrooms = plan.bedrooms;
      if (plan.bathrooms !== undefined) updateData.bathrooms = plan.bathrooms;
      if (plan.area !== undefined) updateData.area = plan.area;
      if (plan.areaUnit !== undefined) updateData.area_unit = plan.areaUnit;
      if (plan.floors !== undefined) updateData.floors = plan.floors;
      if (plan.price !== undefined) updateData.price = plan.price;
      if (plan.currency !== undefined) updateData.currency = plan.currency;
      if (plan.discountPercentage !== undefined) updateData.discount_percentage = plan.discountPercentage;
      if (plan.features !== undefined) updateData.features = plan.features;
      if (plan.style !== undefined) updateData.style = plan.style;
      if (plan.isFeatured !== undefined) updateData.is_featured = plan.isFeatured;
      if (plan.tags !== undefined) updateData.tags = plan.tags;

      const { error } = await supabase
        .from('architectural_plans')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updatePlan:', error);
      return { success: false, error: 'An unexpected error occurred' };
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

  // Upload plan files to storage and create plan_files records
  async uploadPlanFiles(
    planId: string,
    files: File[],
    fileType: PlanFileType,
    options?: { setPrimaryFromFirst?: boolean }
  ): Promise<{ success: boolean; error?: string; uploaded?: number }> {
    try {
      if (!files || files.length === 0) return { success: true, uploaded: 0 };

      const setPrimaryFromFirst = options?.setPrimaryFromFirst ?? true;
      let uploadedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop()?.toLowerCase() || 'dat';
        const objectPath = `${planId}/${Date.now()}-${i}.${ext}`;

        // Upload to storage bucket
        const { error: uploadError } = await supabase.storage
          .from('plan-files')
          .upload(objectPath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('❌ Plan file upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data: publicRes } = supabase.storage
          .from('plan-files')
          .getPublicUrl(objectPath);

        const publicUrl = publicRes?.publicUrl;

        // Insert DB record
        const { error: insertError } = await supabase
          .from('plan_files')
          .insert({
            plan_id: planId,
            file_type: fileType,
            file_name: objectPath,
            file_url: publicUrl,
            file_size: file.size,
            is_primary: setPrimaryFromFirst && uploadedCount === 0,
            display_order: uploadedCount + 1
          });

        if (insertError) {
          console.error('❌ Error saving plan file record:', insertError);
          // Best effort cleanup
          await supabase.storage.from('plan-files').remove([objectPath]);
          continue;
        }

        uploadedCount++;
      }

      return { success: true, uploaded: uploadedCount };
    } catch (error) {
      console.error('Error in uploadPlanFiles:', error);
      return { success: false, error: 'Failed to upload plan files' };
    }
  },

  // Set a specific file as primary for a plan (ensures only one primary)
  async setPrimaryPlanFile(planId: string, fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear existing primary flags
      const { error: clearError } = await supabase
        .from('plan_files')
        .update({ is_primary: false })
        .eq('plan_id', planId);
      if (clearError) return { success: false, error: clearError.message };

      // Set selected file as primary
      const { error: setError } = await supabase
        .from('plan_files')
        .update({ is_primary: true })
        .eq('id', fileId);
      if (setError) return { success: false, error: setError.message };

      return { success: true };
    } catch (error) {
      console.error('Error in setPrimaryPlanFile:', error);
      return { success: false, error: 'Failed to set primary file' };
    }
  },

  // Delete a plan file (removes storage object and DB record)
  async deletePlanFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error: fetchError } = await supabase
        .from('plan_files')
        .select('id, file_name')
        .eq('id', fileId)
        .single();
      if (fetchError || !data) return { success: false, error: fetchError?.message || 'File not found' };

      const objectPath = data.file_name as string;

      // Remove storage object (best effort)
      await supabase.storage.from('plan-files').remove([objectPath]);

      // Remove DB record
      const { error: deleteError } = await supabase
        .from('plan_files')
        .delete()
        .eq('id', fileId);
      if (deleteError) return { success: false, error: deleteError.message };

      return { success: true };
    } catch (error) {
      console.error('Error in deletePlanFile:', error);
      return { success: false, error: 'Failed to delete plan file' };
    }
  },

  // Reorder plan files by providing an ordered list of file IDs
  async reorderPlanFiles(planId: string, orderedFileIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      // For each id, set display_order = index + 1
      for (let i = 0; i < orderedFileIds.length; i++) {
        const id = orderedFileIds[i];
        const { error } = await supabase
          .from('plan_files')
          .update({ display_order: i + 1 })
          .eq('id', id)
          .eq('plan_id', planId);
        if (error) return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Error in reorderPlanFiles:', error);
      return { success: false, error: 'Failed to reorder plan files' };
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
      files: data.plan_files?.map((file: any) => this.mapDatabaseToPlanFile(file)) || [],
      reviews: data.plan_reviews?.map((review: any) => this.mapDatabaseToReview(review)) || []
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
