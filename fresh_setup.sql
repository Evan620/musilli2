-- Fresh Supabase Setup for Musilli Homes
-- Run this AFTER resetting your database

-- 1. Create profiles table (clean version)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'provider', 'admin')),
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'suspended')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create properties table (simplified)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected')),
  property_type VARCHAR(50),
  provider_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create providers table (simplified)
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  license_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. DISABLE RLS for development (we'll enable it later)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;

-- 5. Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON properties TO authenticated;
GRANT ALL ON providers TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT ALL ON properties TO anon;
GRANT ALL ON providers TO anon;

-- 8. Create your admin user manually
-- First, you need to sign up through the app, then run this:
-- UPDATE profiles SET role = 'admin', status = 'approved' WHERE email = 'musilli.luxury@gmail.com';

-- 9. Test function
CREATE OR REPLACE FUNCTION test_db()
RETURNS TEXT AS $$
BEGIN
  RETURN 'Database is working!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION test_db TO authenticated;
GRANT EXECUTE ON FUNCTION test_db TO anon;
