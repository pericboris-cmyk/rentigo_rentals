-- Enable Row Level Security on all public tables
-- This fixes Supabase Database Linter errors for RLS disabled in public schema

-- Enable RLS on bookings (already has policies)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cars (needs policies if not exists)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- Enable RLS on locations (needs policies if not exists)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on reviews (needs policies if not exists)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Enable RLS on extras (needs policies if not exists)
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;

-- Enable RLS on promotions (needs policies if not exists)
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on site_settings (needs policies if not exists)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('bookings', 'cars', 'locations', 'reviews', 'extras', 'promotions', 'site_settings')
ORDER BY tablename;
