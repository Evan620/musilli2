-- Fix RLS policies for Musilli Homes
-- Run this in your Supabase SQL Editor

-- 1. First, let's fix the profiles table to properly link with auth.users
-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with correct structure
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'provider', 'admin')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('email_unconfirmed', 'pending', 'approved', 'rejected', 'suspended')),
  avatar_url TEXT,
  suspension_reason TEXT,
  suspended_at TIMESTAMP,
  deleted_at TIMESTAMP,
  deletion_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Disable RLS temporarily to test (ONLY FOR DEVELOPMENT)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Or if you want to keep RLS enabled, create permissive policies
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read profiles
-- CREATE POLICY "Allow authenticated users to read profiles" ON profiles
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to read and update their own profile
-- CREATE POLICY "Users can manage their own profile" ON profiles
--   FOR ALL USING (auth.uid() = id);

-- Allow admins to do everything
-- CREATE POLICY "Admins can do everything" ON profiles
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM profiles 
--       WHERE profiles.id = auth.uid() 
--       AND profiles.role = 'admin'
--     )
--   );

-- 4. Create a function to automatically create profiles for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    CASE
      WHEN NEW.email_confirmed_at IS NULL THEN 'email_unconfirmed'
      WHEN NEW.raw_user_meta_data->>'role' = 'provider' THEN 'pending'
      ELSE 'approved'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create a test admin user (replace with your actual email)
-- First, you need to manually create this user in Supabase Auth, then run:
-- UPDATE profiles SET role = 'admin', status = 'approved' WHERE email = 'musilli.luxury@gmail.com';

-- 6. Fix providers table to match the schema
DROP TABLE IF EXISTS providers CASCADE;
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT UNIQUE NOT NULL,
  business_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'expired', 'cancelled')),
  subscription_plan TEXT CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  total_listings INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create other essential tables if they don't exist
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected')),
  property_type VARCHAR(50),
  provider_id UUID REFERENCES providers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS on all tables for now (DEVELOPMENT ONLY)
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON properties TO authenticated;
GRANT ALL ON providers TO authenticated;

-- 7. Create a simple function to test database connectivity
CREATE OR REPLACE FUNCTION test_connection()
RETURNS TEXT AS $$
BEGIN
  RETURN 'Database connection successful!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION test_connection TO authenticated;
GRANT EXECUTE ON FUNCTION test_connection TO anon;

-- 9. Debug queries to check current state
-- Run these to see what's in your database:

-- Check all auth users
-- SELECT id, email, email_confirmed_at, raw_user_meta_data FROM auth.users;

-- Check all profiles
-- SELECT * FROM profiles;

-- Check providers
-- SELECT * FROM providers;

-- If you have existing data that needs to be migrated, you might need to:
-- 1. Export your current profiles data
-- 2. Drop and recreate the tables with this script
-- 3. Re-import the data with correct auth user IDs

-- Quick fix for existing users (run this if you have users that can't access):
-- UPDATE profiles SET status = 'approved' WHERE role = 'provider' AND status = 'pending';
