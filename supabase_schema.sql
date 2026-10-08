-- ============================================================
-- VEHICLE RENTAL MANAGEMENT SYSTEM - SUPABASE POSTGRES SCHEMA
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 3. Vehicle Categories & Fleet Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_code TEXT UNIQUE,
    registration_no TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Car', 'Van', 'SUV', 'Motorbike', 'Three-Wheeler', 'Luxury Vehicle')),
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Hybrid', 'Electric')),
    transmission TEXT NOT NULL CHECK (transmission IN ('Automatic', 'Manual')),
    seats INTEGER NOT NULL DEFAULT 4,
    price_per_day NUMERIC(10, 2) NOT NULL,
    price_per_hour NUMERIC(10, 2) DEFAULT 0,
    security_deposit NUMERIC(10, 2) DEFAULT 20000,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'deactivated')),
    image_url TEXT NOT NULL,
    gallery_urls JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb, -- e.g. ["Bluetooth", "Backup Camera", "GPS", "Sunroof"]
    specs JSONB DEFAULT '{}'::jsonb, -- e.g. {"engine": "2.5L", "mileage": "18 km/l"}
    odometer_km INTEGER DEFAULT 15000,
    fuel_level_percent INTEGER DEFAULT 100,
    location TEXT DEFAULT 'Colombo Flagship Hub',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 1,
    base_price NUMERIC(10, 2) NOT NULL,
    insurance_fee NUMERIC(10, 2) DEFAULT 0,
    additional_charges NUMERIC(10, 2) DEFAULT 0,
    security_deposit NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partially_paid')),
    pickup_location TEXT NOT NULL DEFAULT 'Colombo Hub',
    return_location TEXT NOT NULL DEFAULT 'Colombo Hub',
    pickup_notes TEXT,
    return_notes TEXT,
    fuel_pickup_percent INTEGER,
    odometer_pickup_km INTEGER,
    fuel_return_percent INTEGER,
    odometer_return_km INTEGER,
    late_fee NUMERIC(10, 2) DEFAULT 0,
    damage_fee NUMERIC(10, 2) DEFAULT 0,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'LKR',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Credit Card', 'Debit Card', 'Bank Transfer', 'Cash at Pickup', 'Online Portal')),
    transaction_ref TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'booking' CHECK (type IN ('booking', 'payment', 'pickup_reminder', 'return_reminder', 'promo', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Automatic Profile Creation on Supabase Auth SignUp Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 11. Row Level Security Policies
-- Profiles: Anyone authenticated can read profiles; users can update own profile; admins can manage all
CREATE POLICY "Public profiles are readable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Vehicles: Everyone can view vehicles; admins can insert/update/delete
CREATE POLICY "Anyone can view available vehicles" ON public.vehicles
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicles" ON public.vehicles
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Bookings: Customers can read and create own bookings; Admins can manage all
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT TO authenticated USING (
        customer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Users can insert own bookings" ON public.bookings
    FOR INSERT TO authenticated WITH CHECK (
        customer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admins or owners can update bookings" ON public.bookings
    FOR UPDATE TO authenticated USING (
        customer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Payments: Customers view own; Admins manage all
CREATE POLICY "Users view own payments" ON public.payments
    FOR SELECT TO authenticated USING (
        customer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admins manage all payments" ON public.payments
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Reviews: Anyone can read approved reviews; logged in users can add
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
    FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());

-- Notifications: Users only read their own notifications
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- System Settings: Read by all, modified by admins
CREATE POLICY "Anyone can read system settings" ON public.system_settings
    FOR SELECT USING (true);
CREATE POLICY "Admins manage system settings" ON public.system_settings
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 12. Storage Buckets (Execute in Supabase Storage SQL editor or API)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public vehicle image access" ON storage.objects
    FOR SELECT USING (bucket_id = 'vehicle-images');
CREATE POLICY "Admin upload vehicle images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-images');

-- 13. System Settings Default Configuration
INSERT INTO public.system_settings (key, value, description) VALUES
('company_info', '{
    "name": "RentFlow Premium Rentals",
    "email": "support@rentflow.lk",
    "phone": "+94 11 234 5678",
    "address": "45 Galle Face Terrace, Colombo 03, Sri Lanka",
    "currency": "LKR",
    "currencySymbol": "Rs."
}'::jsonb, 'Company branding and contact credentials'),
('rental_policies', '{
    "min_rental_days": 1,
    "cancellation_grace_hours": 24,
    "security_deposit_default": 25000,
    "tax_percent": 2.5,
    "weekend_surcharge_percent": 10,
    "late_return_fee_per_hour": 1500
}'::jsonb, 'Operational rules and fee formulas')
ON CONFLICT (key) DO NOTHING;

-- 14. Seed Data: Realistic Fleet
INSERT INTO public.vehicles (
    vehicle_code, registration_no, brand, model, year, category, fuel_type, 
    transmission, seats, price_per_day, price_per_hour, security_deposit, 
    status, image_url, gallery_urls, features, specs, odometer_km, fuel_level_percent, location
) VALUES
(
    'VH001', 'CAB-1234', 'Toyota', 'Prius Hybrid', 2024, 'Car', 'Hybrid',
    'Automatic', 5, 8500.00, 1100.00, 20000.00, 'available',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1590362891988-f77804703130?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["Apple CarPlay", "Adaptive Cruise", "Lane Assist", "EV Eco Mode", "Reverse Cam"]'::jsonb,
    '{"engine": "1.8L Hybrid", "power": "121 HP", "consumption": "24 km/L", "bootCapacity": "502 L"}'::jsonb,
    18200, 95, 'Colombo Flagship Hub'
),
(
    'VH002', 'CBA-8899', 'Mercedes-Benz', 'C-Class AMG Line', 2023, 'Luxury Vehicle', 'Petrol',
    'Automatic', 5, 32000.00, 4200.00, 60000.00, 'available',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["Burmester Sound", "Panoramic Sunroof", "Heated Leather", "Head-Up Display", "360 Camera"]'::jsonb,
    '{"engine": "2.0L Turbo", "power": "255 HP", "consumption": "14 km/L", "acceleration": "5.9s (0-100)"}'::jsonb,
    11500, 100, 'Colombo Flagship Hub'
),
(
    'VH003', 'WP-KS-4501', 'Toyota', 'Land Cruiser Prado TX-L', 2024, 'SUV', 'Diesel',
    'Automatic', 7, 38000.00, 4800.00, 75000.00, 'available',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["Full-time 4WD", "Crawl Control", "7 Leather Seats", "Cool Box", "Dual Zone A/C"]'::jsonb,
    '{"engine": "2.8L D-4D Turbo", "power": "201 HP", "torque": "500 Nm", "clearance": "215 mm"}'::jsonb,
    8900, 80, 'Kandy Hill Station'
),
(
    'VH004', 'NC-PE-9022', 'Toyota', 'KDH HiAce Luxury Van', 2022, 'Van', 'Diesel',
    'Manual', 14, 18500.00, 2400.00, 30000.00, 'available',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["High Roof", "Individual Line A/C", "Adjustable Reclining Seats", "Tour Sound System"]'::jsonb,
    '{"engine": "3.0L Intercooled", "capacity": "14 Passengers", "luggage": "8 Large Bags"}'::jsonb,
    34200, 90, 'Colombo Flagship Hub'
),
(
    'VH005', 'SP-BI-3344', 'Yamaha', 'MT-09 Hyper Naked', 2023, 'Motorbike', 'Petrol',
    'Manual', 2, 9500.00, 1300.00, 25000.00, 'available',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["Quick Shifter", "TFT Dash", "Traction Control", "ABS Cornering", "Akrapovic Exhaust"]'::jsonb,
    '{"engine": "890cc Triple", "power": "117 HP", "weight": "189 kg"}'::jsonb,
    6400, 100, 'Galle Coastal Hub'
),
(
    'VH006', 'WP-AAJ-7711', 'Bajaj', 'RE 4-Stroke Tourist Edition', 2023, 'Three-Wheeler', 'Petrol',
    'Manual', 3, 4200.00, 600.00, 10000.00, 'available',
    'https://images.unsplash.com/photo-1588636142475-a62d56692870?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1588636142475-a62d56692870?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["Luggage Rack", "Rain Curtains", "Phone Charger", "Digital Meter", "Spare Wheel"]'::jsonb,
    '{"engine": "199cc DTS-i", "mileage": "32 km/L", "seats": "3 Passengers"}'::jsonb,
    14800, 100, 'Colombo Flagship Hub'
),
(
    'VH007', 'WP-CAE-5522', 'Honda', 'Vezel e:HEV Z', 2023, 'SUV', 'Hybrid',
    'Automatic', 5, 12500.00, 1600.00, 25000.00, 'available',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["Honda SENSING", "Magic Seats", "Handsfree Tailgate", "Panoramic Glass", "Wireless Charging"]'::jsonb,
    '{"engine": "1.5L e:HEV", "power": "131 HP", "consumption": "22 km/L"}'::jsonb,
    12400, 85, 'Colombo Flagship Hub'
),
(
    'VH008', 'WP-CBD-9102', 'BMW', '7 Series 740Li M-Sport', 2024, 'Luxury Vehicle', 'Petrol',
    'Automatic', 4, 65000.00, 8500.00, 150000.00, 'available',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    '["BMW Theatre Screen 31.3 inch", "Executive Lounge Seating", "Bowers & Wilkins 4D Diamond", "Swarovski Crystal Lights"]'::jsonb,
    '{"engine": "3.0L TwinPower Turbo 6-Cyl", "power": "375 HP", "acceleration": "5.4s (0-100)"}'::jsonb,
    4200, 100, 'Colombo Flagship Hub'
)
ON CONFLICT (registration_no) DO NOTHING;
