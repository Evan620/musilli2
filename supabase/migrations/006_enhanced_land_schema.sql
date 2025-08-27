-- Enhanced Land Property Management Schema
-- This migration adds specialized fields and tables for land properties

-- Add new land-specific enums
CREATE TYPE land_zoning AS ENUM (
  'residential', 'commercial', 'industrial', 'agricultural', 
  'mixed_use', 'recreational', 'institutional', 'conservation'
);

CREATE TYPE land_topography AS ENUM (
  'flat', 'gently_sloping', 'moderately_sloping', 'steep', 
  'hilly', 'mountainous', 'valley', 'plateau'
);

CREATE TYPE soil_type AS ENUM (
  'clay', 'sandy', 'loamy', 'rocky', 'fertile', 'poor', 
  'well_drained', 'waterlogged', 'mixed'
);

CREATE TYPE land_access AS ENUM (
  'paved_road', 'gravel_road', 'dirt_road', 'footpath', 
  'no_direct_access', 'seasonal_access'
);

CREATE TYPE development_status AS ENUM (
  'raw_land', 'partially_developed', 'ready_to_build', 
  'subdivided', 'titled', 'survey_done'
);

-- Extend property categories for land
ALTER TYPE property_category ADD VALUE IF NOT EXISTS 'lease';
ALTER TYPE property_category ADD VALUE IF NOT EXISTS 'development_rights';

-- Create land_details table for land-specific information
CREATE TABLE land_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE UNIQUE,
  
  -- Zoning and Legal
  zoning land_zoning,
  title_deed_available BOOLEAN DEFAULT FALSE,
  survey_done BOOLEAN DEFAULT FALSE,
  land_use_permit BOOLEAN DEFAULT FALSE,
  
  -- Physical Characteristics
  topography land_topography,
  soil_type soil_type,
  elevation_meters INTEGER,
  water_source TEXT, -- 'borehole', 'river', 'municipal', 'none'
  
  -- Access and Infrastructure
  road_access land_access,
  distance_to_main_road_km DECIMAL(5,2),
  electricity_available BOOLEAN DEFAULT FALSE,
  water_connection_available BOOLEAN DEFAULT FALSE,
  sewer_connection_available BOOLEAN DEFAULT FALSE,
  internet_coverage BOOLEAN DEFAULT FALSE,
  
  -- Development Potential
  development_status development_status,
  building_coverage_ratio DECIMAL(3,2), -- e.g., 0.6 for 60%
  floor_area_ratio DECIMAL(3,2),
  max_building_height_meters INTEGER,
  subdivision_potential BOOLEAN DEFAULT FALSE,
  environmental_restrictions TEXT,
  
  -- Agricultural (if applicable)
  agricultural_potential BOOLEAN DEFAULT FALSE,
  current_crops TEXT,
  irrigation_available BOOLEAN DEFAULT FALSE,
  
  -- Investment Information
  appreciation_potential TEXT, -- 'high', 'medium', 'low'
  nearby_developments TEXT,
  future_infrastructure_plans TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create land_boundaries table for precise boundary information
CREATE TABLE land_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  boundary_coordinates JSONB, -- GeoJSON format for precise boundaries
  survey_reference TEXT,
  beacon_numbers TEXT[],
  neighboring_properties TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create land_documents table for land-specific documents
CREATE TABLE land_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'title_deed', 'survey_plan', 'zoning_certificate', etc.
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  verified_by UUID REFERENCES profiles(id),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create land_valuations table for professional valuations
CREATE TABLE land_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  valuation_amount DECIMAL(15,2) NOT NULL,
  valuation_currency TEXT DEFAULT 'KSH',
  valuation_date DATE NOT NULL,
  valuer_name TEXT NOT NULL,
  valuer_license TEXT,
  valuation_method TEXT, -- 'comparative', 'income', 'cost', 'residual'
  valuation_report_url TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_land_details_property_id ON land_details(property_id);
CREATE INDEX idx_land_details_zoning ON land_details(zoning);
CREATE INDEX idx_land_details_development_status ON land_details(development_status);
CREATE INDEX idx_land_boundaries_property_id ON land_boundaries(property_id);
CREATE INDEX idx_land_documents_property_id ON land_documents(property_id);
CREATE INDEX idx_land_valuations_property_id ON land_valuations(property_id);

-- RLS Policies for land tables
ALTER TABLE land_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_valuations ENABLE ROW LEVEL SECURITY;

-- Land details policies
CREATE POLICY "Anyone can view published land details" ON land_details
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE status = 'published')
  );

CREATE POLICY "Providers can view own land details" ON land_details
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM properties p 
      JOIN providers pr ON p.provider_id = pr.id 
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all land details" ON land_details
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Similar policies for other land tables
CREATE POLICY "Land boundaries public access" ON land_boundaries
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE status = 'published')
  );

CREATE POLICY "Land documents public access" ON land_documents
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE status = 'published')
  );

CREATE POLICY "Land valuations restricted access" ON land_valuations
  FOR SELECT USING (
    property_id IN (
      SELECT p.id FROM properties p 
      JOIN providers pr ON p.provider_id = pr.id 
      WHERE pr.user_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

-- Function to create complete land property
CREATE OR REPLACE FUNCTION create_land_property(
  property_data JSONB,
  land_data JSONB DEFAULT NULL,
  boundary_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_property_id UUID;
BEGIN
  -- Create the main property record
  INSERT INTO properties (
    title, description, type, category, price, currency,
    provider_id, status, created_at, updated_at
  ) VALUES (
    property_data->>'title',
    property_data->>'description',
    'land',
    (property_data->>'category')::property_category,
    (property_data->>'price')::DECIMAL,
    COALESCE(property_data->>'currency', 'KSH'),
    (property_data->>'provider_id')::UUID,
    COALESCE((property_data->>'status')::property_status, 'pending'),
    NOW(),
    NOW()
  ) RETURNING id INTO new_property_id;
  
  -- Create land details if provided
  IF land_data IS NOT NULL THEN
    INSERT INTO land_details (
      property_id, zoning, title_deed_available, survey_done,
      topography, soil_type, road_access, electricity_available,
      development_status, agricultural_potential
    ) VALUES (
      new_property_id,
      (land_data->>'zoning')::land_zoning,
      COALESCE((land_data->>'title_deed_available')::BOOLEAN, FALSE),
      COALESCE((land_data->>'survey_done')::BOOLEAN, FALSE),
      (land_data->>'topography')::land_topography,
      (land_data->>'soil_type')::soil_type,
      (land_data->>'road_access')::land_access,
      COALESCE((land_data->>'electricity_available')::BOOLEAN, FALSE),
      (land_data->>'development_status')::development_status,
      COALESCE((land_data->>'agricultural_potential')::BOOLEAN, FALSE)
    );
  END IF;
  
  -- Create boundary data if provided
  IF boundary_data IS NOT NULL THEN
    INSERT INTO land_boundaries (
      property_id, boundary_coordinates, survey_reference
    ) VALUES (
      new_property_id,
      boundary_data->'coordinates',
      boundary_data->>'survey_reference'
    );
  END IF;
  
  RETURN new_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
