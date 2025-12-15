-- Add postal_code column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);

-- Add comment
COMMENT ON COLUMN users.postal_code IS 'Swiss postal code (PLZ)';
