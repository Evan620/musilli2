-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'provider', 'user');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'expired', 'cancelled');
CREATE TYPE subscription_plan AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'land', 'commercial', 'airbnb');
CREATE TYPE property_category AS ENUM ('sale', 'rent', 'short-term-rental');
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published', 'sold', 'rented');
CREATE TYPE area_unit AS ENUM ('sqft', 'sqm', 'acres', 'hectares');
CREATE TYPE inquiry_status AS ENUM ('new', 'responded', 'closed');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'pending',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT UNIQUE NOT NULL,
  business_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  subscription_status subscription_status DEFAULT 'inactive',
  subscription_plan subscription_plan,
  total_listings INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type property_type NOT NULL,
  category property_category NOT NULL,
  status property_status NOT NULL DEFAULT 'draft',
  price DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KSH',
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Property locations table
CREATE TABLE property_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Kenya',
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property features table
CREATE TABLE property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(10,2) NOT NULL,
  area_unit area_unit NOT NULL,
  parking INTEGER,
  furnished BOOLEAN DEFAULT FALSE,
  pet_friendly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property amenities table
CREATE TABLE property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property utilities table
CREATE TABLE property_utilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  utility TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property images table
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  inquirer_name TEXT NOT NULL,
  inquirer_email TEXT NOT NULL,
  inquirer_phone TEXT,
  message TEXT NOT NULL,
  status inquiry_status DEFAULT 'new',
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property views table for analytics
CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_id UUID REFERENCES profiles(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_properties_provider_id ON properties(provider_id);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_category ON properties(category);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);
CREATE INDEX idx_property_locations_city ON property_locations(city);
CREATE INDEX idx_property_locations_coordinates ON property_locations(latitude, longitude);
CREATE INDEX idx_properties_title_search ON properties USING gin(to_tsvector('english', title));
CREATE INDEX idx_properties_description_search ON properties USING gin(to_tsvector('english', description));
CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON property_views(viewed_at);
CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_utilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is provider
CREATE OR REPLACE FUNCTION is_provider(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id) = 'provider';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin(auth.uid()));

-- Providers policies
CREATE POLICY "Providers can view their own data" ON providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Providers can update their own data" ON providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all providers" ON providers
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all providers" ON providers
  FOR UPDATE USING (is_admin(auth.uid()));

-- Properties policies
CREATE POLICY "Anyone can view published properties" ON properties
  FOR SELECT USING (status = 'published');

CREATE POLICY "Providers can view their own properties" ON properties
  FOR SELECT USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Providers can insert their own properties" ON properties
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Providers can update their own properties" ON properties
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all properties" ON properties
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all properties" ON properties
  FOR UPDATE USING (is_admin(auth.uid()));

-- Property locations policies (inherit from properties)
CREATE POLICY "Property locations follow property access" ON property_locations
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property features policies (inherit from properties)
CREATE POLICY "Property features follow property access" ON property_features
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property amenities policies (inherit from properties)
CREATE POLICY "Property amenities follow property access" ON property_amenities
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property utilities policies (inherit from properties)
CREATE POLICY "Property utilities follow property access" ON property_utilities
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Property images policies (inherit from properties)
CREATE POLICY "Property images follow property access" ON property_images
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE
        status = 'published' OR
        provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()) OR
        is_admin(auth.uid())
    )
  );

-- Inquiries policies
CREATE POLICY "Anyone can insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Property owners can view inquiries for their properties" ON inquiries
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all inquiries" ON inquiries
  FOR SELECT USING (is_admin(auth.uid()));

-- Property views policies
CREATE POLICY "Anyone can insert property views" ON property_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Property owners can view their property analytics" ON property_views
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all property views" ON property_views
  FOR SELECT USING (is_admin(auth.uid()));

-- Activity log policies
CREATE POLICY "Users can view their own activity" ON activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON activity_log
  FOR SELECT USING (is_admin(auth.uid()));
