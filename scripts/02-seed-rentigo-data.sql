-- Insert Locations
INSERT INTO locations (name, city, address) VALUES
  ('Berlin Airport', 'Berlin', 'Flughafenstraße 1, 12521 Berlin'),
  ('Munich Center', 'Munich', 'Marienplatz 1, 80331 München'),
  ('Hamburg Port', 'Hamburg', 'Hafenstraße 1, 20457 Hamburg'),
  ('Frankfurt Station', 'Frankfurt', 'Bahnhofplatz 1, 60311 Frankfurt')
ON CONFLICT (name) DO NOTHING;

-- Insert Cars
INSERT INTO cars (name, model, price_per_day, image_url, seats, transmission, available) VALUES
  ('Economy', 'Compact Car', 49.99, '/placeholder.svg?height=300&width=400', 5, 'Automatic', TRUE),
  ('Comfort', 'Mid-size Sedan', 79.99, '/placeholder.svg?height=300&width=400', 5, 'Automatic', TRUE),
  ('Premium', 'Luxury Sedan', 129.99, '/placeholder.svg?height=300&width=400', 5, 'Automatic', TRUE),
  ('SUV', '7-Seater SUV', 99.99, '/placeholder.svg?height=300&width=400', 7, 'Automatic', TRUE)
ON CONFLICT DO NOTHING;

-- Insert Sample Bookings
INSERT INTO bookings (first_name, last_name, email, phone, pickup_location_id, dropoff_location_id, car_id, pickup_date, dropoff_date, total_price, status) 
SELECT 
  'Max', 'Müller', 'max@example.com', '+49123456789',
  (SELECT id FROM locations WHERE name = 'Berlin Airport' LIMIT 1),
  (SELECT id FROM locations WHERE name = 'Munich Center' LIMIT 1),
  (SELECT id FROM cars WHERE name = 'Economy' LIMIT 1),
  CURRENT_DATE + INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '10 days',
  299.95,
  'confirmed'
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE email = 'max@example.com');

INSERT INTO bookings (first_name, last_name, email, phone, pickup_location_id, dropoff_location_id, car_id, pickup_date, dropoff_date, total_price, status)
SELECT
  'Sarah', 'Schmidt', 'sarah@example.com', '+49987654321',
  (SELECT id FROM locations WHERE name = 'Munich Center' LIMIT 1),
  (SELECT id FROM locations WHERE name = 'Hamburg Port' LIMIT 1),
  (SELECT id FROM cars WHERE name = 'Premium' LIMIT 1),
  CURRENT_DATE + INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '7 days',
  519.96,
  'completed'
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE email = 'sarah@example.com');

-- Insert Sample Reviews
INSERT INTO reviews (booking_id, rating, comment)
SELECT id, 5, 'Excellent service and clean car!'
FROM bookings WHERE email = 'sarah@example.com'
LIMIT 1;
