-- Create extras table for managing additional services
CREATE TABLE IF NOT EXISTS extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_per_day DECIMAL(10, 2) NOT NULL,
  icon_name VARCHAR(100) DEFAULT 'Package',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default extras
INSERT INTO extras (name, description, price_per_day, icon_name, active) VALUES
  ('Zusätzlicher Fahrer', 'Berechtigung für einen weiteren Fahrer', 15.00, 'Users', true),
  ('Vollkasko-Versicherung', 'Kompletter Schutz ohne Selbstbeteiligung', 25.00, 'Shield', true),
  ('GPS-Navigation', 'Modernes Navigationsgerät', 8.00, 'Navigation', true),
  ('Kindersitz', 'Sicherer Kindersitz (bis 12 Jahre)', 10.00, 'Baby', true),
  ('Winterreifen', 'Premium-Winterreifen inklusive', 12.00, 'Briefcase', true),
  ('Ski-/Snowboard-Träger', 'Für Ihre Wintersportausrüstung', 15.00, 'Mountain', true);

-- Create index for active extras
CREATE INDEX IF NOT EXISTS idx_extras_active ON extras(active);
