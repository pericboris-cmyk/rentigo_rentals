-- Update foreign key constraints to allow car deletion
-- This will set car_id to NULL when a car is deleted instead of preventing deletion

ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_car_id_fkey;

ALTER TABLE bookings
ADD CONSTRAINT bookings_car_id_fkey 
FOREIGN KEY (car_id) 
REFERENCES cars(id) 
ON DELETE SET NULL;

-- Similarly update location foreign keys to be more flexible
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_pickup_location_id_fkey;

ALTER TABLE bookings
ADD CONSTRAINT bookings_pickup_location_id_fkey 
FOREIGN KEY (pickup_location_id) 
REFERENCES locations(id) 
ON DELETE SET NULL;

ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_dropoff_location_id_fkey;

ALTER TABLE bookings
ADD CONSTRAINT bookings_dropoff_location_id_fkey 
FOREIGN KEY (dropoff_location_id) 
REFERENCES locations(id) 
ON DELETE SET NULL;
