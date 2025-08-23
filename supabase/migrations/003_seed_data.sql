-- Seed data for testing
-- This script adds some initial data to test the application

-- Insert admin user (you'll need to create this user through Supabase Auth first)
-- Then update the profile
-- INSERT INTO profiles (id, email, name, role, status) 
-- VALUES ('admin-user-id', 'admin@musillihomes.com', 'Admin User', 'admin', 'approved');

-- Insert sample providers (these will be created when providers register)
-- The actual provider records will be created through the registration process

-- For now, let's create some sample data that can be used once you have real users
-- You can run this after creating some test accounts

-- Sample property data (will be inserted after providers are created)
-- This is just a template - actual data will come from the frontend forms

-- Example of how to insert a property (run after you have real provider IDs):
/*
INSERT INTO properties (title, description, type, category, price, currency, provider_id, status) 
VALUES (
  'Modern Luxury Villa',
  'Beautiful 4-bedroom villa with ocean view, perfect for families or vacation rental.',
  'house',
  'sale',
  85000000.00,
  'KSH',
  'your-provider-id-here',
  'published'
);

-- Then insert related data:
INSERT INTO property_locations (property_id, address, city, state, country, zip_code)
VALUES (
  'property-id-from-above',
  '123 Ocean Drive',
  'Mombasa',
  'Mombasa County',
  'Kenya',
  '80100'
);

INSERT INTO property_features (property_id, bedrooms, bathrooms, area, area_unit, parking, furnished, pet_friendly)
VALUES (
  'property-id-from-above',
  4,
  3,
  3500.00,
  'sqft',
  2,
  true,
  true
);

INSERT INTO property_amenities (property_id, amenity)
VALUES 
  ('property-id-from-above', 'Private Pool'),
  ('property-id-from-above', 'Garden'),
  ('property-id-from-above', 'Security'),
  ('property-id-from-above', 'Generator'),
  ('property-id-from-above', 'Water Views');

INSERT INTO property_utilities (property_id, utility)
VALUES 
  ('property-id-from-above', 'Electricity'),
  ('property-id-from-above', 'Water'),
  ('property-id-from-above', 'Internet'),
  ('property-id-from-above', 'Gas');

INSERT INTO property_images (property_id, url, alt_text, is_primary, display_order)
VALUES (
  'property-id-from-above',
  '/placeholder.svg',
  'Villa exterior',
  true,
  1
);
*/

-- For now, this file serves as a template
-- Real data will be created through the application interface
SELECT 'Database schema is ready for data!' as message;
