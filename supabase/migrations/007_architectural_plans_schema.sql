-- Architectural Plans Management Schema
-- This migration creates a comprehensive system for managing house architectural plans

-- Plan categories enum
CREATE TYPE plan_category AS ENUM (
  'villa', 'bungalow', 'maisonette', 'apartment', 'cottage', 
  'mansion', 'townhouse', 'duplex', 'studio', 'commercial'
);

-- Plan status enum
CREATE TYPE plan_status AS ENUM (
  'draft', 'pending', 'approved', 'rejected', 'published', 'archived'
);

-- Plan file types enum
CREATE TYPE plan_file_type AS ENUM (
  'floor_plan', '3d_render', 'elevation', 'section', 'site_plan', 
  'structural', 'electrical', 'plumbing', 'landscape'
);

-- Main architectural plans table
CREATE TABLE architectural_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category plan_category NOT NULL,
  status plan_status DEFAULT 'draft',
  
  -- Basic specifications
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  area_unit area_unit NOT NULL DEFAULT 'sqft',
  floors INTEGER DEFAULT 1,
  
  -- Pricing
  price DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'KSH',
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Features and amenities
  features TEXT[], -- Array of features like "Open Plan Living", "Modern Kitchen"
  style TEXT, -- "Modern", "Traditional", "Contemporary", etc.
  
  -- SEO and marketing
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[], -- For search and categorization
  
  -- Analytics
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  
  -- Management
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Plan files table (for storing multiple file types per plan)
CREATE TABLE plan_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES architectural_plans(id) ON DELETE CASCADE,
  file_type plan_file_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  is_primary BOOLEAN DEFAULT FALSE, -- Primary image for display
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan purchases table
CREATE TABLE plan_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES architectural_plans(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Purchase details
  purchase_price DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL,
  payment_method TEXT, -- 'mpesa', 'card', 'bank_transfer'
  payment_reference TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Download tracking
  download_count INTEGER DEFAULT 0,
  first_downloaded_at TIMESTAMPTZ,
  last_downloaded_at TIMESTAMPTZ,
  download_expires_at TIMESTAMPTZ, -- Optional expiry for downloads
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan reviews/ratings table
CREATE TABLE plan_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES architectural_plans(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan analytics table for detailed tracking
CREATE TABLE plan_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES architectural_plans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'download', 'purchase', 'share'
  user_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_architectural_plans_category ON architectural_plans(category);
CREATE INDEX idx_architectural_plans_status ON architectural_plans(status);
CREATE INDEX idx_architectural_plans_featured ON architectural_plans(is_featured);
CREATE INDEX idx_architectural_plans_published ON architectural_plans(published_at);
CREATE INDEX idx_plan_files_plan_id ON plan_files(plan_id);
CREATE INDEX idx_plan_files_type ON plan_files(file_type);
CREATE INDEX idx_plan_purchases_plan_id ON plan_purchases(plan_id);
CREATE INDEX idx_plan_purchases_email ON plan_purchases(customer_email);
CREATE INDEX idx_plan_reviews_plan_id ON plan_reviews(plan_id);
CREATE INDEX idx_plan_analytics_plan_id ON plan_analytics(plan_id);
CREATE INDEX idx_plan_analytics_event ON plan_analytics(event_type);

-- RLS Policies
ALTER TABLE architectural_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_analytics ENABLE ROW LEVEL SECURITY;

-- Public can view published plans
CREATE POLICY "Anyone can view published plans" ON architectural_plans
  FOR SELECT USING (status = 'published');

-- Public can view files for published plans
CREATE POLICY "Anyone can view published plan files" ON plan_files
  FOR SELECT USING (
    plan_id IN (SELECT id FROM architectural_plans WHERE status = 'published')
  );

-- Admins can manage all plans
CREATE POLICY "Admins can manage all plans" ON architectural_plans
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all plan files" ON plan_files
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Purchase policies
CREATE POLICY "Anyone can create purchases" ON plan_purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can view own purchases" ON plan_purchases
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all purchases" ON plan_purchases
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Review policies
CREATE POLICY "Anyone can view approved reviews" ON plan_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can create reviews" ON plan_reviews
  FOR INSERT WITH CHECK (true);

-- Analytics policies (admin only)
CREATE POLICY "Admins can view analytics" ON plan_analytics
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Anyone can create analytics" ON plan_analytics
  FOR INSERT WITH CHECK (true);

-- Functions for plan management
CREATE OR REPLACE FUNCTION approve_architectural_plan(
  p_plan_id UUID,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE architectural_plans 
  SET 
    status = 'approved',
    approved_by = p_admin_id,
    approved_at = NOW(),
    published_at = NOW(),
    updated_at = NOW()
  WHERE id = p_plan_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_architectural_plan(
  p_plan_id UUID,
  p_admin_id UUID,
  p_rejection_reason TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE architectural_plans 
  SET 
    status = 'rejected',
    rejected_by = p_admin_id,
    rejected_at = NOW(),
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_plan_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track plan views
CREATE OR REPLACE FUNCTION track_plan_view(
  p_plan_id UUID,
  p_user_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Update view count
  UPDATE architectural_plans 
  SET views = views + 1, updated_at = NOW()
  WHERE id = p_plan_id;
  
  -- Insert analytics record
  INSERT INTO plan_analytics (plan_id, event_type, user_ip, user_agent)
  VALUES (p_plan_id, 'view', p_user_ip, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process plan purchase
CREATE OR REPLACE FUNCTION process_plan_purchase(
  p_plan_id UUID,
  p_customer_email TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_payment_method TEXT,
  p_payment_reference TEXT
) RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
  v_plan_price DECIMAL(15,2);
  v_currency TEXT;
BEGIN
  -- Get plan price
  SELECT price, currency INTO v_plan_price, v_currency
  FROM architectural_plans 
  WHERE id = p_plan_id AND status = 'published';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found or not available for purchase';
  END IF;
  
  -- Create purchase record
  INSERT INTO plan_purchases (
    plan_id, customer_email, customer_name, customer_phone,
    purchase_price, currency, payment_method, payment_reference,
    status, download_expires_at
  ) VALUES (
    p_plan_id, p_customer_email, p_customer_name, p_customer_phone,
    v_plan_price, v_currency, p_payment_method, p_payment_reference,
    'completed', NOW() + INTERVAL '30 days' -- 30 day download window
  ) RETURNING id INTO v_purchase_id;
  
  -- Update plan purchase count
  UPDATE architectural_plans 
  SET purchases = purchases + 1, updated_at = NOW()
  WHERE id = p_plan_id;
  
  -- Track analytics
  INSERT INTO plan_analytics (plan_id, event_type)
  VALUES (p_plan_id, 'purchase');
  
  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
