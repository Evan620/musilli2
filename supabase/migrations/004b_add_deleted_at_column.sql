-- Add missing deleted_at column for soft deletion
-- This fixes the issue where the column was added to migration 004 after it was already run

-- Add the deleted_at column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Update the soft_delete_user function to use deleted_at instead of changing status
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

-- Add index for the new column
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

-- Insert notification about the update
INSERT INTO system_notifications (type, title, message, severity)
VALUES (
  'system_update',
  'Soft Delete System Updated',
  'User soft deletion system has been updated with proper deleted_at column tracking.',
  'info'
);

COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when user was soft deleted (NULL = not deleted)';
