-- Commercial Properties Enhancement Schema
-- This migration adds specialized tables and fields for commercial properties

-- Commercial property types
CREATE TYPE commercial_property_type AS ENUM (
  'office_class_a', 'office_class_b', 'office_class_c', 
  'coworking_space', 'executive_suite',
  'shopping_center', 'strip_mall', 'standalone_retail', 
  'restaurant', 'popup_space',
  'warehouse', 'manufacturing', 'flex_space', 
  'cold_storage', 'logistics_center',
  'retail_office_mixed', 'residential_commercial_mixed', 
  'hotel_retail_mixed'
);

-- Lease types
CREATE TYPE lease_type AS ENUM (
  'triple_net', 'gross', 'modified_gross', 'percentage', 'ground_lease'
);

-- Building class
CREATE TYPE building_class AS ENUM ('class_a', 'class_b', 'class_c');

-- Zoning types
CREATE TYPE commercial_zoning AS ENUM (
  'commercial', 'industrial', 'mixed_use', 'retail', 
  'office', 'warehouse', 'manufacturing'
);

-- Commercial property details table
CREATE TABLE commercial_property_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Property Classification
  commercial_type commercial_property_type NOT NULL,
  building_class building_class,
  zoning_type commercial_zoning NOT NULL,
  
  -- Building Information
  year_built INTEGER,
  total_building_size DECIMAL(12,2), -- Total building square footage
  available_space DECIMAL(12,2), -- Available leasable space
  ceiling_height DECIMAL(5,2), -- In feet
  loading_docks INTEGER DEFAULT 0,
  parking_spaces INTEGER DEFAULT 0,
  parking_ratio DECIMAL(5,2), -- Spaces per 1000 sqft
  
  -- Lease Information
  lease_type lease_type,
  lease_term_min INTEGER, -- Minimum lease term in months
  lease_term_max INTEGER, -- Maximum lease term in months
  rent_per_sqft DECIMAL(8,2), -- Monthly rent per square foot
  cam_charges DECIMAL(8,2), -- Common Area Maintenance charges per sqft
  security_deposit_months INTEGER DEFAULT 1,
  annual_escalation DECIMAL(5,2), -- Annual rent increase percentage
  
  -- Occupancy Information
  current_occupancy_rate DECIMAL(5,2), -- Percentage occupied
  anchor_tenants TEXT[], -- List of major tenants
  tenant_mix TEXT[], -- Types of businesses
  
  -- Compliance & Permits
  occupancy_certificate_valid BOOLEAN DEFAULT FALSE,
  fire_safety_compliant BOOLEAN DEFAULT FALSE,
  ada_compliant BOOLEAN DEFAULT FALSE,
  permitted_uses TEXT[], -- Allowed business types
  
  -- Additional Details
  signage_rights BOOLEAN DEFAULT FALSE,
  drive_through_available BOOLEAN DEFAULT FALSE,
  restaurant_approved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commercial amenities table
CREATE TABLE commercial_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_type TEXT NOT NULL,
  amenity_name TEXT NOT NULL,
  description TEXT,
  is_included BOOLEAN DEFAULT TRUE,
  additional_cost DECIMAL(8,2), -- Monthly cost if not included
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lease history table for tracking lease agreements
CREATE TABLE commercial_lease_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  lease_start_date DATE NOT NULL,
  lease_end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  lease_type lease_type NOT NULL,
  space_size DECIMAL(10,2), -- Square footage leased
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commercial property analytics table
CREATE TABLE commercial_property_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Performance Metrics
  average_lease_duration INTEGER, -- Average lease length in months
  tenant_turnover_rate DECIMAL(5,2), -- Annual turnover percentage
  vacancy_rate DECIMAL(5,2), -- Current vacancy percentage
  rent_per_sqft_market DECIMAL(8,2), -- Market rate comparison
  
  -- Financial Metrics
  gross_rental_income DECIMAL(12,2), -- Annual gross income
  operating_expenses DECIMAL(12,2), -- Annual operating costs
  net_operating_income DECIMAL(12,2), -- NOI
  cap_rate DECIMAL(5,2), -- Capitalization rate
  
  -- Market Data
  comparable_properties INTEGER, -- Number of comparable properties
  market_rent_trend DECIMAL(5,2), -- Rent trend percentage
  absorption_rate DECIMAL(5,2), -- Market absorption rate
  
  analytics_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_commercial_details_property_id ON commercial_property_details(property_id);
