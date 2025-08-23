-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update property view count
CREATE OR REPLACE FUNCTION increment_property_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties 
  SET views = views + 1 
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment views when property_views record is inserted
CREATE TRIGGER on_property_view_created
  AFTER INSERT ON property_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_property_views();

-- Function to update property inquiry count
CREATE OR REPLACE FUNCTION increment_property_inquiries()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties 
  SET inquiries = inquiries + 1 
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment inquiries when inquiry is created
CREATE TRIGGER on_inquiry_created
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION increment_property_inquiries();

-- Function to update provider statistics
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER AS $$
DECLARE
  provider_id_val UUID;
BEGIN
  -- Get provider_id from the property
  IF TG_OP = 'INSERT' THEN
    provider_id_val := NEW.provider_id;
  ELSIF TG_OP = 'DELETE' THEN
    provider_id_val := OLD.provider_id;
  END IF;

  -- Update provider statistics
  UPDATE providers SET
    total_listings = (
      SELECT COUNT(*) FROM properties 
      WHERE provider_id = provider_id_val AND status = 'published'
    ),
    total_views = (
      SELECT COALESCE(SUM(views), 0) FROM properties 
      WHERE provider_id = provider_id_val
    ),
    total_inquiries = (
      SELECT COALESCE(SUM(inquiries), 0) FROM properties 
      WHERE provider_id = provider_id_val
    )
  WHERE id = provider_id_val;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update provider stats when properties change
CREATE TRIGGER update_provider_stats_on_property_insert
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_stats();

CREATE TRIGGER update_provider_stats_on_property_update
  AFTER UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_stats();

CREATE TRIGGER update_provider_stats_on_property_delete
  AFTER DELETE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_stats();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get property with all related data
CREATE OR REPLACE FUNCTION get_property_with_details(property_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'property', row_to_json(p.*),
    'location', row_to_json(pl.*),
    'features', row_to_json(pf.*),
    'amenities', COALESCE(
      (SELECT json_agg(pa.amenity) FROM property_amenities pa WHERE pa.property_id = p.id),
      '[]'::json
    ),
    'utilities', COALESCE(
      (SELECT json_agg(pu.utility) FROM property_utilities pu WHERE pu.property_id = p.id),
      '[]'::json
    ),
    'images', COALESCE(
      (SELECT json_agg(row_to_json(pi.*)) FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.display_order),
      '[]'::json
    ),
    'provider', row_to_json(pr.*)
  ) INTO result
  FROM properties p
  LEFT JOIN property_locations pl ON p.id = pl.property_id
  LEFT JOIN property_features pf ON p.id = pf.property_id
  LEFT JOIN providers pr ON p.provider_id = pr.id
  WHERE p.id = property_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search properties with filters
CREATE OR REPLACE FUNCTION search_properties(
  search_query TEXT DEFAULT NULL,
  property_type property_type DEFAULT NULL,
  property_category property_category DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  min_bedrooms INTEGER DEFAULT NULL,
  max_bedrooms INTEGER DEFAULT NULL,
  min_bathrooms INTEGER DEFAULT NULL,
  max_bathrooms INTEGER DEFAULT NULL,
  min_area DECIMAL DEFAULT NULL,
  max_area DECIMAL DEFAULT NULL,
  amenities_filter TEXT[] DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc',
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  type property_type,
  category property_category,
  status property_status,
  price DECIMAL,
  currency TEXT,
  provider_id UUID,
  views INTEGER,
  inquiries INTEGER,
  is_featured BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  location JSON,
  features JSON,
  amenities JSON,
  images JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.type,
    p.category,
    p.status,
    p.price,
    p.currency,
    p.provider_id,
    p.views,
    p.inquiries,
    p.is_featured,
    p.created_at,
    p.updated_at,
    p.published_at,
    row_to_json(pl.*) as location,
    row_to_json(pf.*) as features,
    COALESCE(
      (SELECT json_agg(pa.amenity) FROM property_amenities pa WHERE pa.property_id = p.id),
      '[]'::json
    ) as amenities,
    COALESCE(
      (SELECT json_agg(row_to_json(pi.*)) FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.display_order),
      '[]'::json
    ) as images
  FROM properties p
  LEFT JOIN property_locations pl ON p.id = pl.property_id
  LEFT JOIN property_features pf ON p.id = pf.property_id
  WHERE 
    (search_query IS NULL OR (
      to_tsvector('english', p.title || ' ' || p.description) @@ plainto_tsquery('english', search_query)
      OR pl.city ILIKE '%' || search_query || '%'
      OR pl.address ILIKE '%' || search_query || '%'
    ))
    AND (property_type IS NULL OR p.type = property_type)
    AND (property_category IS NULL OR p.category = property_category)
    AND (city_filter IS NULL OR pl.city = city_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (min_bedrooms IS NULL OR pf.bedrooms >= min_bedrooms)
    AND (max_bedrooms IS NULL OR pf.bedrooms <= max_bedrooms)
    AND (min_bathrooms IS NULL OR pf.bathrooms >= min_bathrooms)
    AND (max_bathrooms IS NULL OR pf.bathrooms <= max_bathrooms)
    AND (min_area IS NULL OR pf.area >= min_area)
    AND (max_area IS NULL OR pf.area <= max_area)
    AND (amenities_filter IS NULL OR EXISTS (
      SELECT 1 FROM property_amenities pa 
      WHERE pa.property_id = p.id 
      AND pa.amenity = ANY(amenities_filter)
    ))
    AND p.status = 'published'
  ORDER BY 
    CASE WHEN sort_by = 'price' AND sort_order = 'asc' THEN p.price END ASC,
    CASE WHEN sort_by = 'price' AND sort_order = 'desc' THEN p.price END DESC,
    CASE WHEN sort_by = 'views' AND sort_order = 'asc' THEN p.views END ASC,
    CASE WHEN sort_by = 'views' AND sort_order = 'desc' THEN p.views END DESC,
    CASE WHEN sort_by = 'area' AND sort_order = 'asc' THEN pf.area END ASC,
    CASE WHEN sort_by = 'area' AND sort_order = 'desc' THEN pf.area END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
