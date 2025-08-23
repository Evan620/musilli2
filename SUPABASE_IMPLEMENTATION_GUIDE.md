# Musili Homes - Supabase Implementation Guide

## 🎯 Current Status
**Phase 1.1: Database Schema Design** - IN PROGRESS

## 📋 Detailed Implementation Steps

### Phase 1.1: Database Schema Design

#### 1.1.1 Core Tables Structure

**Users Table (auth.users extended with profiles)**
```sql
-- profiles table (extends Supabase auth.users)
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

-- Custom types
CREATE TYPE user_role AS ENUM ('admin', 'provider', 'user');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
```

**Providers Table**
```sql
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

CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'expired', 'cancelled');
CREATE TYPE subscription_plan AS ENUM ('basic', 'premium', 'enterprise');
```

**Properties Table**
```sql
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

CREATE TYPE property_type AS ENUM ('house', 'apartment', 'land', 'commercial', 'airbnb');
CREATE TYPE property_category AS ENUM ('sale', 'rent', 'short-term-rental');
CREATE TYPE property_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published', 'sold', 'rented');
```

#### 1.1.2 Supporting Tables

**Property Locations**
```sql
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
```

**Property Features**
```sql
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

CREATE TYPE area_unit AS ENUM ('sqft', 'sqm', 'acres', 'hectares');
```

**Property Amenities & Utilities**
```sql
CREATE TABLE property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_utilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  utility TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Property Images**
```sql
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.1.3 Inquiry System

**Inquiries Table**
```sql
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

CREATE TYPE inquiry_status AS ENUM ('new', 'responded', 'closed');
```

#### 1.1.4 Analytics & Tracking

**Property Views**
```sql
CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_id UUID REFERENCES profiles(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Activity Log**
```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.1.5 Indexes for Performance

```sql
-- User and provider indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_city ON providers(city);

-- Property indexes
CREATE INDEX idx_properties_provider_id ON properties(provider_id);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_category ON properties(category);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);

-- Location indexes
CREATE INDEX idx_property_locations_city ON property_locations(city);
CREATE INDEX idx_property_locations_coordinates ON property_locations(latitude, longitude);

-- Search indexes
CREATE INDEX idx_properties_title_search ON properties USING gin(to_tsvector('english', title));
CREATE INDEX idx_properties_description_search ON properties USING gin(to_tsvector('english', description));

-- Activity indexes
CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON property_views(viewed_at);
CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
```

## 🔄 Next Steps

### Immediate Actions:
1. **Review Schema**: Verify all TypeScript interfaces are covered
2. **Create Migration Scripts**: Prepare SQL files for Supabase
3. **Set up Supabase Project**: Initialize the actual database
4. **Test Schema**: Validate relationships and constraints

### Files to Create:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_functions_triggers.sql`
- `src/lib/supabase.ts` - Supabase client configuration

### Environment Variables Needed:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---
**Status**: Ready to proceed with Supabase project setup once schema is approved.
