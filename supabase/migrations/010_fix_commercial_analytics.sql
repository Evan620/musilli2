-- Fix commercial analytics function
-- The original function had a SQL error in the subquery

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

    -- Top performing properties (by views) - Fixed subquery
    (SELECT jsonb_agg(
       jsonb_build_object(
         'id', top_props.id,
         'title', top_props.title,
         'views', top_props.views,
         'occupancy_rate', top_props.current_occupancy_rate,
         'rent_per_sqft', top_props.rent_per_sqft
       )
     )
     FROM (
       SELECT p4.id, p4.title, p4.views, cd4.current_occupancy_rate, cd4.rent_per_sqft
       FROM properties p4
       JOIN commercial_property_details cd4 ON p4.id = cd4.property_id
       WHERE p4.type = 'commercial' AND p4.status = 'published'
       ORDER BY p4.views DESC
       LIMIT 5
     ) top_props) as top_performing_properties

  FROM properties p
  JOIN commercial_property_details cd ON p.id = cd.property_id
  WHERE p.type = 'commercial' AND p.status = 'published';
END;
$$ LANGUAGE plpgsql;