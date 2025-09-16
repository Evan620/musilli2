-- Add deleted_at column to providers table for soft deletion
ALTER TABLE providers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add index for performance on deleted_at
CREATE INDEX IF NOT EXISTS idx_providers_deleted_at ON providers(deleted_at);