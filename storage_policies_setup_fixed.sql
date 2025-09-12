-- Storage Policies Setup for Musilli Homes (Fixed Version)
-- Run this in your Supabase SQL Editor

-- Note: RLS is automatically enabled on storage.objects in Supabase
-- We don't need to manually enable it

-- Remove existing broad or conflicting policies for property-images (if present)
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Property owners can delete their images" ON storage.objects;
DROP POLICY IF EXISTS "Property owners can update their images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for property images" ON storage.objects;
DROP POLICY IF EXISTS "Public read for property images" ON storage.objects;

-- Property Images: Public read
CREATE POLICY "Public read for property images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'property-images'
);

-- Property Images: Providers can INSERT into their own property folder or admins
CREATE POLICY "Providers can upload to own property folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    -- Admins can upload anywhere
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    -- Providers can upload only under their own property_id prefix
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
);

-- Property Images: Providers can UPDATE their images or admins
CREATE POLICY "Providers can update their images (scoped)"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
);

-- Property Images: Providers can DELETE their images or admins
CREATE POLICY "Providers can delete their images (scoped)"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND (
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
);

-- Land Documents: remove any prior conflicting policies
DROP POLICY IF EXISTS "Read land documents (admins and owners)" ON storage.objects;
DROP POLICY IF EXISTS "Insert land documents (admins and owners)" ON storage.objects;
DROP POLICY IF EXISTS "Update land documents (admins and owners)" ON storage.objects;
DROP POLICY IF EXISTS "Delete land documents (admins and owners)" ON storage.objects;

-- Land Documents: Authenticated admins and owners can SELECT (private bucket, no public read)
CREATE POLICY "Read land documents (admins and owners)"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'land-documents'
  AND (
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
);

-- Land Documents: INSERT
CREATE POLICY "Insert land documents (admins and owners)"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'land-documents'
  AND (
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
);

-- Land Documents: UPDATE
CREATE POLICY "Update land documents (admins and owners)"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'land-documents'
  AND (
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'land-documents'
  AND (
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
);

-- Land Documents: DELETE
CREATE POLICY "Delete land documents (admins and owners)"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'land-documents'
  AND (
    EXISTS (
      SELECT 1
      FROM profiles pr
      WHERE pr.id = auth.uid()
        AND pr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM properties p
      JOIN providers pv ON pv.id = p.provider_id
      WHERE p.id::text = split_part(name, '/', 1)
        AND pv.user_id = auth.uid()
    )
  )
);