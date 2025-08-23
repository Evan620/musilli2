# Supabase Storage Setup for Property Images

## Required Storage Bucket

You need to create a storage bucket in your Supabase dashboard for property images.

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **Create Bucket**
4. Set the following:
   - **Name**: `property-images`
   - **Public**: ✅ **Yes** (so images can be accessed publicly)
   - **File size limit**: 10MB (optional)
   - **Allowed MIME types**: `image/*` (optional)

### 2. Storage Policies

The bucket needs proper RLS (Row Level Security) policies. Run these SQL commands in your Supabase SQL Editor:

```sql
-- Allow public read access to property images
CREATE POLICY "Public read access for property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

-- Allow authenticated users to upload property images
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Allow property owners and admins to update their images
CREATE POLICY "Property owners can update their images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Allow property owners and admins to delete their images
CREATE POLICY "Property owners can delete their images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);
```

### 3. Folder Structure

Images will be organized as:
```
property-images/
├── {property-id-1}/
│   ├── timestamp-0.jpg (primary image)
│   ├── timestamp-1.jpg
│   └── timestamp-2.jpg
├── {property-id-2}/
│   ├── timestamp-0.png
│   └── timestamp-1.png
```

### 4. Image Processing

The system will:
- Upload original images to Supabase Storage
- Generate public URLs for each image
- Save image metadata to `property_images` table
- Set the first image as primary (`is_primary = true`)
- Assign display order for image galleries

### 5. Supported Formats

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **GIF** (.gif)

### 6. File Size Limits

- **Maximum file size**: 10MB per image
- **Maximum images per property**: 10 images

### 7. Error Handling

The system includes:
- Upload failure recovery (continues with other images)
- File type validation
- Size limit validation
- Automatic retry for failed uploads
- Graceful degradation if storage is unavailable

## Testing

After setup, test by:
1. Adding a new property with images
2. Checking the storage bucket for uploaded files
3. Verifying image URLs work in the property details
4. Testing image display in property listings

## Troubleshooting

**Images not uploading?**
- Check bucket exists and is named `property-images`
- Verify bucket is set to public
- Check storage policies are applied
- Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set

**Images not displaying?**
- Check if URLs are generated correctly
- Verify bucket public access
- Check browser network tab for 403/404 errors
- Ensure image records are saved to `property_images` table
