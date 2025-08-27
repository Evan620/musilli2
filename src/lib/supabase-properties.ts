import { supabase } from './supabase'
import { Property, PropertyFormData, PropertySearchFilters } from '@/types'

export const propertyService = {
  // Get all published properties
  async getPublishedProperties(): Promise<Property[]> {
    try {
      console.log('🔍 Fetching published properties from Supabase...');

      // First, try a simple query without JOINs to test basic access
      console.log('🧪 Testing basic property access...');
      const { data: basicData, error: basicError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published');

      if (basicError) {
        console.error('❌ Basic query failed:', basicError);
        return [];
      }

      console.log('✅ Basic query found', basicData?.length || 0, 'published properties');

      if (!basicData || basicData.length === 0) {
        console.log('⚠️ No published properties found in database');
        return [];
      }

      // Now try the full query with JOINs
      console.log('🔄 Attempting full query with JOINs...');
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_locations(*),
          property_features(*),
          property_amenities(*),
          property_utilities(*),
          property_images(*),
          providers(*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ JOIN query failed:', error);
        console.log('🔄 Falling back to basic data without related tables...');

        // Transform basic data without related tables
        const fallbackProperties = basicData.map(property => ({
          id: property.id,
          title: property.title,
          description: property.description,
          type: property.type,
          category: property.category,
          status: property.status,
          price: property.price,
          currency: property.currency,
          location: {
            address: 'Address not available',
            city: 'City not available',
            state: 'State not available',
            country: 'Kenya',
            zipCode: ''
          },
          features: {
            bedrooms: 0,
            bathrooms: 0,
            area: 0,
            areaUnit: 'sqm',
            parking: 0,
            furnished: false,
            petFriendly: false,
            amenities: [],
            utilities: []
          },
          images: [],
          views: property.views || 0,
          inquiries: property.inquiries || 0,
          providerId: property.provider_id,
          provider: property.provider_id ? undefined : {
            id: 'admin',
            businessName: 'Admin',
            contactPerson: 'Administrator',
            email: 'admin@example.com',
            phone: '',
            city: 'Nairobi',
            isApproved: true
          },
          createdAt: property.created_at,
          updatedAt: property.updated_at,
          publishedAt: property.published_at,
          isFeatured: property.is_featured || false
        }));

        console.log('✅ Returning', fallbackProperties.length, 'properties with basic data');
        return fallbackProperties;
      }

      console.log('📦 Full query successful:', data?.length || 0, 'records');
      const transformedProperties = data.map(this.transformPropertyData);
      console.log('✅ Transformed properties:', transformedProperties.length);

      return transformedProperties;
    } catch (error) {
      console.error('❌ Exception fetching properties:', error)
      return [];
    }
  },

  // Get ALL properties for admin (including pending, published, etc.)
  async getAllProperties(): Promise<Property[]> {
    try {
      console.log('🔍 Fetching ALL properties for admin...');

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_locations(*),
          property_features(*),
          property_amenities(*),
          property_utilities(*),
          property_images(*),
          providers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching all properties:', error);
        return [];
      }

      console.log('✅ Loaded', data?.length || 0, 'total properties');
      return data?.map(this.transformPropertyData) || [];
    } catch (error) {
      console.error('Error fetching all properties:', error);
      return [];
    }
  },

  // Get pending properties for admin approval
  async getPendingProperties(): Promise<Property[]> {
    try {
      console.log('🔍 Fetching pending properties for admin approval...');

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_locations(*),
          property_features(*),
          property_amenities(*),
          property_utilities(*),
          property_images(*),
          providers(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching pending properties:', error);
        return [];
      }

      console.log('✅ Loaded', data?.length || 0, 'pending properties');
      return data?.map(this.transformPropertyData) || [];
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      return [];
    }
  },

  // Get property by ID
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_locations(*),
          property_features(*),
          property_amenities(*),
          property_utilities(*),
          property_images(*),
          providers(*)
        `)
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Error fetching property:', error)
        return null
      }

      return this.transformPropertyData(data)
    } catch (error) {
      console.error('Error fetching property:', error)
      return null
    }
  },

  // Get properties for current provider
  async getProviderProperties(): Promise<Property[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const isAdmin = user.user_metadata?.role === 'admin';

      if (isAdmin) {
        // For pure admin users, get properties with null provider_id (admin-created properties)
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            property_locations(*),
            property_features(*),
            property_amenities(*),
            property_utilities(*),
            property_images(*),
            providers(*)
          `)
          .is('provider_id', null)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching admin properties:', error)
          return []
        }

        return data.map(this.transformPropertyData)
      } else {
        // For regular providers
        const { data: provider } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!provider) return []

        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            property_locations(*),
            property_features(*),
            property_amenities(*),
            property_utilities(*),
            property_images(*),
            providers(*)
          `)
          .eq('provider_id', provider.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching provider properties:', error)
          return []
        }

        return data.map(this.transformPropertyData)
      }
    } catch (error) {
      console.error('Error fetching provider properties:', error)
      return []
    }
  },

  // Create new property
  async createProperty(
    propertyData: PropertyFormData,
    onProgress?: (current: number, total: number, fileName: string) => void
  ): Promise<{ success: boolean; error?: string; propertyId?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'Not authenticated' }

      let providerId: string;
      let propertyStatus: string;

      // Check if user is admin
      const isAdmin = user.user_metadata?.role === 'admin';

      if (isAdmin) {
        // For pure admin users, we don't need a provider record
        // Admin properties will be created without a provider_id
        providerId = null;
        propertyStatus = 'published'; // Admin properties are auto-published
      } else {
        // For regular providers
        const { data: provider } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!provider) return { success: false, error: 'Provider not found' }
        providerId = provider.id;
        propertyStatus = 'pending'; // Provider properties need approval
      }

      // Create property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          title: propertyData.title,
          description: propertyData.description,
          type: propertyData.type,
          category: propertyData.category,
          price: propertyData.price,
          currency: propertyData.currency,
          provider_id: providerId,
          status: propertyStatus,
          published_at: propertyStatus === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (propertyError || !property) {
        return { success: false, error: propertyError?.message || 'Failed to create property' }
      }

      // Create location
      const { error: locationError } = await supabase
        .from('property_locations')
        .insert({
          property_id: property.id,
          address: propertyData.location.address || '',
          city: propertyData.location.city,
          state: propertyData.location.state || '',
          country: propertyData.location.country || 'Kenya',
          zip_code: propertyData.location.zipCode || ''
        })

      if (locationError) {
        console.error('❌ Error creating location:', locationError)
        return { success: false, error: `Failed to save location: ${locationError.message}` }
      }

      // Create features
      const { error: featuresError } = await supabase
        .from('property_features')
        .insert({
          property_id: property.id,
          bedrooms: propertyData.features.bedrooms || 0,
          bathrooms: propertyData.features.bathrooms || 0,
          area: propertyData.features.area || 0,
          area_unit: propertyData.features.areaUnit || 'sqft',
          parking: propertyData.features.parking || 0,
          furnished: propertyData.features.furnished || false,
          pet_friendly: propertyData.features.petFriendly || false
        })

      if (featuresError) {
        console.error('❌ Error creating features:', featuresError)
        return { success: false, error: `Failed to save features: ${featuresError.message}` }
      }

      // Create amenities
      if (propertyData.features.amenities) {
        const amenities = propertyData.features.amenities.split(',').map(a => a.trim()).filter(Boolean)
        if (amenities.length > 0) {
          const { error: amenitiesError } = await supabase
            .from('property_amenities')
            .insert(
              amenities.map(amenity => ({
                property_id: property.id,
                amenity
              }))
            )

          if (amenitiesError) {
            console.error('❌ Error creating amenities:', amenitiesError)
            return { success: false, error: `Failed to save amenities: ${amenitiesError.message}` }
          }
        }
      }

      // Create utilities
      if (propertyData.features.utilities) {
        const utilities = propertyData.features.utilities.split(',').map(u => u.trim()).filter(Boolean)
        if (utilities.length > 0) {
          const { error: utilitiesError } = await supabase
            .from('property_utilities')
            .insert(
              utilities.map(utility => ({
                property_id: property.id,
                utility
              }))
            )

          if (utilitiesError) {
            console.error('❌ Error creating utilities:', utilitiesError)
            return { success: false, error: `Failed to save utilities: ${utilitiesError.message}` }
          }
        }
      }

      // Handle image uploads
      if (propertyData.images && propertyData.images.length > 0) {
        console.log('📸 Starting image upload process...', propertyData.images.length, 'images')

        let uploadedCount = 0
        const maxImages = Math.min(propertyData.images.length, 10) // Limit to 10 images
        const errors: string[] = []

        for (let i = 0; i < maxImages; i++) {
          const file = propertyData.images[i]
          console.log(`📸 Processing image ${i + 1}/${maxImages}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

          // Notify progress callback BEFORE processing
          if (onProgress) {
            console.log(`📊 Progress callback: ${i + 1}/${maxImages} - ${file.name}`)
            onProgress(i + 1, maxImages, file.name)
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            console.warn(`⚠️ Skipping non-image file: ${file.name}`)
            errors.push(`${file.name}: Not an image file`)
            continue
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            console.warn(`⚠️ Skipping large file (${(file.size / 1024 / 1024).toFixed(1)}MB): ${file.name}`)
            errors.push(`${file.name}: File too large (max 10MB)`)
            continue
          }

          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
          const fileName = `${property.id}/${Date.now()}-${i}.${fileExt}`
          console.log(`📁 Generated filename: ${fileName}`)

          try {
            // Small delay to make progress visible
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 300))
            }

            console.log(`⬆️ Uploading to storage: ${fileName}`)
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('property-images')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              })

            if (uploadError) {
              console.error('❌ Storage upload error:', uploadError)
              errors.push(`${file.name}: ${uploadError.message}`)

              // If it's a bucket not found error, provide helpful message
              if (uploadError.message.includes('Bucket not found')) {
                console.error('💡 Please create a "property-images" storage bucket in Supabase Dashboard')
              }
              continue // Skip this image but continue with others
            }

            console.log('✅ Storage upload successful:', uploadData)

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('property-images')
              .getPublicUrl(fileName)

            console.log(`🔗 Generated public URL: ${publicUrl}`)

            // Save image record to database
            console.log(`💾 Saving image record to database...`)
            const { error: imageError } = await supabase
              .from('property_images')
              .insert({
                property_id: property.id,
                url: publicUrl,
                alt_text: `${propertyData.title} - Image ${uploadedCount + 1}`,
                is_primary: uploadedCount === 0, // First successfully uploaded image is primary
                display_order: uploadedCount + 1
              })

            if (imageError) {
              console.error('❌ Database save error:', imageError)
              errors.push(`${file.name}: Failed to save to database - ${imageError.message}`)

              // Clean up uploaded file if database save fails
              console.log(`🧹 Cleaning up uploaded file: ${fileName}`)
              await supabase.storage
                .from('property-images')
                .remove([fileName])
            } else {
              uploadedCount++
              console.log(`✅ Image ${uploadedCount} uploaded and saved successfully: ${fileName}`)
            }
          } catch (error) {
            console.error('❌ Unexpected error processing image:', error)
            errors.push(`${file.name}: Unexpected error - ${error}`)
          }
        }

        console.log(`📸 Image upload complete: ${uploadedCount}/${maxImages} images uploaded successfully`)
        if (errors.length > 0) {
          console.warn('⚠️ Upload errors:', errors)
        }
      }

      return { success: true, propertyId: property.id }
    } catch (error) {
      console.error('Error creating property:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Update property
  async updateProperty(id: string, propertyData: Partial<PropertyFormData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'Not authenticated' }

      // Check if user has permission to update this property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('provider_id, providers(user_id)')
        .eq('id', id)
        .single()

      if (propertyError || !property) {
        return { success: false, error: 'Property not found' }
      }

      const isAdmin = user.user_metadata?.role === 'admin'
      const isOwner = property.providers?.user_id === user.id

      if (!isAdmin && !isOwner) {
        return { success: false, error: 'Not authorized to update this property' }
      }

      // Update main property data
      const updateData: any = {}
      if (propertyData.title) updateData.title = propertyData.title
      if (propertyData.description) updateData.description = propertyData.description
      if (propertyData.type) updateData.type = propertyData.type
      if (propertyData.category) updateData.category = propertyData.category
      if (propertyData.price) updateData.price = propertyData.price
      if (propertyData.currency) updateData.currency = propertyData.currency

      // Handle status changes with published_at logic
      if (propertyData.status) {
        updateData.status = propertyData.status

        // Set published_at when status changes to 'published'
        if (propertyData.status === 'published') {
          updateData.published_at = new Date().toISOString()
          console.log('✅ Setting published_at for property approval')
        }
        // Clear published_at when status changes away from 'published'
        else if (propertyData.status !== 'published') {
          updateData.published_at = null
          console.log('🔄 Clearing published_at for status:', propertyData.status)
        }
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      // Update location if provided
      if (propertyData.location) {
        const { error: locationError } = await supabase
          .from('property_locations')
          .update({
            address: propertyData.location.address || '',
            city: propertyData.location.city || '',
            state: propertyData.location.state || '',
            country: propertyData.location.country || 'Kenya',
            zip_code: propertyData.location.zipCode || ''
          })
          .eq('property_id', id)

        if (locationError) {
          console.error('Error updating location:', locationError)
        }
      }

      // Update features if provided
      if (propertyData.features) {
        const { error: featuresError } = await supabase
          .from('property_features')
          .update({
            bedrooms: propertyData.features.bedrooms || 0,
            bathrooms: propertyData.features.bathrooms || 0,
            area: propertyData.features.area || 0,
            parking: propertyData.features.parking || 0,
            furnished: propertyData.features.furnished || false
          })
          .eq('property_id', id)

        if (featuresError) {
          console.error('Error updating features:', featuresError)
        }

        // Update utilities if provided
        if (propertyData.features.utilities) {
          // First, delete existing utilities
          await supabase
            .from('property_utilities')
            .delete()
            .eq('property_id', id)

          // Then insert new utilities
          const utilities = propertyData.features.utilities.split(',').map(u => u.trim()).filter(Boolean)
          if (utilities.length > 0) {
            const { error: utilitiesError } = await supabase
              .from('property_utilities')
              .insert(
                utilities.map(utility => ({
                  property_id: id,
                  utility
                }))
              )

            if (utilitiesError) {
              console.error('Error updating utilities:', utilitiesError)
            }
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating property:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Delete property
  async deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'Not authenticated' }

      // Check if user has permission to delete this property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('provider_id, providers(user_id)')
        .eq('id', id)
        .single()

      if (propertyError || !property) {
        return { success: false, error: 'Property not found' }
      }

      const isAdmin = user.user_metadata?.role === 'admin'
      const isOwner = property.providers?.user_id === user.id

      if (!isAdmin && !isOwner) {
        return { success: false, error: 'Not authorized to delete this property' }
      }

      // Delete related records first (due to foreign key constraints)
      await supabase.from('property_images').delete().eq('property_id', id)
      await supabase.from('property_amenities').delete().eq('property_id', id)
      await supabase.from('property_utilities').delete().eq('property_id', id)
      await supabase.from('property_features').delete().eq('property_id', id)
      await supabase.from('property_locations').delete().eq('property_id', id)
      await supabase.from('property_views').delete().eq('property_id', id)
      await supabase.from('inquiries').delete().eq('property_id', id)

      // Finally delete the property
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting property:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Search properties with filters
  async searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_locations(*),
          property_features(*),
          property_amenities(*),
          property_utilities(*),
          property_images(*),
          providers(*)
        `)
        .eq('status', 'published')

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters.city) {
        // This requires a join, so we'll filter after fetching
      }

      // Apply sorting
      if (filters.sortBy) {
        const ascending = filters.sortOrder === 'asc'
        query = query.order(filters.sortBy, { ascending })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error searching properties:', error)
        return []
      }

      let results = data.map(this.transformPropertyData)

      // Apply additional filters that require post-processing
      if (filters.query) {
        const searchTerm = filters.query.toLowerCase()
        results = results.filter(property =>
          property.title.toLowerCase().includes(searchTerm) ||
          property.description.toLowerCase().includes(searchTerm) ||
          property.location.city.toLowerCase().includes(searchTerm) ||
          property.location.address.toLowerCase().includes(searchTerm)
        )
      }

      if (filters.city) {
        results = results.filter(property => property.location.city === filters.city)
      }

      if (filters.bedrooms) {
        results = results.filter(property => property.features.bedrooms === filters.bedrooms)
      }

      if (filters.bathrooms) {
        results = results.filter(property => property.features.bathrooms === filters.bathrooms)
      }

      if (filters.minArea) {
        results = results.filter(property => property.features.area >= filters.minArea!)
      }

      if (filters.maxArea) {
        results = results.filter(property => property.features.area <= filters.maxArea!)
      }

      if (filters.amenities && filters.amenities.length > 0) {
        results = results.filter(property =>
          filters.amenities!.every(amenity =>
            property.features.amenities.includes(amenity)
          )
        )
      }

      return results
    } catch (error) {
      console.error('Error searching properties:', error)
      return []
    }
  },

  // Record property view
  async recordPropertyView(propertyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase
        .from('property_views')
        .insert({
          property_id: propertyId,
          viewer_id: user?.id || null,
          viewer_ip: null // Could be populated from request if needed
        })
    } catch (error) {
      console.error('Error recording property view:', error)
    }
  },

  // Admin functions for property approval
  async approveProperty(propertyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.role !== 'admin') {
        return { success: false, error: 'Not authorized' }
      }

      console.log('✅ Admin approving property:', propertyId)

      const { error } = await supabase
        .from('properties')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (error) {
        console.error('❌ Error approving property:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Property approved and published')
      return { success: true }
    } catch (error) {
      console.error('❌ Exception approving property:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  async rejectProperty(propertyId: string, rejectionReason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.role !== 'admin') {
        return { success: false, error: 'Not authorized' }
      }

      console.log('❌ Admin rejecting property:', propertyId, 'Reason:', rejectionReason)

      // Try to use the database function first (if migration has been run)
      try {
        const { data, error } = await supabase.rpc('reject_property_with_reason', {
          p_property_id: propertyId,
          p_admin_id: user.id,
          p_rejection_reason: rejectionReason || null
        })

        if (!error && data) {
          console.log('✅ Property rejected with database function')
          return { success: true }
        }
      } catch (funcError) {
        console.log('⚠️ Database function not available, using fallback method')
      }

      // Fallback method - direct update (works even without migration)
      const updateData: any = {
        status: 'rejected',
        published_at: null,
        updated_at: new Date().toISOString()
      }

      // Add rejection fields if they exist (after migration)
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason
        updateData.rejected_at = new Date().toISOString()
        updateData.rejected_by = user.id
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)

      if (updateError) {
        console.error('❌ Error rejecting property:', updateError)
        return { success: false, error: updateError.message }
      }

      console.log('✅ Property rejected with fallback method')
      return { success: true }
    } catch (error) {
      console.error('❌ Exception rejecting property:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Get rejected properties for admin
  async getRejectedProperties(): Promise<Property[]> {
    try {
      console.log('🔍 Fetching rejected properties for admin...');

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_locations(*),
          property_features(*),
          property_amenities(*),
          property_utilities(*),
          property_images(*),
          providers(*),
          rejected_by_profile:profiles!properties_rejected_by_fkey(*)
        `)
        .eq('status', 'rejected')
        .order('rejected_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching rejected properties:', error);
        return [];
      }

      console.log('✅ Loaded', data?.length || 0, 'rejected properties');
      return data?.map(this.transformPropertyData) || [];
    } catch (error) {
      console.error('Error fetching rejected properties:', error);
      return [];
    }
  },

  // Transform raw database data to Property type
  transformPropertyData(data: any): Property {
    const location = data.property_locations?.[0] || {}
    const features = data.property_features?.[0] || {}
    const amenities = data.property_amenities?.map((a: any) => a.amenity) || []
    const utilities = data.property_utilities?.map((u: any) => u.utility) || []
    const images = data.property_images?.map((img: any) => ({
      id: img.id,
      url: img.url,
      alt: img.alt_text || '',
      isPrimary: img.is_primary,
      order: img.display_order
    })) || []

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      status: data.status,
      price: parseFloat(data.price),
      currency: data.currency,
      location: {
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        country: location.country || 'Kenya',
        zipCode: location.zip_code,
        coordinates: location.latitude && location.longitude ? {
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude)
        } : undefined
      },
      features: {
        bedrooms: features.bedrooms,
        bathrooms: features.bathrooms,
        area: parseFloat(features.area) || 0,
        areaUnit: features.area_unit || 'sqft',
        parking: features.parking,
        furnished: features.furnished || false,
        petFriendly: features.pet_friendly || false,
        amenities,
        utilities
      },
      images,
      providerId: data.provider_id,
      provider: data.providers ? {
        id: data.providers.id,
        email: data.providers.business_email,
        name: data.providers.business_name,
        role: 'provider',
        status: 'approved',
        businessName: data.providers.business_name,
        businessEmail: data.providers.business_email,
        businessPhone: data.providers.business_phone,
        city: data.providers.city,
        subscriptionStatus: data.providers.subscription_status,
        subscriptionPlan: data.providers.subscription_plan,
        totalListings: data.providers.total_listings,
        totalViews: data.providers.total_views,
        totalInquiries: data.providers.total_inquiries,
        createdAt: new Date(data.providers.created_at),
        updatedAt: new Date(data.providers.updated_at)
      } : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      views: data.views || 0,
      inquiries: data.inquiries || 0,
      isFeatured: data.is_featured || false,
      // Rejection fields (may not exist if migration hasn't been run)
      rejectionReason: data.rejection_reason || undefined,
      rejectedAt: data.rejected_at ? new Date(data.rejected_at) : undefined,
      rejectedBy: data.rejected_by || undefined
    }
  }
}

// Inquiry service
export const inquiryService = {
  // Submit property inquiry
  async submitInquiry(inquiryData: {
    propertyId: string
    inquirerName: string
    inquirerEmail: string
    inquirerPhone?: string
    message: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert({
          property_id: inquiryData.propertyId,
          inquirer_name: inquiryData.inquirerName,
          inquirer_email: inquiryData.inquirerEmail,
          inquirer_phone: inquiryData.inquirerPhone,
          message: inquiryData.message
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error submitting inquiry:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Get inquiries for provider's properties
  async getProviderInquiries(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          properties(title, type, category)
        `)
        .in('property_id',
          supabase
            .from('properties')
            .select('id')
            .in('provider_id',
              supabase
                .from('providers')
                .select('id')
                .eq('user_id', user.id)
            )
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching inquiries:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      return []
    }
  },

  // Respond to inquiry
  async respondToInquiry(inquiryId: string, response: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          response,
          status: 'responded',
          responded_at: new Date().toISOString()
        })
        .eq('id', inquiryId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error responding to inquiry:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