CREATE INDEX idx_commercial_details_type ON commercial_property_details(commercial_type);
CREATE INDEX idx_commercial_details_zoning ON commercial_property_details(zoning_type);
CREATE INDEX idx_commercial_details_building_class ON commercial_property_details(building_class);
CREATE INDEX idx_commercial_amenities_property_id ON commercial_amenities(property_id);
CREATE INDEX idx_commercial_lease_history_property_id ON commercial_lease_history(property_id);
CREATE INDEX idx_commercial_lease_history_active ON commercial_lease_history(is_active);
CREATE INDEX idx_commercial_analytics_property_id ON commercial_property_analytics(property_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_commercial_details_updated_at 
  BEFORE UPDATE ON commercial_property_details 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commercial_lease_updated_at
  BEFORE UPDATE ON commercial_lease_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commercial property search function
CREATE OR REPLACE FUNCTION search_commercial_properties(
  search_query TEXT DEFAULT NULL,
  commercial_type_filter commercial_property_type DEFAULT NULL,
  building_class_filter building_class DEFAULT NULL,
  zoning_filter commercial_zoning DEFAULT NULL,
  min_size DECIMAL DEFAULT NULL,
  max_size DECIMAL DEFAULT NULL,
  min_rent DECIMAL DEFAULT NULL,
  max_rent DECIMAL DEFAULT NULL,
  lease_type_filter lease_type DEFAULT NULL,
  min_parking INTEGER DEFAULT NULL,
  required_amenities TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  property_id UUID,
  title TEXT,
  description TEXT,
  price DECIMAL,
  currency TEXT,
  location JSONB,
  commercial_type commercial_property_type,
  building_class building_class,
  available_space DECIMAL,
  rent_per_sqft DECIMAL,
  parking_spaces INTEGER,
  occupancy_rate DECIMAL,
  amenities TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p.currency,
    jsonb_build_object(
      'address', pl.address,
      'city', pl.city,
      'state', pl.state,
      'country', pl.country
    ) as location,
    cd.commercial_type,
    cd.building_class,
    cd.available_space,
    cd.rent_per_sqft,
    cd.parking_spaces,
    cd.current_occupancy_rate,
    COALESCE(
      array_agg(DISTINCT ca.amenity_name) FILTER (WHERE ca.amenity_name IS NOT NULL),
      ARRAY[]::TEXT[]
    ) as amenities
  FROM properties p
  JOIN property_locations pl ON p.id = pl.property_id
  JOIN commercial_property_details cd ON p.id = cd.property_id
  LEFT JOIN commercial_amenities ca ON p.id = ca.property_id
  WHERE
    p.type = 'commercial'
    AND p.status = 'published'
    AND (search_query IS NULL OR (
      p.title ILIKE '%' || search_query || '%'
      OR p.description ILIKE '%' || search_query || '%'
      OR pl.city ILIKE '%' || search_query || '%'
    ))
    AND (commercial_type_filter IS NULL OR cd.commercial_type = commercial_type_filter)
    AND (building_class_filter IS NULL OR cd.building_class = building_class_filter)
    AND (zoning_filter IS NULL OR cd.zoning_type = zoning_filter)
    AND (min_size IS NULL OR cd.available_space >= min_size)
    AND (max_size IS NULL OR cd.available_space <= max_size)
    AND (min_rent IS NULL OR cd.rent_per_sqft >= min_rent)
    AND (max_rent IS NULL OR cd.rent_per_sqft <= max_rent)
    AND (lease_type_filter IS NULL OR cd.lease_type = lease_type_filter)
    AND (min_parking IS NULL OR cd.parking_spaces >= min_parking)
  GROUP BY
    p.id, p.title, p.description, p.price, p.currency,
    pl.address, pl.city, pl.state, pl.country,
    cd.commercial_type, cd.building_class, cd.available_space,
    cd.rent_per_sqft, cd.parking_spaces, cd.current_occupancy_rate
  HAVING (
    required_amenities IS NULL
    OR required_amenities <@ COALESCE(
      array_agg(DISTINCT ca.amenity_name) FILTER (WHERE ca.amenity_name IS NOT NULL),
      ARRAY[]::TEXT[]
    )
  )
  ORDER BY p.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Get commercial property analytics
CREATE OR REPLACE FUNCTION get_commercial_analytics()
RETURNS TABLE (
  total_commercial_properties BIGINT,
  total_available_space DECIMAL,
  average_rent_per_sqft DECIMAL,
  average_occupancy_rate DECIMAL,
  properties_by_type JSONB,
  properties_by_class JSONB,
  top_performing_properties JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.id) as total_commercial_properties,
    COALESCE(SUM(cd.available_space), 0) as total_available_space,
    COALESCE(AVG(cd.rent_per_sqft), 0) as average_rent_per_sqft,
    COALESCE(AVG(cd.current_occupancy_rate), 0) as average_occupancy_rate,

    -- Properties by type
    (SELECT jsonb_object_agg(commercial_type, count)
     FROM (
       SELECT cd2.commercial_type, COUNT(*) as count
       FROM commercial_property_details cd2
       JOIN properties p2 ON cd2.property_id = p2.id
       WHERE p2.status = 'published'
       GROUP BY cd2.commercial_type
     ) type_counts) as properties_by_type,

    -- Properties by building class
    (SELECT jsonb_object_agg(building_class, count)
     FROM (
       SELECT cd3.building_class, COUNT(*) as count
       FROM commercial_property_details cd3
       JOIN properties p3 ON cd3.property_id = p3.id
       WHERE p3.status = 'published' AND cd3.building_class IS NOT NULL
       GROUP BY cd3.building_class
     ) class_counts) as properties_by_class,

    -- Top performing properties (by views)
    (SELECT jsonb_agg(
       jsonb_build_object(
         'id', p4.id,
         'title', p4.title,
         'views', p4.views,
         'occupancy_rate', cd4.current_occupancy_rate,
         'rent_per_sqft', cd4.rent_per_sqft
       )
     )
     FROM (
       SELECT p4.*, cd4.current_occupancy_rate, cd4.rent_per_sqft
       FROM properties p4
       JOIN commercial_property_details cd4 ON p4.id = cd4.property_id
       WHERE p4.type = 'commercial' AND p4.status = 'published'
       ORDER BY p4.views DESC
       LIMIT 5
     ) p4) as top_performing_properties

  FROM properties p
  JOIN commercial_property_details cd ON p.id = cd.property_id
  WHERE p.type = 'commercial' AND p.status = 'published';
END;
$$ LANGUAGE plpgsql;

-- Update commercial property occupancy
CREATE OR REPLACE FUNCTION update_commercial_occupancy(
  property_id_param UUID,
  new_occupancy_rate DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE commercial_property_details
  SET
    current_occupancy_rate = new_occupancy_rate,
    updated_at = NOW()
  WHERE property_id = property_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Add commercial lease record
CREATE OR REPLACE FUNCTION add_commercial_lease(
  property_id_param UUID,
  tenant_name_param TEXT,
  lease_start_param DATE,
  lease_end_param DATE,
  monthly_rent_param DECIMAL,
  security_deposit_param DECIMAL,
  lease_type_param lease_type,
  space_size_param DECIMAL
)
RETURNS UUID AS $$
DECLARE
  lease_id UUID;
BEGIN
  INSERT INTO commercial_lease_history (
    property_id, tenant_name, lease_start_date, lease_end_date,
    monthly_rent, security_deposit, lease_type, space_size
  ) VALUES (
    property_id_param, tenant_name_param, lease_start_param, lease_end_param,
    monthly_rent_param, security_deposit_param, lease_type_param, space_size_param
  ) RETURNING id INTO lease_id;

  RETURN lease_id;
END;
$$ LANGUAGE plpgsql;
