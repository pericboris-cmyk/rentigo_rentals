-- Add all major Swiss cities as rental locations for Rentigo Rentals

INSERT INTO locations (name, city, address) VALUES
  -- Major Cities
  ('Zürich Hauptbahnhof', 'Zürich', 'Bahnhofplatz 1, 8001 Zürich'),
  ('Zürich Flughafen', 'Zürich', 'Flughafenstrasse, 8058 Zürich'),
  ('Zürich City', 'Zürich', 'Löwenstrasse 15, 8001 Zürich'),
  
  ('Genève Aéroport', 'Genf', 'Route de l''Aéroport 21, 1215 Genf'),
  ('Genève Cornavin', 'Genf', 'Place de Cornavin, 1201 Genf'),
  ('Genève Centre', 'Genf', 'Rue du Mont-Blanc 12, 1201 Genf'),
  
  ('Basel SBB', 'Basel', 'Centralbahnplatz 1, 4051 Basel'),
  ('Basel Flughafen', 'Basel', 'Flughafen Basel-Mulhouse, 4056 Basel'),
  ('Basel Mitte', 'Basel', 'Freie Strasse 45, 4001 Basel'),
  
  ('Bern Hauptbahnhof', 'Bern', 'Bahnhofplatz 10a, 3011 Bern'),
  ('Bern Zentrum', 'Bern', 'Spitalgasse 4, 3011 Bern'),
  
  ('Lausanne Gare', 'Lausanne', 'Place de la Gare 9, 1003 Lausanne'),
  ('Lausanne Centre', 'Lausanne', 'Rue du Pont 1, 1003 Lausanne'),
  
  ('Luzern Bahnhof', 'Luzern', 'Bahnhofplatz 1, 6003 Luzern'),
  ('Luzern Altstadt', 'Luzern', 'Kapellplatz 1, 6004 Luzern'),
  
  ('St. Gallen Bahnhof', 'St. Gallen', 'Bahnhofplatz 1a, 9001 St. Gallen'),
  ('St. Gallen City', 'St. Gallen', 'Multergasse 24, 9000 St. Gallen'),
  
  ('Lugano Centro', 'Lugano', 'Via Nassa 15, 6900 Lugano'),
  ('Lugano Stazione', 'Lugano', 'Piazzale Stazione, 6900 Lugano'),
  
  ('Winterthur Bahnhof', 'Winterthur', 'Bahnhofplatz 14, 8400 Winterthur'),
  
  -- Additional Cities
  ('Biel/Bienne Gare', 'Biel/Bienne', 'Bahnhofplatz 4, 2502 Biel'),
  ('Thun Bahnhof', 'Thun', 'Bahnhofstrasse 1, 3600 Thun'),
  ('Köniz Zentrum', 'Köniz', 'Schwarzenburgstrasse 260, 3098 Köniz'),
  ('La Chaux-de-Fonds Gare', 'La Chaux-de-Fonds', 'Place de la Gare 4, 2300 La Chaux-de-Fonds'),
  ('Schaffhausen Bahnhof', 'Schaffhausen', 'Bahnhofstrasse 54, 8200 Schaffhausen'),
  ('Fribourg Gare', 'Freiburg', 'Place de la Gare 1, 1700 Freiburg'),
  ('Chur Bahnhof', 'Chur', 'Bahnhofplatz 1, 7000 Chur'),
  ('Vernier Centre', 'Vernier', 'Route de Meyrin 171, 1214 Vernier'),
  ('Neuchâtel Gare', 'Neuenburg', 'Place Pury, 2000 Neuenburg'),
  ('Uster Bahnhof', 'Uster', 'Bahnhofstrasse 22, 8610 Uster'),
  
  -- Tourist Destinations
  ('Interlaken Ost', 'Interlaken', 'Bahnhofstrasse 35, 3800 Interlaken'),
  ('Zermatt Bahnhof', 'Zermatt', 'Bahnhofplatz 9, 3920 Zermatt'),
  ('Davos Platz', 'Davos', 'Promenade 67, 7270 Davos Platz'),
  ('St. Moritz Bahnhof', 'St. Moritz', 'Via dal Bagn 11, 7500 St. Moritz'),
  ('Locarno Stazione', 'Locarno', 'Piazza Stazione, 6600 Locarno'),
  ('Montreux Gare', 'Montreux', 'Avenue des Alpes 23, 1820 Montreux'),
  ('Grindelwald Terminal', 'Grindelwald', 'Dorfstrasse 110, 3818 Grindelwald'),
  ('Engelberg Bahnhof', 'Engelberg', 'Bahnhofstrasse 1, 6390 Engelberg')
ON CONFLICT (name) DO NOTHING;
