import { supabase } from './supabase'
import { Database } from './database.types'

// Type definitions based on database schema
type ProviderRow = Database['public']['Tables']['providers']['Row']
type ProviderInsert = Database['public']['Tables']['providers']['Insert']
type ProviderUpdate = Database['public']['Tables']['providers']['Update']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

// Extended provider type that includes profile information
export interface ProviderWithProfile extends ProviderRow {
  profile?: ProfileRow
  // Computed fields for compatibility with existing interface
  name: string
  email: string
  phone: string
  logo: string
  website: string
  description: string
  rating: number
  reviews: number
  yearsInBusiness: number
  specialties: string[]
  isVerified: boolean
  isApproved: boolean
  approvalStatus: 'pending' | 'approved' | 'rejected'
  joinedDate: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectionReason?: string
}

export interface ProviderRegistrationData {
  name: string
  email: string
  phone: string
  businessName: string
  businessEmail: string
  businessPhone: string
  city: string
  password: string
  confirmPassword: string
  profilePhoto?: File
}

export const providerService = {
  // Get all providers with their profiles
  async getAllProviders(): Promise<ProviderWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          profiles!providers_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching providers:', error)
        return []
      }

      return (data || []).map(provider => this.transformProviderData(provider))
    } catch (error) {
      console.error('Error in getAllProviders:', error)
      return []
    }
  },

  // Get providers by status
  async getProvidersByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<ProviderWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          profiles!providers_user_id_fkey(*)
        `)
        .eq('profiles.status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching providers by status:', error)
        return []
      }

      return (data || []).map(provider => this.transformProviderData(provider))
    } catch (error) {
      console.error('Error in getProvidersByStatus:', error)
      return []
    }
  },

  // Register a new provider
  async registerProvider(data: ProviderRegistrationData): Promise<{ success: boolean; providerId?: string; error?: string }> {
    try {
      // First, create the auth user and profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: data.name,
            role: 'provider',
            phone: data.phone
          }
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create the provider record
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .insert({
          user_id: authData.user.id,
          business_name: data.businessName,
          business_email: data.businessEmail,
          business_phone: data.businessPhone,
          city: data.city,
          subscription_status: 'inactive',
          subscription_plan: 'basic'
        })
        .select()
        .single()

      if (providerError) {
        console.error('Error creating provider:', providerError)
        return { success: false, error: providerError.message }
      }

      return { 
        success: true, 
        providerId: providerData.id,
        error: 'Please check your email to confirm your account before approval.'
      }
    } catch (error) {
      console.error('Error in registerProvider:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Approve a provider
  async approveProvider(providerId: string, adminId: string): Promise<boolean> {
    try {
      console.log('✅ Admin approving provider with notifications:', providerId)

      // Use the enhanced function that includes notifications
      const { data, error } = await supabase.rpc('approve_provider_with_notification', {
        p_provider_id: providerId,
        p_admin_id: adminId
      });

      if (error) {
        console.error('❌ Error with notification function, falling back:', error)
        
        // Fallback to basic approval if function doesn't exist
        const { data: provider, error: fetchError } = await supabase
          .from('providers')
          .select('user_id')
          .eq('id', providerId)
          .single()

        if (fetchError || !provider) {
          console.error('Error fetching provider:', fetchError)
          return false
        }

        // Update the profile status to approved
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', provider.user_id)

        if (profileError) {
          console.error('Error updating profile status:', profileError)
          return false
        }

        // Update the provider record
        const { error: providerError } = await supabase
          .from('providers')
          .update({
            approved_at: new Date().toISOString(),
            approved_by: adminId,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', providerId)

        if (providerError) {
          console.error('Error updating provider:', providerError)
          return false
        }

        console.log('✅ Provider approved with fallback method')
        return true
      }

      if (data) {
        console.log('✅ Provider approved with notifications sent')
        return true
      } else {
        console.log('❌ Provider not found')
        return false
      }
    } catch (error) {
      console.error('Error in approveProvider:', error)
      return false
    }
  },

  // Reject a provider
  async rejectProvider(providerId: string, adminId: string, reason?: string): Promise<boolean> {
    try {
      console.log('❌ Admin rejecting provider with notifications:', providerId, 'Reason:', reason)

      // Use the enhanced function that includes notifications
      const { data, error } = await supabase.rpc('reject_provider_with_notification', {
        p_provider_id: providerId,
        p_admin_id: adminId,
        p_rejection_reason: reason || 'No reason provided'
      });

      if (error) {
        console.error('❌ Error with notification function, falling back:', error)
        
        // Fallback to basic rejection if function doesn't exist
        const { data: provider, error: fetchError } = await supabase
          .from('providers')
          .select('user_id')
          .eq('id', providerId)
          .single()

        if (fetchError || !provider) {
          console.error('Error fetching provider:', fetchError)
          return false
        }

        // Update the profile status to rejected
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', provider.user_id)

        if (profileError) {
          console.error('Error updating profile status:', profileError)
          return false
        }

        // Update the provider record
        const { error: providerError } = await supabase
          .from('providers')
          .update({
            approved_by: adminId, // Track who made the decision
            updated_at: new Date().toISOString()
          })
          .eq('id', providerId)

        if (providerError) {
          console.error('Error updating provider:', providerError)
          return false
        }

        console.log('✅ Provider rejected with fallback method')
        return true
      }

      if (data) {
        console.log('✅ Provider rejected with notifications sent')
        return true
      } else {
        console.log('❌ Provider not found')
        return false
      }
    } catch (error) {
      console.error('Error in rejectProvider:', error)
      return false
    }
  },

  // Delete a provider (soft delete)
  async deleteProvider(providerId: string, adminId: string): Promise<boolean> {
    try {
      console.log('🗑️ Admin soft-deleting provider:', providerId);

      // First, get the user_id associated with the provider
      const { data: provider, error: fetchError } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', providerId)
        .single();

      if (fetchError || !provider) {
        console.error('Error fetching provider for deletion:', fetchError);
        return false;
      }

      // Call the soft_delete_user RPC function
      const { data, error } = await supabase.rpc('soft_delete_user', {
        p_user_id: provider.user_id,
        p_admin_id: adminId,
        p_reason: 'Provider deleted by admin'
      });

      if (error) {
        console.error('❌ Error soft-deleting user (provider):', error);
        return false;
      }

      if (data) {
        console.log('✅ Provider (user profile) soft-deleted successfully, cascade initiated.');
        return true;
      } else {
        console.log('❌ Soft-delete operation returned false.');
        return false;
      }
    } catch (error) {
      console.error('Error in deleteProvider:', error);
      return false;
    }
  },

  // Transform database data to match existing interface
  transformProviderData(provider: any): ProviderWithProfile {
    const profile = provider.profiles || {}
    
    return {
      ...provider,
      profile,
      // Map database fields to existing interface
      name: profile.name || 'Unknown',
      email: profile.email || provider.business_email,
      phone: profile.phone || provider.business_phone,
      logo: profile.avatar_url || '/api/placeholder/80/80',
      website: `www.${provider.business_name.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `Professional real estate services in ${provider.city}.`,
      rating: 4.5, // Default rating - could be calculated from reviews
      reviews: 0, // Default - could be counted from actual reviews
      yearsInBusiness: Math.max(1, new Date().getFullYear() - new Date(provider.created_at).getFullYear()),
      specialties: ['Residential', 'Property Sales'], // Default - could be stored in database
      isVerified: profile.status === 'approved',
      isApproved: profile.status === 'approved',
      approvalStatus: this.mapProfileStatusToApprovalStatus(profile.status),
      joinedDate: provider.created_at?.split('T')[0] || '',
      approvedAt: provider.approved_at?.split('T')[0],
      approvedBy: provider.approved_by,
      rejectedAt: profile.status === 'rejected' ? profile.updated_at?.split('T')[0] : undefined,
      rejectedBy: profile.status === 'rejected' ? provider.approved_by : undefined,
      rejectionReason: undefined // Could be added to database schema
    }
  },

  // Map profile status to approval status
  mapProfileStatusToApprovalStatus(status: string): 'pending' | 'approved' | 'rejected' {
    switch (status) {
      case 'approved':
        return 'approved'
      case 'rejected':
        return 'rejected'
      default:
        return 'pending'
    }
  },

  // Subscribe to real-time changes
  subscribeToProviders(callback: (providers: ProviderWithProfile[]) => void) {
    const channel = supabase
      .channel('providers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'providers'
        },
        async () => {
          // Refetch all providers when any change occurs
          const providers = await this.getAllProviders()
          callback(providers)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        async () => {
          // Also listen to profile changes since approval status is stored there
          const providers = await this.getAllProviders()
          callback(providers)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
