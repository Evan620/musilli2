import { supabase } from './supabase';
import { LandDetails, LandBoundary, LandDocument, LandValuation, Property } from '@/types';

/**
 * Specialized service for land property management
 * Handles land-specific operations, documents, and analytics
 */
export const landService = {
  
  // Create land property with specialized details
  async createLandProperty(propertyData: any, landData: Partial<LandDetails>): Promise<{ success: boolean; propertyId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      // Use the database function for complete land property creation
      const { data, error } = await supabase.rpc('create_land_property', {
        property_data: propertyData,
        land_data: landData
      });

      if (error) {
        console.error('❌ Error creating land property:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Land property created:', data);
      return { success: true, propertyId: data };
    } catch (error) {
      console.error('❌ Exception creating land property:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get land details for a property
  async getLandDetails(propertyId: string): Promise<LandDetails | null> {
    try {
      const { data, error } = await supabase
        .from('land_details')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (error) {
        console.error('❌ Error fetching land details:', error);
        return null;
      }

      return this.transformLandDetails(data);
    } catch (error) {
      console.error('❌ Exception fetching land details:', error);
      return null;
    }
  },

  // Update land details
  async updateLandDetails(propertyId: string, landData: Partial<LandDetails>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const updateData = this.transformLandDetailsForDB(landData);
      
      const { error } = await supabase
        .from('land_details')
        .upsert({
          property_id: propertyId,
          ...updateData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error updating land details:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Exception updating land details:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get land properties with enhanced filtering (fallback for missing land_details table)
  async searchLandProperties(filters: {
    zoning?: string;
    minArea?: number;
    maxArea?: number;
    developmentStatus?: string;
    electricityAvailable?: boolean;
    waterConnectionAvailable?: boolean;
    priceRange?: { min: number; max: number };
    city?: string;
  }): Promise<Property[]> {
    try {
      console.log('🔍 Searching land properties with filters:', filters);

      // Fallback: Use basic property query without land_details (until migration is run)
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
        .eq('type', 'land')
        .eq('status', 'published');

      // Apply basic filters that work with existing schema
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          query = query.gte('price', filters.priceRange.min);
        }
        if (filters.priceRange.max) {
          query = query.lte('price', filters.priceRange.max);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error searching land properties:', error);
        return [];
      }

      console.log('✅ Found', data?.length || 0, 'land properties');

      // Use existing property transformation (without land details)
      return data?.map((item) => this.transformLandPropertyData(item)) || [];
    } catch (error) {
      console.error('❌ Exception searching land properties:', error);
      return [];
    }
  },

  // Get land analytics (with fallback for missing tables)
  async getLandAnalytics(): Promise<{
    totalLandListings: number;
    averagePricePerAcre: number;
    popularZoning: { zoning: string; count: number }[];
    developmentStatusBreakdown: { status: string; count: number }[];
    infrastructureAvailability: {
      electricity: number;
      water: number;
      sewer: number;
      internet: number;
    };
  }> {
    try {
      console.log('🔍 Getting land analytics...');

      // Try with land_details first, fallback to basic query
      let landStats: any[] = [];
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id, price,
            property_features(area, area_unit),
            land_details(zoning, development_status, electricity_available,
                        water_connection_available, sewer_connection_available, internet_coverage)
          `)
          .eq('type', 'land')
          .eq('status', 'published');

        if (error) throw error;
        landStats = data;
        console.log('✅ Using enhanced land analytics with land_details');
      } catch (detailsError) {
        console.log('⚠️ land_details not available, using basic analytics');
        // Fallback to basic query without land_details
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id, price,
            property_features(area, area_unit)
          `)
          .eq('type', 'land')
          .eq('status', 'published');

        if (error) throw error;
        landStats = data;
      }

      const totalLandListings = landStats?.length || 0;
      
      // Calculate average price per acre (convert all to acres for comparison)
      let totalPricePerAcre = 0;
      let validPriceCount = 0;

      const zoningCounts: { [key: string]: number } = {};
      const statusCounts: { [key: string]: number } = {};
      const infrastructure = { electricity: 0, water: 0, sewer: 0, internet: 0 };

      landStats?.forEach((property: any) => {
        const features = property.property_features?.[0];
        const landDetails = property.land_details?.[0];

        if (features && property.price) {
          let areaInAcres = features.area;
          if (features.area_unit === 'sqft') areaInAcres = features.area / 43560;
          else if (features.area_unit === 'sqm') areaInAcres = features.area / 4047;
          else if (features.area_unit === 'hectares') areaInAcres = features.area * 2.471;

          if (areaInAcres > 0) {
            totalPricePerAcre += property.price / areaInAcres;
            validPriceCount++;
          }
        }

        if (landDetails) {
          // Count zoning types
          if (landDetails.zoning) {
            zoningCounts[landDetails.zoning] = (zoningCounts[landDetails.zoning] || 0) + 1;
          }

          // Count development status
          if (landDetails.development_status) {
            statusCounts[landDetails.development_status] = (statusCounts[landDetails.development_status] || 0) + 1;
          }

          // Count infrastructure availability
          if (landDetails.electricity_available) infrastructure.electricity++;
          if (landDetails.water_connection_available) infrastructure.water++;
          if (landDetails.sewer_connection_available) infrastructure.sewer++;
          if (landDetails.internet_coverage) infrastructure.internet++;
        }
      });

      const averagePricePerAcre = validPriceCount > 0 ? totalPricePerAcre / validPriceCount : 0;

      const popularZoning = Object.entries(zoningCounts)
        .map(([zoning, count]) => ({ zoning, count }))
        .sort((a, b) => b.count - a.count);

      const developmentStatusBreakdown = Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalLandListings,
        averagePricePerAcre,
        popularZoning,
        developmentStatusBreakdown,
        infrastructureAvailability: infrastructure
      };
    } catch (error) {
      console.error('❌ Error getting land analytics:', error);
      return {
        totalLandListings: 0,
        averagePricePerAcre: 0,
        popularZoning: [],
        developmentStatusBreakdown: [],
        infrastructureAvailability: { electricity: 0, water: 0, sewer: 0, internet: 0 }
      };
    }
  },

  // Upload land document
  async uploadLandDocument(propertyId: string, file: File, documentType: string): Promise<{ success: boolean; documentUrl?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      // Upload file to storage
      const fileName = `${propertyId}/${documentType}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('land-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ Error uploading document:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('land-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { error: dbError } = await supabase
        .from('land_documents')
        .insert({
          property_id: propertyId,
          document_type: documentType,
          document_name: file.name,
          document_url: publicUrl,
          document_size: file.size,
          uploaded_by: user.id
        });

      if (dbError) {
        console.error('❌ Error saving document record:', dbError);
        return { success: false, error: dbError.message };
      }

      return { success: true, documentUrl: publicUrl };
    } catch (error) {
      console.error('❌ Exception uploading land document:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Transform database land details to frontend format
  transformLandDetails(data: any): LandDetails {
    return {
      id: data.id,
      propertyId: data.property_id,
      zoning: data.zoning,
      titleDeedAvailable: data.title_deed_available || false,
      surveyDone: data.survey_done || false,
      landUsePermit: data.land_use_permit || false,
      topography: data.topography,
      soilType: data.soil_type,
      elevationMeters: data.elevation_meters,
      waterSource: data.water_source,
      roadAccess: data.road_access,
      distanceToMainRoadKm: data.distance_to_main_road_km,
      electricityAvailable: data.electricity_available || false,
      waterConnectionAvailable: data.water_connection_available || false,
      sewerConnectionAvailable: data.sewer_connection_available || false,
      internetCoverage: data.internet_coverage || false,
      developmentStatus: data.development_status,
      buildingCoverageRatio: data.building_coverage_ratio,
      floorAreaRatio: data.floor_area_ratio,
      maxBuildingHeightMeters: data.max_building_height_meters,
      subdivisionPotential: data.subdivision_potential || false,
      environmentalRestrictions: data.environmental_restrictions,
      agriculturalPotential: data.agricultural_potential || false,
      currentCrops: data.current_crops,
      irrigationAvailable: data.irrigation_available || false,
      appreciationPotential: data.appreciation_potential,
      nearbyDevelopments: data.nearby_developments,
      futureInfrastructurePlans: data.future_infrastructure_plans,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Transform frontend land details to database format
  transformLandDetailsForDB(data: Partial<LandDetails>): any {
    return {
      zoning: data.zoning,
      title_deed_available: data.titleDeedAvailable,
      survey_done: data.surveyDone,
      land_use_permit: data.landUsePermit,
      topography: data.topography,
      soil_type: data.soilType,
      elevation_meters: data.elevationMeters,
      water_source: data.waterSource,
      road_access: data.roadAccess,
      distance_to_main_road_km: data.distanceToMainRoadKm,
      electricity_available: data.electricityAvailable,
      water_connection_available: data.waterConnectionAvailable,
      sewer_connection_available: data.sewerConnectionAvailable,
      internet_coverage: data.internetCoverage,
      development_status: data.developmentStatus,
      building_coverage_ratio: data.buildingCoverageRatio,
      floor_area_ratio: data.floorAreaRatio,
      max_building_height_meters: data.maxBuildingHeightMeters,
      subdivision_potential: data.subdivisionPotential,
      environmental_restrictions: data.environmentalRestrictions,
      agricultural_potential: data.agriculturalPotential,
      current_crops: data.currentCrops,
      irrigation_available: data.irrigationAvailable,
      appreciation_potential: data.appreciationPotential,
      nearby_developments: data.nearbyDevelopments,
      future_infrastructure_plans: data.futureInfrastructurePlans
    };
  },

  // Transform land property data from database
  transformLandPropertyData(data: any): Property {
    // Use the existing property transformation and add land details
    const baseProperty = {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      status: data.status,
      price: data.price,
      currency: data.currency,
      location: {
        address: data.property_locations?.[0]?.address || '',
        city: data.property_locations?.[0]?.city || '',
        state: data.property_locations?.[0]?.state || '',
        country: data.property_locations?.[0]?.country || 'Kenya',
        zipCode: data.property_locations?.[0]?.zip_code,
        coordinates: data.property_locations?.[0]?.latitude && data.property_locations?.[0]?.longitude ? {
          lat: parseFloat(data.property_locations[0].latitude),
          lng: parseFloat(data.property_locations[0].longitude)
        } : undefined
      },
      features: {
        area: data.property_features?.[0]?.area || 0,
        areaUnit: data.property_features?.[0]?.area_unit || 'acres',
        amenities: data.property_amenities?.map((a: any) => a.amenity) || [],
        utilities: data.property_utilities?.map((u: any) => u.utility) || []
      },
      images: data.property_images?.map((img: any) => ({
        id: img.id,
        url: img.image_url,
        alt: img.alt_text || '',
        isPrimary: img.is_primary || false,
        order: img.display_order || 0
      })) || [],
      providerId: data.provider_id,
      provider: data.providers ? {
        id: data.providers.id,
        name: data.providers.contact_person || '',
        email: data.providers.email || '',
        phone: data.providers.phone || '',
        role: 'provider' as const,
        status: data.providers.status || 'approved',
        businessName: data.providers.business_name || '',
        businessEmail: data.providers.business_email || data.providers.email || '',
        businessPhone: data.providers.business_phone || data.providers.phone || '',
        city: data.providers.city || '',
        subscriptionStatus: data.providers.subscription_status || 'active',
        subscriptionPlan: data.providers.subscription_plan,
        totalListings: data.providers.total_listings || 0,
        totalViews: data.providers.total_views || 0,
        totalInquiries: data.providers.total_inquiries || 0,
        approvedAt: data.providers.approved_at ? new Date(data.providers.approved_at) : undefined,
        approvedBy: data.providers.approved_by,
        createdAt: new Date(data.providers.created_at || Date.now()),
        updatedAt: new Date(data.providers.updated_at || Date.now())
      } : undefined,
      views: data.views || 0,
      inquiries: data.inquiries || 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      publishedAt: data.published_at ? new Date(data.published_at) : undefined,
      isFeatured: data.is_featured || false,
      rejectionReason: data.rejection_reason,
      rejectedAt: data.rejected_at,
      rejectedBy: data.rejected_by,
      // Add land details if available
      landDetails: data.land_details?.[0] ? this.transformLandDetails(data.land_details[0]) : undefined
    };

    return baseProperty as Property;
  }
};
