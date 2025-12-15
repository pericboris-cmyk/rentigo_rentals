-- Entfernt alle nicht-schweizerischen Standorte und fügt nur Schweizer Standorte hinzu

-- Lösche alle bestehenden Locations
DELETE FROM locations;

-- Füge nur Schweizer Standorte hinzu
INSERT INTO locations (name, city, address) VALUES
  ('Zürich Flughafen', 'Zürich', 'Flughafenstrasse 1, 8058 Zürich'),
  ('Zürich Hauptbahnhof', 'Zürich', 'Bahnhofplatz 15, 8001 Zürich'),
  ('Bern Hauptbahnhof', 'Bern', 'Bahnhofplatz 10A, 3011 Bern'),
  ('Basel Flughafen', 'Basel', 'Flughafen Basel-Mulhouse, 4030 Basel'),
  ('Basel Bahnhof SBB', 'Basel', 'Centralbahnplatz 1, 4051 Basel'),
  ('Genf Flughafen', 'Genf', 'Route de l''Aéroport 21, 1215 Genf'),
  ('Genf Hauptbahnhof', 'Genf', 'Place de Cornavin, 1201 Genf'),
  ('Luzern Hauptbahnhof', 'Luzern', 'Bahnhofplatz, 6003 Luzern'),
  ('Lugano Stadtzentrum', 'Lugano', 'Via Pretorio 15, 6900 Lugano'),
  ('St. Gallen Hauptbahnhof', 'St. Gallen', 'Bahnhofplatz 1a, 9001 St. Gallen'),
  ('Winterthur Hauptbahnhof', 'Winterthur', 'Bahnhofplatz 14, 8400 Winterthur'),
  ('Lausanne Gare CFF', 'Lausanne', 'Place de la Gare 9, 1003 Lausanne')
ON CONFLICT (name) DO UPDATE SET
  city = EXCLUDED.city,
  address = EXCLUDED.address;
