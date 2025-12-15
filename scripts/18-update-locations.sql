-- Update locations to only keep Basel Flughafen, Zürich Flughafen, Bern Hauptbahnhof, and Olten Bahnhof

-- Delete all existing locations
DELETE FROM locations;

-- Added Olten Bahnhof as the fourth location
-- Insert the four required locations
INSERT INTO locations (id, name, city, address, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Basel Flughafen', 'Basel', 'EuroAirport Basel-Mulhouse-Freiburg, CH-4030 Basel', NOW(), NOW()),
  (gen_random_uuid(), 'Zürich Flughafen', 'Zürich', 'Flughafen Zürich, CH-8058 Zürich', NOW(), NOW()),
  (gen_random_uuid(), 'Bern Hauptbahnhof', 'Bern', 'Bahnhofplatz 10A, 3011 Bern', NOW(), NOW()),
  (gen_random_uuid(), 'Olten Bahnhof', 'Olten', 'Bahnhofplatz 1, 4600 Olten', NOW(), NOW());
