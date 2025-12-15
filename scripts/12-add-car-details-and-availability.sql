-- Add new columns to cars table for detailed vehicle information
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50) DEFAULT 'Benzin';

-- Add comments to document the columns
COMMENT ON COLUMN cars.mileage IS 'Kilometerstand des Fahrzeugs';
COMMENT ON COLUMN cars.year IS 'Baujahr des Fahrzeugs';
COMMENT ON COLUMN cars.fuel_type IS 'Kraftstoffart: Benzin, Diesel, Elektro, Hybrid, etc.';

-- Update existing cars with default values if needed
UPDATE cars SET year = 2020 WHERE year IS NULL;
UPDATE cars SET fuel_type = 'Benzin' WHERE fuel_type IS NULL;

-- Create a function to check car availability for a date range
CREATE OR REPLACE FUNCTION check_car_availability(
  p_car_id UUID,
  p_pickup_date DATE,
  p_dropoff_date DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check if there are any overlapping bookings
  SELECT COUNT(*)
  INTO conflict_count
  FROM bookings
  WHERE car_id = p_car_id
    AND status IN ('pending', 'confirmed')
    AND (
      -- New booking starts during existing booking
      (p_pickup_date BETWEEN pickup_date AND dropoff_date)
      OR
      -- New booking ends during existing booking
      (p_dropoff_date BETWEEN pickup_date AND dropoff_date)
      OR
      -- New booking completely overlaps existing booking
      (p_pickup_date <= pickup_date AND p_dropoff_date >= dropoff_date)
    )
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_car_availability IS 'Prüft ob ein Fahrzeug für einen bestimmten Zeitraum verfügbar ist';
