-- Real-time Notifications Setup for Musilli Homes
-- Run this in your Supabase SQL Editor

-- 1. Ensure provider_notifications table exists (should already exist from previous migrations)
CREATE TABLE IF NOT EXISTS provider_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create indexes for provider notifications (if not exists)
CREATE INDEX IF NOT EXISTS idx_provider_notifications_user_id ON provider_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_notifications_unread ON provider_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_provider_notifications_created_at ON provider_notifications(created_at DESC);

-- 3. Enable RLS on provider_notifications
ALTER TABLE provider_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for provider_notifications
DROP POLICY IF EXISTS "Providers can view own notifications" ON provider_notifications;
DROP POLICY IF EXISTS "Providers can update own notifications" ON provider_notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON provider_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON provider_notifications;

CREATE POLICY "Providers can view own notifications" ON provider_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Providers can update own notifications" ON provider_notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" ON provider_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can create notifications" ON provider_notifications
  FOR INSERT WITH CHECK (true);

-- 5. Create helper functions for provider notifications
CREATE OR REPLACE FUNCTION get_provider_unread_notifications_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM provider_notifications
  WHERE user_id = p_user_id AND is_read = FALSE;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_provider_notification_read(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE provider_notifications
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE id = p_notification_id 
    AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enhanced property approval function with notifications
CREATE OR REPLACE FUNCTION approve_property_with_notification(
  p_property_id UUID,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_property_title TEXT;
  v_provider_id UUID;
  v_provider_user_id UUID;
  v_provider_name TEXT;
BEGIN
  -- Get property and provider details
  SELECT p.title, p.provider_id, pr.user_id, pr.business_name
  INTO v_property_title, v_provider_id, v_provider_user_id, v_provider_name
  FROM properties p
  LEFT JOIN providers pr ON pr.id = p.provider_id
  WHERE p.id = p_property_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update property status
  UPDATE properties SET
    status = 'published',
    published_at = NOW(),
    updated_at = NOW()
  WHERE id = p_property_id;
  
  -- Log admin activity
  INSERT INTO admin_activity_logs (
    admin_id, action_type, target_type, target_id, target_email,
    details
  ) VALUES (
    p_admin_id, 'property_approve', 'property', p_property_id, '',
    jsonb_build_object(
      'property_title', v_property_title,
      'provider_name', v_provider_name
    )
  );
  
  -- Create provider notification (if it's a provider property)
  IF v_provider_user_id IS NOT NULL THEN
    INSERT INTO provider_notifications (
      provider_id, user_id, type, title, message, severity,
      related_entity_type, related_entity_id
    ) VALUES (
      v_provider_id, v_provider_user_id, 'property_approved',
      'Property Approved',
      'Your property "' || v_property_title || '" has been approved and is now live on the platform.',
      'success',
      'property', p_property_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Enhanced property rejection function with notifications
CREATE OR REPLACE FUNCTION reject_property_with_notification(
  p_property_id UUID,
  p_admin_id UUID,
  p_rejection_reason TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_property_title TEXT;
  v_provider_id UUID;
  v_provider_user_id UUID;
  v_provider_name TEXT;
BEGIN
  -- Get property and provider details
  SELECT p.title, p.provider_id, pr.user_id, pr.business_name
  INTO v_property_title, v_provider_id, v_provider_user_id, v_provider_name
  FROM properties p
  LEFT JOIN providers pr ON pr.id = p.provider_id
  WHERE p.id = p_property_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update property status
  UPDATE properties SET
    status = 'rejected',
    rejection_reason = p_rejection_reason,
    rejected_at = NOW(),
    rejected_by = p_admin_id,
    published_at = NULL,
    updated_at = NOW()
  WHERE id = p_property_id;
  
  -- Log admin activity
  INSERT INTO admin_activity_logs (
    admin_id, action_type, target_type, target_id, target_email,
    details
  ) VALUES (
    p_admin_id, 'property_reject', 'property', p_property_id, '',
    jsonb_build_object(
      'property_title', v_property_title,
      'provider_name', v_provider_name,
      'rejection_reason', p_rejection_reason
    )
  );
  
  -- Create provider notification (if it's a provider property)
  IF v_provider_user_id IS NOT NULL THEN
    INSERT INTO provider_notifications (
      provider_id, user_id, type, title, message, severity,
      related_entity_type, related_entity_id
    ) VALUES (
      v_provider_id, v_provider_user_id, 'property_rejected',
      'Property Rejected',
      'Your property "' || v_property_title || '" has been rejected. Reason: ' || p_rejection_reason,
      'error',
      'property', p_property_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enhanced provider approval function with notifications
CREATE OR REPLACE FUNCTION approve_provider_with_notification(
  p_provider_id UUID,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_provider_user_id UUID;
  v_provider_name TEXT;
  v_provider_email TEXT;
BEGIN
  -- Get provider details
  SELECT pr.user_id, pr.business_name, p.email
  INTO v_provider_user_id, v_provider_name, v_provider_email
  FROM providers pr
  JOIN profiles p ON p.id = pr.user_id
  WHERE pr.id = p_provider_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update provider status
  UPDATE providers SET
    approval_status = 'approved',
    approved_at = NOW(),
    approved_by = p_admin_id,
    subscription_status = 'active',
    updated_at = NOW()
  WHERE id = p_provider_id;
  
  -- Update profile status
  UPDATE profiles SET
    status = 'approved',
    updated_at = NOW()
  WHERE id = v_provider_user_id;
  
  -- Log admin activity
  INSERT INTO admin_activity_logs (
    admin_id, action_type, target_type, target_id, target_email,
    details
  ) VALUES (
    p_admin_id, 'provider_approve', 'provider', p_provider_id, v_provider_email,
    jsonb_build_object(
      'provider_name', v_provider_name
    )
  );
  
  -- Create provider notification
  INSERT INTO provider_notifications (
    provider_id, user_id, type, title, message, severity,
    related_entity_type, related_entity_id
  ) VALUES (
    p_provider_id, v_provider_user_id, 'provider_approved',
    'Provider Application Approved',
    'Congratulations! Your provider application has been approved. You can now start listing properties on our platform.',
    'success',
    'provider', p_provider_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Enhanced provider rejection function with notifications
CREATE OR REPLACE FUNCTION reject_provider_with_notification(
  p_provider_id UUID,
  p_admin_id UUID,
  p_rejection_reason TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_provider_user_id UUID;
  v_provider_name TEXT;
  v_provider_email TEXT;
BEGIN
  -- Get provider details
  SELECT pr.user_id, pr.business_name, p.email
  INTO v_provider_user_id, v_provider_name, v_provider_email
  FROM providers pr
  JOIN profiles p ON p.id = pr.user_id
  WHERE pr.id = p_provider_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update provider status
  UPDATE providers SET
    approval_status = 'rejected',
    approved_by = p_admin_id,
    updated_at = NOW()
  WHERE id = p_provider_id;
  
  -- Update profile status
  UPDATE profiles SET
    status = 'rejected',
    updated_at = NOW()
  WHERE id = v_provider_user_id;
  
  -- Log admin activity
  INSERT INTO admin_activity_logs (
    admin_id, action_type, target_type, target_id, target_email,
    details
  ) VALUES (
    p_admin_id, 'provider_reject', 'provider', p_provider_id, v_provider_email,
    jsonb_build_object(
      'provider_name', v_provider_name,
      'rejection_reason', p_rejection_reason
    )
  );
  
  -- Create provider notification
  INSERT INTO provider_notifications (
    provider_id, user_id, type, title, message, severity,
    related_entity_type, related_entity_id
  ) VALUES (
    p_provider_id, v_provider_user_id, 'provider_rejected',
    'Provider Application Rejected',
    'Your provider application has been rejected. Reason: ' || p_rejection_reason || '. You can reapply after addressing the issues mentioned.',
    'error',
    'provider', p_provider_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Insert initial notification about real-time system
INSERT INTO system_notifications (
  type, title, message, severity
) VALUES (
  'system_update',
  'Real-time Notification System Enabled',
  'The real-time notification system has been successfully set up. Admins and providers will now receive instant notifications.',
  'success'
) ON CONFLICT DO NOTHING;

-- 11. Add comments for documentation
COMMENT ON FUNCTION approve_property_with_notification IS 'Approves a property and sends notification to provider';
COMMENT ON FUNCTION reject_property_with_notification IS 'Rejects a property and sends notification to provider';
COMMENT ON FUNCTION approve_provider_with_notification IS 'Approves a provider and sends welcome notification';
COMMENT ON FUNCTION reject_provider_with_notification IS 'Rejects a provider and sends notification with reason';