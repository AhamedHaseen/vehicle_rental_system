-- ============================================================
-- VEHICLE RENTAL MANAGEMENT SYSTEM - SUPABASE POSTGRES SCHEMA
-- Clean Real Database (No Mock Data)
-- ============================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url TEXT,
    driving_license_no TEXT,
    id_card_no TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table (Car, Bus, SUV, Van, etc.)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon_name TEXT DEFAULT 'Car',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pickup & Drop Locations / Hubs Table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'both' CHECK (type IN ('pickup', 'drop', 'both')),
    contact_number TEXT,
    operating_hours TEXT DEFAULT '24/7 Service',
    is_active BOOLEAN DEFAULT TRUE,
    extra_fee NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Vehicles Fleet Table (Includes primary image + 3 gallery images in gallery_urls)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_code TEXT UNIQUE,
    registration_no TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT NOT NULL,
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Hybrid', 'Electric')),
    transmission TEXT NOT NULL CHECK (transmission IN ('Automatic', 'Manual')),
    seats INTEGER NOT NULL DEFAULT 4,
    price_per_day NUMERIC(10, 2) NOT NULL,
    price_per_hour NUMERIC(10, 2) DEFAULT 0,
    security_deposit NUMERIC(10, 2) DEFAULT 20000,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'deactivated')),
    image_url TEXT NOT NULL,
    gallery_urls JSONB DEFAULT '[]'::jsonb, -- Array of 3 image URLs
    features JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    odometer_km INTEGER DEFAULT 15000,
    fuel_level_percent INTEGER DEFAULT 100,
    location TEXT DEFAULT 'Colombo Flagship Hub (Galle Face)',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    vehicle_name TEXT,
    vehicle_registration TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 1,
    base_price NUMERIC(10, 2) NOT NULL,
    insurance_fee NUMERIC(10, 2) DEFAULT 0,
    security_deposit NUMERIC(10, 2) DEFAULT 0,
    advance_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partially_paid')),
    pickup_location TEXT NOT NULL,
    return_location TEXT NOT NULL,
    with_driver BOOLEAN DEFAULT FALSE,
    pickup_notes TEXT,
    return_notes TEXT,
    fuel_pickup_percent INTEGER,
    fuel_return_percent INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Cash Details & Advance Payment Transactions Table
CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    booking_code TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    advance_amount NUMERIC(10, 2) DEFAULT 0,
    cash_paid NUMERIC(10, 2) DEFAULT 0,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'advance', 'done')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Contact Inquiries Table (From Customer Contact Form)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Row Level Security (RLS) - Permissive Policies for Web Application
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow full access for anon & authenticated roles so frontend operations run smoothly
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
    CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "categories_all" ON public.categories;
    CREATE POLICY "categories_all" ON public.categories FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "locations_all" ON public.locations;
    CREATE POLICY "locations_all" ON public.locations FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "vehicles_all" ON public.vehicles;
    CREATE POLICY "vehicles_all" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "bookings_all" ON public.bookings;
    CREATE POLICY "bookings_all" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "cash_transactions_all" ON public.cash_transactions;
    CREATE POLICY "cash_transactions_all" ON public.cash_transactions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "contacts_all" ON public.contacts;
    CREATE POLICY "contacts_all" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "reviews_all" ON public.reviews;
    CREATE POLICY "reviews_all" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "system_settings_all" ON public.system_settings;
    CREATE POLICY "system_settings_all" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 12. Initial Essential Categories (No fake vehicles/bookings)
INSERT INTO public.categories (name, icon_name, description) VALUES
('Car', 'Car', 'Sedans, premium compacts and economy passenger cars'),
('Bus', 'Bus', 'Luxury coaches, school buses and tour buses'),
('SUV', 'Shield', 'High ground clearance 4x4 and AWD all-terrain SUVs'),
('Van', 'Clock', 'Spacious passenger touring and multi-seat vans'),
('Luxury Vehicle', 'Sparkles', 'Executive VIP flagships and chauffeur sedans'),
('Motorbike', 'Gauge', 'Sport bikes, cruisers and hyper naked motorcycles'),
('Three-Wheeler', 'MapPin', 'Traditional passenger auto-rickshaws and tuk-tuks')
ON CONFLICT (name) DO NOTHING;

-- 13. Initial Real Islandwide Hub Locations (Admin can add / update / delete)
INSERT INTO public.locations (name, code, address, city, type, contact_number, operating_hours) VALUES
('Colombo Flagship Hub (Galle Face)', 'CMB-01', '45 Galle Face Terrace, Colombo 03', 'Colombo', 'both', '+94 11 234 5678', '24/7 Service'),
('Bandaranaike Int Airport (BIA / CMB)', 'BIA-02', 'Arrivals Terminal Bay 4, Katunayake', 'Katunayake', 'both', '+94 11 987 6543', '24/7 Flight Sync'),
('Kandy Hill Station Terminal', 'KDY-03', '12 William Gopallawa Mawatha, Kandy', 'Kandy', 'both', '+94 81 222 3344', '06:00 AM - 10:00 PM'),
('Galle Coastal Hub (Fort)', 'GAL-04', '88 Rampart Street, Galle Fort', 'Galle', 'both', '+94 91 333 4455', '07:00 AM - 09:00 PM')
ON CONFLICT (name) DO NOTHING;
