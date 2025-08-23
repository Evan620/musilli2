-- Fix RLS policies to allow public access to admin-created properties
-- Admin-created properties have provider_id = NULL and should be publicly accessible

-- Drop existing policies that are blocking admin properties
DROP POLICY IF EXISTS "Property locations follow property access" ON property_locations;
DROP POLICY IF EXISTS "Property features follow property access" ON property_features;
DROP POLICY IF EXISTS "Property amenities follow property access" ON property_amenities;
DROP POLICY IF EXISTS "Property utilities follow property access" ON property_utilities;
DROP POLICY IF EXISTS "Property images follow property access" ON property_images;

-- Recreate policies with proper handling for admin properties (provider_id = NULL)

-- Property locations policies
CREATE POLICY "Property locations follow property access" ON property_locations
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR  -- Anyone can see published properties
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR  -- Providers can see their own
        is_admin(auth.uid())  -- Admins can see all
    )
  );

-- Property features policies  
CREATE POLICY "Property features follow property access" ON property_features
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property amenities policies
CREATE POLICY "Property amenities follow property access" ON property_amenities
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property utilities policies
CREATE POLICY "Property utilities follow property access" ON property_utilities
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property images policies
CREATE POLICY "Property images follow property access" ON property_images
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Add missing INSERT policy for admin properties
CREATE POLICY "Admins can insert properties" ON properties
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Ensure providers table can be accessed for joins (even if NULL)
CREATE POLICY "Anyone can view providers for property joins" ON providers
  FOR SELECT USING (true);

-- Test the fix with a simple query
SELECT 'RLS policies updated for admin properties' as message;
