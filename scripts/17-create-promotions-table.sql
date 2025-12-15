-- Create promotions table for special offers
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'christmas', 'summer', 'general'
    active BOOLEAN DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    car_name VARCHAR(255), -- specific car for the promotion (e.g., 'Twingo')
    pricing JSONB NOT NULL, -- flexible pricing structure
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active promotions
CREATE INDEX idx_promotions_active ON public.promotions(active);

-- Insert the Christmas promotion
INSERT INTO public.promotions (name, type, active, car_name, pricing, image_url) VALUES (
    'Weihnachtsangebot Twingo',
    'christmas',
    false,
    'Twingo',
    '{
        "daily": {"price": 20, "description": "pro Tag ohne Km Begrenzung"},
        "weekly": {"price": 120, "duration": 7, "description": "7 Tage ohne Km begrenzung"},
        "monthly": {"price": 450, "duration": 30, "description": "1 Monat Ohne Km Begrenzung"}
    }'::jsonb,
    '/christmas-promo.jpg'
);
