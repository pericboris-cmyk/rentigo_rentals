-- Add extras column to bookings table to store selected additional services
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN bookings.extras IS 'JSON array of selected additional services with their prices';
