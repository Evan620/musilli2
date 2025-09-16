-- RLS write policies fix for properties, land details, and plans admin policies
-- This migration enables INSERT/UPDATE for required tables and aligns admin checks
-- with is_admin(auth.uid()) used across the project.

-- ============================================================================
-- Property child tables: allow providers (owners) and admins to INSERT/UPDATE
-- ============================================================================

-- property_locations
DROP POLICY IF EXISTS "Write property_locations (providers and admins)" ON property_locations;
CREATE POLICY "Write property_locations (providers and admins)" ON property_locations
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Update property_locations (providers and admins)" ON property_locations;
CREATE POLICY "Update property_locations (providers and admins)" ON property_locations
  FOR UPDATE
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  )
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- property_features
DROP POLICY IF EXISTS "Write property_features (providers and admins)" ON property_features;
CREATE POLICY "Write property_features (providers and admins)" ON property_features
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Update property_features (providers and admins)" ON property_features;
CREATE POLICY "Update property_features (providers and admins)" ON property_features
  FOR UPDATE
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  )
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- property_amenities
DROP POLICY IF EXISTS "Write property_amenities (providers and admins)" ON property_amenities;
CREATE POLICY "Write property_amenities (providers and admins)" ON property_amenities
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Update property_amenities (providers and admins)" ON property_amenities;
CREATE POLICY "Update property_amenities (providers and admins)" ON property_amenities
  FOR UPDATE
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  )
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- property_utilities
DROP POLICY IF EXISTS "Write property_utilities (providers and admins)" ON property_utilities;
CREATE POLICY "Write property_utilities (providers and admins)" ON property_utilities
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Update property_utilities (providers and admins)" ON property_utilities;
CREATE POLICY "Update property_utilities (providers and admins)" ON property_utilities
  FOR UPDATE
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  )
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- property_images
DROP POLICY IF EXISTS "Write property_images (providers and admins)" ON property_images;
CREATE POLICY "Write property_images (providers and admins)" ON property_images
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Update property_images (providers and admins)" ON property_images;
CREATE POLICY "Update property_images (providers and admins)" ON property_images
  FOR UPDATE
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  )
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- ==============================================
-- Land tables: allow providers/admins to write
-- ==============================================

-- land_details
DROP POLICY IF EXISTS "Write land_details (providers and admins)" ON land_details;
CREATE POLICY "Write land_details (providers and admins)" ON land_details
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Update land_details (providers and admins)" ON land_details;
CREATE POLICY "Update land_details (providers and admins)" ON land_details
  FOR UPDATE
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  )
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );

-- ==========================================================
-- Plans admin policies: use is_admin(auth.uid()) consistently
-- ==========================================================

-- Replace admin policies on architectural_plans and plan_files
DROP POLICY IF EXISTS "Admins can manage all plans" ON architectural_plans;
DROP POLICY IF EXISTS "Admins can manage all plan files" ON plan_files;

CREATE POLICY "Admins can manage all plans (uid)" ON architectural_plans
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all plan files (uid)" ON plan_files
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Done
