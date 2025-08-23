-- Fix RLS policies to allow admin access to ALL properties (including pending)
-- This ensures admin dashboard can see pending properties for approval

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view published properties" ON properties;
DROP POLICY IF EXISTS "Providers can view their own properties" ON properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON properties;

-- Create comprehensive policies for properties table
CREATE POLICY "Anyone can view published properties" ON properties
  FOR SELECT USING (status = 'published');

CREATE POLICY "Providers can view their own properties" ON properties
  FOR SELECT USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all properties" ON properties
  FOR SELECT USING (is_admin(auth.uid()));

-- Ensure admin can see all property statuses
CREATE POLICY "Admins can view pending properties" ON properties
  FOR SELECT USING (
    is_admin(auth.uid()) AND status = 'pending'
  );

-- Update related table policies to ensure they work with admin access
DROP POLICY IF EXISTS "Property locations follow property access" ON property_locations;
CREATE POLICY "Property locations follow property access" ON property_locations
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR  -- Anyone can see published properties
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR  -- Providers can see their own
        is_admin(auth.uid())  -- Admins can see all
    )
  );

DROP POLICY IF EXISTS "Property features follow property access" ON property_features;
CREATE POLICY "Property features follow property access" ON property_features
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Property amenities follow property access" ON property_amenities;
CREATE POLICY "Property amenities follow property access" ON property_amenities
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Property utilities follow property access" ON property_utilities;
CREATE POLICY "Property utilities follow property access" ON property_utilities
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Property images follow property access" ON property_images;
CREATE POLICY "Property images follow property access" ON property_images
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Test the fix
SELECT 'Admin property access policies updated' as message;
