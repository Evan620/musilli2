import { supabase } from './supabase';
import { 
  CommercialPropertyDetails, 
  CommercialAmenity, 
  CommercialLeaseHistory, 
  CommercialPropertyAnalytics,
  CommercialSearchFilters,
  CommercialPropertyType,
  BuildingClass,
  CommercialZoning,
  LeaseType
} from '@/types';

export const commercialService = {
  // Create commercial property details
  async createCommercialProperty(propertyId: string, commercialData: Partial<CommercialPropertyDetails>) {
    try {
      console.log('🏢 Creating commercial property details:', { propertyId, commercialData });
      
      const { data, error } = await supabase
        .from('commercial_property_details')
        .insert({
          property_id: propertyId,
          commercial_type: commercialData.commercialType,
          building_class: commercialData.buildingClass,
          zoning_type: commercialData.zoningType,
          year_built: commercialData.yearBuilt,
          total_building_size: commercialData.totalBuildingSize,
          available_space: commercialData.availableSpace,
          ceiling_height: commercialData.ceilingHeight,
          loading_docks: commercialData.loadingDocks || 0,
          parking_spaces: commercialData.parkingSpaces || 0,
          parking_ratio: commercialData.parkingRatio,
          lease_type: commercialData.leaseType,
          lease_term_min: commercialData.leaseTermMin,
          lease_term_max: commercialData.leaseTermMax,
          rent_per_sqft: commercialData.rentPerSqft,
          cam_charges: commercialData.camCharges,
          security_deposit_months: commercialData.securityDepositMonths || 1,
          annual_escalation: commercialData.annualEscalation,
          current_occupancy_rate: commercialData.currentOccupancyRate,
          anchor_tenants: commercialData.anchorTenants,
          tenant_mix: commercialData.tenantMix,
          occupancy_certificate_valid: commercialData.occupancyCertificateValid || false,
          fire_safety_compliant: commercialData.fireSafetyCompliant || false,
          ada_compliant: commercialData.adaCompliant || false,
          permitted_uses: commercialData.permittedUses,
          signage_rights: commercialData.signageRights || false,
          drive_through_available: commercialData.driveThroughAvailable || false,
          restaurant_approved: commercialData.restaurantApproved || false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating commercial property:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Commercial property created successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception creating commercial property:', error);
      return { success: false, error: 'Failed to create commercial property' };
    }
  },

  // Update or insert (upsert-like) commercial property details by property_id
  async updateCommercialProperty(propertyId: string, commercialData: Partial<CommercialPropertyDetails>) {
    try {
      // Check if details exist
      const { data: existing, error: fetchError } = await supabase
        .from('commercial_property_details')
        .select('id')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error checking commercial details:', fetchError);
        return { success: false, error: fetchError.message };
      }

      const payload: any = {
        commercial_type: commercialData.commercialType,
        building_class: commercialData.buildingClass,
        zoning_type: commercialData.zoningType,
        year_built: commercialData.yearBuilt,
        total_building_size: commercialData.totalBuildingSize,
        available_space: commercialData.availableSpace,
        ceiling_height: commercialData.ceilingHeight,
        loading_docks: commercialData.loadingDocks,
        parking_spaces: commercialData.parkingSpaces,
        parking_ratio: commercialData.parkingRatio,
        lease_type: commercialData.leaseType,
        lease_term_min: commercialData.leaseTermMin,
        lease_term_max: commercialData.leaseTermMax,
        rent_per_sqft: commercialData.rentPerSqft,
        cam_charges: commercialData.camCharges,
        security_deposit_months: commercialData.securityDepositMonths,
        annual_escalation: commercialData.annualEscalation,
        current_occupancy_rate: commercialData.currentOccupancyRate,
        anchor_tenants: commercialData.anchorTenants,
        tenant_mix: commercialData.tenantMix,
        occupancy_certificate_valid: commercialData.occupancyCertificateValid,
        fire_safety_compliant: commercialData.fireSafetyCompliant,
        ada_compliant: commercialData.adaCompliant,
        permitted_uses: commercialData.permittedUses,
        signage_rights: commercialData.signageRights,
        drive_through_available: commercialData.driveThroughAvailable,
        restaurant_approved: commercialData.restaurantApproved,
      };

      if (!existing) {
        // Insert new
        const { data, error } = await supabase
          .from('commercial_property_details')
          .insert({ property_id: propertyId, ...payload })
          .select()
          .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
      } else {
        // Update existing
        const { data, error } = await supabase
          .from('commercial_property_details')
          .update(payload)
          .eq('property_id', propertyId)
          .select()
          .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
      }
    } catch (error) {
      console.error('❌ Exception updating commercial property:', error);
      return { success: false, error: 'Failed to update commercial property' };
    }
  },

  // Search commercial properties
  async searchCommercialProperties(filters: CommercialSearchFilters = {}) {
    try {
      console.log('🔍 Searching commercial properties:', filters);
      
      const { data, error } = await supabase.rpc('search_commercial_properties', {
        search_query: filters.query || null,
        commercial_type_filter: filters.commercialType || null,
        building_class_filter: filters.buildingClass || null,
        zoning_filter: filters.zoning || null,
        min_size: filters.minSize || null,
        max_size: filters.maxSize || null,
        min_rent: filters.minRent || null,
        max_rent: filters.maxRent || null,
        lease_type_filter: filters.leaseType || null,
        min_parking: filters.minParking || null,
        required_amenities: filters.requiredAmenities || null,
        limit_count: 50,
        offset_count: 0
      });

      if (error) {
        console.error('❌ Error searching commercial properties:', error);
        return { success: false, error: error.message, data: [] };
      }

      console.log('✅ Commercial properties search completed:', data?.length || 0, 'results');
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Exception searching commercial properties:', error);
      return { success: false, error: 'Failed to search commercial properties', data: [] };
    }
  },

  // Get commercial property details
  async getCommercialPropertyDetails(propertyId: string) {
    try {
      console.log('📋 Getting commercial property details:', propertyId);
      
      const { data, error } = await supabase
        .from('commercial_property_details')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (error) {
        console.error('❌ Error getting commercial property details:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Commercial property details retrieved:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception getting commercial property details:', error);
      return { success: false, error: 'Failed to get commercial property details' };
    }
  },

  // Add commercial amenity
  async addCommercialAmenity(propertyId: string, amenity: Partial<CommercialAmenity>) {
    try {
      console.log('🏢 Adding commercial amenity:', { propertyId, amenity });
      
      const { data, error } = await supabase
        .from('commercial_amenities')
        .insert({
          property_id: propertyId,
          amenity_type: amenity.amenityType,
          amenity_name: amenity.amenityName,
          description: amenity.description,
          is_included: amenity.isIncluded || true,
          additional_cost: amenity.additionalCost
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding commercial amenity:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Commercial amenity added successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception adding commercial amenity:', error);
      return { success: false, error: 'Failed to add commercial amenity' };
    }
  },

  // Get commercial amenities
  async getCommercialAmenities(propertyId: string) {
    try {
      console.log('🏢 Getting commercial amenities:', propertyId);
      
      const { data, error } = await supabase
        .from('commercial_amenities')
        .select('*')
        .eq('property_id', propertyId)
        .order('amenity_type', { ascending: true });

      if (error) {
        console.error('❌ Error getting commercial amenities:', error);
        return { success: false, error: error.message, data: [] };
      }

      console.log('✅ Commercial amenities retrieved:', data?.length || 0, 'amenities');
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Exception getting commercial amenities:', error);
      return { success: false, error: 'Failed to get commercial amenities', data: [] };
    }
  },

  // Add lease record
  async addLeaseRecord(propertyId: string, lease: Partial<CommercialLeaseHistory>) {
    try {
      console.log('📝 Adding lease record:', { propertyId, lease });
      
      const { data, error } = await supabase.rpc('add_commercial_lease', {
        property_id_param: propertyId,
        tenant_name_param: lease.tenantName,
        lease_start_param: lease.leaseStartDate,
        lease_end_param: lease.leaseEndDate,
        monthly_rent_param: lease.monthlyRent,
        security_deposit_param: lease.securityDeposit,
        lease_type_param: lease.leaseType,
        space_size_param: lease.spaceSize
      });

      if (error) {
        console.error('❌ Error adding lease record:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Lease record added successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception adding lease record:', error);
      return { success: false, error: 'Failed to add lease record' };
    }
  },

  // Update occupancy rate
  async updateOccupancyRate(propertyId: string, occupancyRate: number) {
    try {
      console.log('📊 Updating occupancy rate:', { propertyId, occupancyRate });
      
      const { data, error } = await supabase.rpc('update_commercial_occupancy', {
        property_id_param: propertyId,
        new_occupancy_rate: occupancyRate
      });

      if (error) {
        console.error('❌ Error updating occupancy rate:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Occupancy rate updated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception updating occupancy rate:', error);
      return { success: false, error: 'Failed to update occupancy rate' };
    }
  },

  // Get commercial analytics
  async getCommercialAnalytics() {
    try {
      console.log('📊 Getting commercial analytics...');
      
      const { data, error } = await supabase.rpc('get_commercial_analytics');

      if (error) {
        console.error('❌ Error getting commercial analytics:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Commercial analytics retrieved:', data);
      return { success: true, data: data?.[0] || null };
    } catch (error) {
      console.error('❌ Exception getting commercial analytics:', error);
      return { success: false, error: 'Failed to get commercial analytics' };
    }
  },

  // Get lease history
  async getLeaseHistory(propertyId: string) {
    try {
      console.log('📝 Getting lease history:', propertyId);
      
      const { data, error } = await supabase
        .from('commercial_lease_history')
        .select('*')
        .eq('property_id', propertyId)
        .order('lease_start_date', { ascending: false });

      if (error) {
        console.error('❌ Error getting lease history:', error);
        return { success: false, error: error.message, data: [] };
      }

      console.log('✅ Lease history retrieved:', data?.length || 0, 'records');
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Exception getting lease history:', error);
      return { success: false, error: 'Failed to get lease history', data: [] };
    }
  }
};
