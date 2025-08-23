-- User Management Enhancement Migration
-- This migration adds fields and tables needed for comprehensive user management

-- 1. Enhance profiles table with user management fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes TEXT; -- Admin notes about user
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP; -- Soft delete timestamp

-- 2. Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL, -- 'user_suspend', 'user_activate', 'user_delete', etc.
  target_type VARCHAR(50) NOT NULL, -- 'user', 'property', 'provider'
  target_id UUID NOT NULL,
  target_email VARCHAR(255), -- Store email for reference even if user is deleted
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create system notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'user_registration', 'user_suspension', etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  is_read BOOLEAN DEFAULT FALSE,
  admin_id UUID REFERENCES profiles(id), -- NULL for all admins
  related_entity_type VARCHAR(50), -- 'user', 'property', 'provider'
  related_entity_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at);
CREATE INDEX IF NOT EXISTS idx_profiles_status_role ON profiles(status, role);
CREATE INDEX IF NOT EXISTS idx_profiles_email_search ON profiles USING gin(to_tsvector('english', email));
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON profiles USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_activity_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON system_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON system_notifications(is_read, created_at DESC);

-- 5. Create helper functions for user management

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action_type VARCHAR(50),
  p_target_type VARCHAR(50),
  p_target_id UUID,
  p_target_email VARCHAR(255) DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_activity_logs (
    admin_id, action_type, target_type, target_id, target_email,
    details, ip_address, user_agent
  ) VALUES (
    p_admin_id, p_action_type, p_target_type, p_target_id, p_target_email,
    p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create system notification
CREATE OR REPLACE FUNCTION create_system_notification(
  p_type VARCHAR(50),
  p_title VARCHAR(200),
  p_message TEXT,
  p_severity VARCHAR(20) DEFAULT 'info',
  p_admin_id UUID DEFAULT NULL,
  p_related_entity_type VARCHAR(50) DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO system_notifications (
    type, title, message, severity, admin_id, 
    related_entity_type, related_entity_id
  ) VALUES (
    p_type, p_title, p_message, p_severity, p_admin_id,
    p_related_entity_type, p_related_entity_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend user
CREATE OR REPLACE FUNCTION suspend_user(
  p_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  user_email VARCHAR(255);
  user_name VARCHAR(255);
BEGIN
  -- Get user details
  SELECT email, name INTO user_email, user_name
  FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update user status
  UPDATE profiles 
  SET 
    status = 'suspended',
    suspension_reason = p_reason,
    suspended_by = p_admin_id,
    suspended_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_id, 'user_suspend', 'user', p_user_id, user_email,
    jsonb_build_object('reason', p_reason, 'user_name', user_name),
    p_ip_address, p_user_agent
  );
  
  -- Create notification
  PERFORM create_system_notification(
    'user_suspension',
    'User Suspended',
    format('User %s (%s) has been suspended. Reason: %s', user_name, user_email, p_reason),
    'warning',
    NULL, -- Notify all admins
    'user',
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate user
CREATE OR REPLACE FUNCTION activate_user(
  p_user_id UUID,
  p_admin_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  user_email VARCHAR(255);
  user_name VARCHAR(255);
BEGIN
  -- Get user details
  SELECT email, name INTO user_email, user_name
  FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update user status
  UPDATE profiles 
  SET 
    status = 'approved',
    suspension_reason = NULL,
    suspended_by = NULL,
    suspended_at = NULL,
    account_locked_until = NULL,
    failed_login_attempts = 0,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_id, 'user_activate', 'user', p_user_id, user_email,
    jsonb_build_object('user_name', user_name),
    p_ip_address, p_user_agent
  );
  
  -- Create notification
  PERFORM create_system_notification(
    'user_activation',
    'User Activated',
    format('User %s (%s) has been activated and can now access the platform.', user_name, user_email),
    'success',
    NULL, -- Notify all admins
    'user',
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete user
CREATE OR REPLACE FUNCTION soft_delete_user(
  p_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT DEFAULT 'Admin deletion',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  user_email VARCHAR(255);
  user_name VARCHAR(255);
BEGIN
  -- Get user details
  SELECT email, name INTO user_email, user_name
  FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Soft delete user (mark as deleted but keep data for audit)
  UPDATE profiles
  SET
    deleted_at = NOW(),
    email = email || '_deleted_' || extract(epoch from now())::text,
    suspension_reason = p_reason,
    suspended_by = p_admin_id,
    suspended_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_id, 'user_delete', 'user', p_user_id, user_email,
    jsonb_build_object('reason', p_reason, 'user_name', user_name, 'original_email', user_email),
    p_ip_address, p_user_agent
  );
  
  -- Create notification
  PERFORM create_system_notification(
    'user_deletion',
    'User Deleted',
    format('User %s (%s) has been deleted. Reason: %s', user_name, user_email, p_reason),
    'error',
    NULL, -- Notify all admins
    'user',
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION log_admin_action TO authenticated;
GRANT EXECUTE ON FUNCTION create_system_notification TO authenticated;
GRANT EXECUTE ON FUNCTION suspend_user TO authenticated;
GRANT EXECUTE ON FUNCTION activate_user TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_user TO authenticated;

-- Enable RLS on new tables
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_activity_logs (only admins can access)
CREATE POLICY "Admins can view all activity logs" ON admin_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert activity logs" ON admin_activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS policies for system_notifications (only admins can access)
CREATE POLICY "Admins can view notifications" ON system_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update notifications" ON system_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert initial notification for migration completion
INSERT INTO system_notifications (type, title, message, severity)
VALUES (
  'system_update',
  'User Management System Enabled',
  'The enhanced user management system has been successfully deployed. Admins can now manage users, track activities, and receive system notifications.',
  'success'
);

COMMENT ON TABLE admin_activity_logs IS 'Tracks all administrative actions for audit and compliance';
COMMENT ON TABLE system_notifications IS 'System-generated notifications for administrators';
COMMENT ON FUNCTION log_admin_action IS 'Logs administrative actions with full audit trail';
COMMENT ON FUNCTION suspend_user IS 'Suspends a user account with reason and admin tracking';
COMMENT ON FUNCTION activate_user IS 'Activates a suspended user account';
COMMENT ON FUNCTION soft_delete_user IS 'Soft deletes a user account while preserving audit trail';
