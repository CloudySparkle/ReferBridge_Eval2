-- ============================================================================
-- REFERBRIDGE — POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Evaluation 1–2 Database Migration for Supabase
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. HOSPITALS TABLE
-- Stores partner hospitals, bed capacity, ICU availability, and coordinates.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    specialties TEXT[] DEFAULT '{}',
    total_beds INTEGER NOT NULL DEFAULT 0 CHECK (total_beds >= 0),
    available_beds INTEGER NOT NULL DEFAULT 0 CHECK (available_beds >= 0 AND available_beds <= total_beds),
    icu_beds_available INTEGER NOT NULL DEFAULT 0 CHECK (icu_beds_available >= 0),
    is_verified BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for geo/coordinates and name search
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON public.hospitals (name);
CREATE INDEX IF NOT EXISTS idx_hospitals_active ON public.hospitals (is_active, is_verified);

-- ----------------------------------------------------------------------------
-- 2. PROFILES TABLE
-- Extends Supabase auth.users with hospital association, roles and approval status.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'hospital_staff' CHECK (role IN ('admin', 'hospital_staff', 'doctor', 'dispatcher')),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    account_approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (account_approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_hospital ON public.profiles (hospital_id);

-- ----------------------------------------------------------------------------
-- 3. PATIENTS TABLE
-- Stores minimal necessary patient details for referral management.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_identifier TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    age INTEGER CHECK (age >= 0 AND age <= 130),
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    contact_number TEXT,
    primary_condition TEXT NOT NULL,
    medical_history TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_patients_identifier ON public.patients (patient_identifier);

-- ----------------------------------------------------------------------------
-- 4. REFERRALS TABLE
-- Tracks inter-hospital patient transfers and lifecycle status.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_code TEXT NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    sending_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    receiving_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    referral_reason TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'High' CHECK (urgency IN ('Critical', 'High', 'Moderate', 'Low')),
    clinical_notes TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Draft', 'Submitted', 'Pending', 'Accepted', 'Rejected', 'Cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_referrals_patient ON public.referrals (patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals (status);
CREATE INDEX IF NOT EXISTS idx_referrals_hospitals ON public.referrals (sending_hospital_id, receiving_hospital_id);

-- ----------------------------------------------------------------------------
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_hospitals ON public.hospitals;
CREATE TRIGGER set_updated_at_hospitals
    BEFORE UPDATE ON public.hospitals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_patients ON public.patients;
CREATE TRIGGER set_updated_at_patients
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_referrals ON public.referrals;
CREATE TRIGGER set_updated_at_referrals
    BEFORE UPDATE ON public.referrals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. AUTOMATIC USER PROFILE CREATION ON SIGNUP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email, role, account_approval_status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'hospital_staff'),
        'approved'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Hospitals RLS:
-- Anyone authenticated can view active hospitals; Admins and authorized staff can insert/update.
CREATE POLICY "Allow public/auth read on active hospitals"
    ON public.hospitals FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow authenticated staff to insert hospitals"
    ON public.hospitals FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated staff to update hospitals"
    ON public.hospitals FOR UPDATE
    TO authenticated
    USING (true);

-- Profiles RLS:
-- Users can view all staff profiles in network; can update own profile.
CREATE POLICY "Allow users to view profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow users to update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Patients RLS:
-- Authenticated users can view and create patients.
CREATE POLICY "Allow authenticated staff to view patients"
    ON public.patients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated staff to create patients"
    ON public.patients FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated staff to update patients"
    ON public.patients FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- Referrals RLS:
-- Authenticated staff can view, create, and update referral statuses.
CREATE POLICY "Allow authenticated staff to view referrals"
    ON public.referrals FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated staff to create referrals"
    ON public.referrals FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated staff to update referrals"
    ON public.referrals FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 8. INITIAL SEED DATA (Realistic Punjab & Chandigarh Regional Network)
-- ----------------------------------------------------------------------------
INSERT INTO public.hospitals (id, name, address, latitude, longitude, phone, specialties, total_beds, available_beds, icu_beds_available, is_verified, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'PGIMER Chandigarh', 'Sector 12, Chandigarh, 160012', 30.7673, 76.7770, '0172-2746018', ARRAY['Multi-Specialty', 'Trauma', 'Research', 'Neurology'], 1900, 12, 0, true, true),
    ('c2222222-2222-2222-2222-222222222222', 'GMCH Sector 32', 'Sector 32-B, Chandigarh, 160047', 30.7095, 76.7725, '0172-2601023', ARRAY['General Surgery', 'Emergency', 'Burn Unit'], 900, 45, 2, true, true),
    ('c3333333-3333-3333-3333-333333333333', 'Lotus Care Hospital', 'Sector 22, Chandigarh, 160022', 30.7380, 76.7745, '+91 98141 12345', ARRAY['Cardiology', 'Orthopedics', 'Emergency Care'], 180, 24, 6, true, true),
    ('c4444444-4444-4444-4444-444444444444', 'Sunrise Multispecialty', 'Phase 7, Sector 61, Mohali, 160062', 30.7135, 76.7160, '+91 98722 54321', ARRAY['Pediatrics', 'Trauma', 'General Surgery'], 140, 8, 2, true, true),
    ('c5555555-5555-5555-5555-555555555555', 'Green Valley Hospital', 'Sector 11, Panchkula, 134109', 30.6865, 76.8530, '+91 98888 11223', ARRAY['Neurology', 'Cardiology', 'Stroke Center'], 90, 0, 0, true, true),
    ('c6666666-6666-6666-6666-666666666666', 'Riverside Hospital', 'Zirakpur Bypass, NH-22, 140603', 30.6425, 76.8180, '+91 99150 99887', ARRAY['Trauma', 'Orthopedics', 'Critical Care'], 210, 38, 9, true, true),
    ('c7777777-7777-7777-7777-777777777777', 'Om Research Centre', 'Sector 34, Chandigarh, 160022', 30.7225, 76.7680, '+91 98155 33445', ARRAY['Nephrology', 'Oncology', 'ICU'], 160, 19, 4, true, true),
    ('c8888888-8888-8888-8888-888888888888', 'Apex Medical Institute', 'Sector 62, Mohali, 160062', 30.6980, 76.7320, '+91 98760 00112', ARRAY['Cardiology', 'Neurology', 'Vascular Surgery'], 250, 12, 3, true, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Patients
INSERT INTO public.patients (id, patient_identifier, full_name, age, gender, contact_number, primary_condition, medical_history)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'PT-2291', 'Harpreet Singh', 54, 'Male', '+91 98721 11001', 'Acute Myocardial Infarction', 'Hypertension, Type 2 Diabetes'),
    ('p2222222-2222-2222-2222-222222222222', 'PT-2292', 'Rajesh Sharma', 29, 'Male', '+91 98144 22002', 'Compound Femur Fracture', 'No prior surgeries'),
    ('p3333333-3333-3333-3333-333333333333', 'PT-2293', 'Kamla Devi', 67, 'Female', '+91 98881 33003', 'Suspected Ischemic Stroke', 'Atrial Fibrillation, Stent in 2021'),
    ('p4444444-4444-4444-4444-444444444444', 'PT-2294', 'Baby Ananya', 8, 'Female', '+91 99151 44004', 'Severe Dehydration', 'Recent viral gastroenteritis'),
    ('p5555555-5555-5555-5555-555555555555', 'PT-2295', 'Manish Verma', 41, 'Male', '+91 98555 55005', 'Acute Appendicitis', 'No known allergies')
ON CONFLICT (id) DO NOTHING;

-- Seed Referrals
INSERT INTO public.referrals (id, referral_code, patient_id, sending_hospital_id, receiving_hospital_id, referral_reason, urgency, clinical_notes, status)
VALUES
    ('r1111111-1111-1111-1111-111111111111', 'REQ-101', 'p1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Emergency Cath Lab transfer needed', 'Critical', 'STEMI observed on ECG. Nitroglycerin started.', 'Accepted'),
    ('r2222222-2222-2222-2222-222222222222', 'REQ-102', 'p2222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Complex orthopedic trauma surgery', 'High', 'Stabilized with traction. Requires immediate ORIF.', 'Rejected'),
    ('r3333333-3333-3333-3333-333333333333', 'REQ-103', 'p3333333-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 'c3333333-3333-3333-3333-333333333333', 'Stroke center evaluation & tPA thrombolysis', 'Critical', 'Onset 90 minutes ago. NIHSS score 14.', 'Pending'),
    ('r4444444-4444-4444-4444-444444444444', 'REQ-104', 'p4444444-4444-4444-4444-444444444444', 'c6666666-6666-6666-6666-666666666666', 'c4444444-4444-4444-4444-444444444444', 'Pediatric ICU bed reservation', 'Moderate', 'Severe electrolyte imbalance. IV rehydration active.', 'Pending'),
    ('r5555555-5555-5555-5555-555555555555', 'REQ-105', 'p5555555-5555-5555-5555-555555555555', 'c7777777-7777-7777-7777-777777777777', 'c6666666-6666-6666-6666-666666666666', 'Surgical emergency appendectomy transfer', 'High', 'Ultrasound confirmed inflamed appendix.', 'Pending')
ON CONFLICT (id) DO NOTHING;
