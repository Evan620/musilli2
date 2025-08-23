-- Fix missing INSERT policies for property-related tables
-- This allows providers and admins to create complete property records

-- Property locations INSERT policy
CREATE POLICY "Property owners can insert locations" ON property_locations
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property features INSERT policy  
CREATE POLICY "Property owners can insert features" ON property_features
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property amenities INSERT policy
CREATE POLICY "Property owners can insert amenities" ON property_amenities
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property utilities INSERT policy
CREATE POLICY "Property owners can insert utilities" ON property_utilities
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property images INSERT policy
CREATE POLICY "Property owners can insert images" ON property_images
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Also add UPDATE policies for completeness
CREATE POLICY "Property owners can update locations" ON property_locations
  FOR UPDATE USING (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

CREATE POLICY "Property owners can update features" ON property_features
  FOR UPDATE USING (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

CREATE POLICY "Property owners can update amenities" ON property_amenities
  FOR UPDATE USING (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

CREATE POLICY "Property owners can update utilities" ON property_utilities
  FOR UPDATE USING (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

CREATE POLICY "Property owners can update images" ON property_images
  FOR UPDATE USING (
    property_id IN (
      SELECT id FROM properties WHERE
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );
