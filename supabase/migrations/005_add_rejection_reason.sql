-- Add rejection reason field to properties table
-- This migration adds support for storing rejection reasons when properties are rejected

-- Add rejection_reason column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add rejected_at timestamp to track when property was rejected
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- Add rejected_by to track which admin rejected the property
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES profiles(id);

-- Create index for better query performance on rejected properties
CREATE INDEX IF NOT EXISTS idx_properties_rejected_status 
ON properties(status) WHERE status = 'rejected';

-- Create index for rejected_at for sorting rejected properties
CREATE INDEX IF NOT EXISTS idx_properties_rejected_at 
ON properties(rejected_at) WHERE rejected_at IS NOT NULL;

-- Function to reject property with reason
CREATE OR REPLACE FUNCTION reject_property_with_reason(
  p_property_id UUID,
  p_admin_id UUID,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  property_title TEXT;
  provider_id_val UUID;
BEGIN
  -- Get property details for notification
  SELECT title, provider_id INTO property_title, provider_id_val
  FROM properties 
  WHERE id = p_property_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update property status to rejected
  UPDATE properties 
  SET 
    status = 'rejected',
    rejection_reason = p_rejection_reason,
    rejected_at = NOW(),
    rejected_by = p_admin_id,
    published_at = NULL,
    updated_at = NOW()
  WHERE id = p_property_id;
  
  -- Create system notification for property rejection
  PERFORM create_system_notification(
    'property_rejection',
    'Property Rejected',
    format('Property "%s" has been rejected. Reason: %s', 
           property_title, 
           COALESCE(p_rejection_reason, 'No reason provided')),
    'warning',
    NULL, -- Notify all admins
    'property',
    p_property_id
  );
  
  -- If property has a provider, create a provider-specific notification
  IF provider_id_val IS NOT NULL THEN
    -- Get provider user_id
    DECLARE
      provider_user_id UUID;
    BEGIN
      SELECT user_id INTO provider_user_id 
      FROM providers 
      WHERE id = provider_id_val;
      
      IF FOUND THEN
        -- Create provider notification (we'll implement this table later)
        INSERT INTO provider_notifications (
          provider_id,
          user_id,
          type,
          title,
          message,
          severity,
          related_entity_type,
          related_entity_id,
          created_at
        ) VALUES (
          provider_id_val,
          provider_user_id,
          'property_rejection',
          'Property Rejected',
          format('Your property "%s" has been rejected. Reason: %s', 
                 property_title, 
                 COALESCE(p_rejection_reason, 'No specific reason provided. Please contact support for more details.')),
          'warning',
          'property',
          p_property_id,
          NOW()
        );
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Continue even if provider notification fails
        NULL;
    END;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create provider notifications table for provider-specific notifications
CREATE TABLE IF NOT EXISTS provider_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'property_rejection', 'property_approval', etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type VARCHAR(50), -- 'property', 'inquiry', etc.
  related_entity_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- Create indexes for provider notifications
CREATE INDEX IF NOT EXISTS idx_provider_notifications_provider_id 
ON provider_notifications(provider_id);

CREATE INDEX IF NOT EXISTS idx_provider_notifications_user_id 
ON provider_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_provider_notifications_unread 
ON provider_notifications(is_read) WHERE is_read = FALSE;

-- RLS policies for provider notifications
ALTER TABLE provider_notifications ENABLE ROW LEVEL SECURITY;

-- Providers can only see their own notifications
CREATE POLICY "Providers can view own notifications" ON provider_notifications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Providers can mark their own notifications as read
CREATE POLICY "Providers can update own notifications" ON provider_notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only admins can create notifications
CREATE POLICY "Admins can create notifications" ON provider_notifications
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Function to mark provider notification as read
CREATE OR REPLACE FUNCTION mark_provider_notification_read(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE provider_notifications 
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count for provider
CREATE OR REPLACE FUNCTION get_provider_unread_notifications_count(
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM provider_notifications
  WHERE user_id = p_user_id AND is_read = FALSE;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
