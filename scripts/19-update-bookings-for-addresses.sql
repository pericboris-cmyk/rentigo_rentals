-- Add address columns and time columns to bookings table
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS pickup_address TEXT,
  ADD COLUMN IF NOT EXISTS dropoff_address TEXT,
  ADD COLUMN IF NOT EXISTS pickup_time TEXT DEFAULT '10:00',
  ADD COLUMN IF NOT EXISTS dropoff_time TEXT DEFAULT '10:00';

-- Update existing bookings to copy location names to addresses
UPDATE bookings b
SET 
  pickup_address = COALESCE((SELECT name FROM locations WHERE id = b.pickup_location_id), 'Nicht angegeben'),
  dropoff_address = COALESCE((SELECT name FROM locations WHERE id = b.dropoff_location_id), 'Nicht angegeben')
WHERE pickup_address IS NULL OR dropoff_address IS NULL;
