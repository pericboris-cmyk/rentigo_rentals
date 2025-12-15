-- Tabelle für Website-Einstellungen erstellen
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(255) UNIQUE NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wartungsmodus-Einstellung einfügen (standardmäßig deaktiviert)
INSERT INTO public.site_settings (key, value)
VALUES ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- Index für schnelle Suche
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Erfolgreiche Erstellung anzeigen
SELECT 'Wartungsmodus-Tabelle erfolgreich erstellt!' as message;
