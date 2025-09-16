-- Function to handle cascading soft-delete for providers and their properties
CREATE OR REPLACE FUNCTION soft_delete_provider_cascade()
RETURNS TRIGGER AS $$
DECLARE
  provider_user_id UUID;
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- A profile has been soft-deleted
    -- Find the associated provider
    SELECT id INTO provider_user_id FROM providers WHERE user_id = NEW.id;

    IF provider_user_id IS NOT NULL THEN
      -- Soft-delete the provider
      UPDATE providers
      SET
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = provider_user_id;

      -- Soft-delete/archive all properties belonging to this provider
      UPDATE properties
      SET
        status = 'archived', -- Or 'deleted', depending on desired visibility
        updated_at = NOW()
      WHERE provider_id = provider_user_id;

      -- Log the action
      PERFORM log_admin_action(
        NEW.id, -- Assuming the admin who soft-deleted the profile is the user_id
        'provider_soft_delete_cascade',
        'provider',
        provider_user_id,
        NEW.email,
        jsonb_build_object('profile_id', NEW.id, 'profile_email', NEW.email),
        NULL, NULL -- IP and User Agent not available in trigger
      );

      PERFORM create_system_notification(
        'provider_soft_delete',
        'Provider Soft-Deleted',
        format('Provider associated with user %s (%s) has been soft-deleted, and their properties archived.', NEW.name, NEW.email),
        'warning',
        NULL, -- Notify all admins
        'provider',
        provider_user_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to invoke soft_delete_provider_cascade when a profile is updated (soft-deleted)
CREATE TRIGGER on_profile_soft_delete
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
EXECUTE FUNCTION soft_delete_provider_cascade();

-- Grant execute permissions to authenticated users (or specific roles if needed)
GRANT EXECUTE ON FUNCTION soft_delete_provider_cascade TO authenticated;