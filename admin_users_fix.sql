-- Admin Users Tab Fix - Complete Database Setup
-- Run this in your Supabase SQL Editor

-- 1. Ensure all required columns exist in profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 2. Create admin_activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  target_email VARCHAR(255),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create system_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  admin_id UUID REFERENCES profiles(id),
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_activity_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_notifications_admin_id ON system_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON system_notifications(created_at DESC);

-- 5. Enable RLS on tables
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for admin_activity_logs
DROP POLICY IF EXISTS "Admins can view all activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON admin_activity_logs;

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

-- 7. Create RLS policies for system_notifications
DROP POLICY IF EXISTS "Admins can view notifications" ON system_notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON system_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON system_notifications;

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

CREATE POLICY "System can insert notifications" ON system_notifications
  FOR INSERT WITH CHECK (true);

-- 8. Create helper functions for admin actions with activity logging

-- Function to suspend user with activity logging
CREATE OR REPLACE FUNCTION suspend_user_with_logging(
  p_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get user details for logging
  SELECT email, name INTO v_user_email, v_user_name
  FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update user status
  UPDATE profiles SET
    status = 'suspended',
    suspension_reason = p_reason,
    suspended_by = p_admin_id,
    suspended_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the action
  INSERT INTO admin_activity_logs (
    admin_id, action_type, target_type, target_id, target_email,
    details
  ) VALUES (
    p_admin_id, 'user_suspend', 'user', p_user_id, v_user_email,
    jsonb_build_object(
      'reason', p_reason,
      'user_name', v_user_name,
      'previous_status', 'approved'
    )
  );
  
  -- Create system notification
  INSERT INTO system_notifications (
    type, title, message, severity, admin_id,
    related_entity_type, related_entity_id
  ) VALUES (
    'user_suspended',
    'User Suspended',
    'User ' || v_user_name || ' (' || v_user_email || ') has been suspended. Reason: ' || p_reason,
    'warning',
    p_admin_id,
    'user',
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate user with activity logging
CREATE OR REPLACE FUNCTION activate_user_with_logging(
  p_user_id UUID,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_previous_status TEXT;
BEGIN
  -- Get user details for logging
  SELECT email, name, status INTO v_user_email, v_user_name, v_previous_status
  FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update user status
  UPDATE profiles SET
    status = 'approved',
    suspension_reason = NULL,
    suspended_by = NULL,
    suspended_at = NULL,
    account_locked_until = NULL,
    failed_login_attempts = 0,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the action
  INSERT INTO admin_activity_logs (
    admin_id, action_type, target_type, target_id, target_email,
    details
  ) VALUES (
    p_admin_id, 'user_activate', 'user', p_user_id, v_user_email,
    jsonb_build_object(
      'user_name', v_user_name,
      'previous_status', v_previous_status
    )
  );
  
  -- Create system notification
  INSERT INTO system_notifications (
    type, title, message, severity, admin_id,
    related_entity_type, related_entity_id
  ) VALUES (
    'user_activated',
    'User Activated',
    'User ' || v_user_name || ' (' || v_user_email || ') has been activated.',
    'success',
    p_admin_id,
    'user',
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete user with activity logging
CREATE OR REPLACE FUNCTION soft_delete_user_with_logging(
  p_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get user details for logging
  SELECT email, name INTO v_user_email, v_user_name
  FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Soft delete user (mark as deleted, don't actually delete)
  UPDATE profiles SET
    deleted_at = NOW(),
    deletion_reason = p_reason,
    email = email || '_deleted_' || extract(epoch from now())::text,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the action
  INSERT INTO admin_activity_logs (
    admin_id, action_type, target_type, target_id, target_email,
    details
  ) VALUES (
    p_admin_id, 'user_delete', 'user', p_user_id, v_user_email,
    jsonb_build_object(
      'reason', p_reason,
      'user_name', v_user_name,
      'deletion_type', 'soft_delete'
    )
  );
  
  -- Create system notification
  INSERT INTO system_notifications (
    type, title, message, severity, admin_id,
    related_entity_type, related_entity_id
  ) VALUES (
    'user_deleted',
    'User Deleted',
    'User ' || v_user_name || ' (' || v_user_email || ') has been deleted. Reason: ' || p_reason,
    'error',
    p_admin_id,
    'user',
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Insert initial system notification
INSERT INTO system_notifications (
  type, title, message, severity
) VALUES (
  'system_update',
  'Admin User Management System Enabled',
  'The admin user management system has been successfully set up with activity logging and notifications.',
  'success'
) ON CONFLICT DO NOTHING;

-- 10. Add comments for documentation
COMMENT ON TABLE admin_activity_logs IS 'Tracks all administrative actions for audit and compliance';
COMMENT ON TABLE system_notifications IS 'System-generated notifications for administrators';
COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when user was soft deleted (NULL = not deleted)';
COMMENT ON COLUMN profiles.suspension_reason IS 'Reason provided when user was suspended';
COMMENT ON COLUMN profiles.suspended_by IS 'Admin user ID who suspended this user';
COMMENT ON COLUMN profiles.suspended_at IS 'Timestamp when user was suspended';