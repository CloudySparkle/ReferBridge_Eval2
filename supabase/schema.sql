-- ============================================================================
-- REFERBRIDGE — UPDATED POSTGRESQL SCHEMA (Evaluation 2)
-- Run this in Supabase SQL Editor to apply new columns and seed data
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. HOSPITALS TABLE (updated with Eval-2 fields)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Private' CHECK (category IN ('Government', 'Private')),
    city TEXT NOT NULL CHECK (city IN ('Chandigarh', 'Mohali', 'Panchkula', 'Zirakpur')),
    district TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT,
    website TEXT,
    specialties TEXT[] DEFAULT '{}',
    total_beds INTEGER NOT NULL DEFAULT 0 CHECK (total_beds >= 0),
    available_beds INTEGER NOT NULL DEFAULT 0 CHECK (available_beds >= 0),
    icu_beds_available INTEGER NOT NULL DEFAULT 0 CHECK (icu_beds_available >= 0),
    emergency_services BOOLEAN NOT NULL DEFAULT false,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'unverified')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    data_source TEXT,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add missing columns to existing table if upgrading from Eval-1
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Private';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS emergency_services BOOLEAN DEFAULT false;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS data_source TEXT;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_hospitals_name ON public.hospitals (name);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON public.hospitals (city);
CREATE INDEX IF NOT EXISTS idx_hospitals_category ON public.hospitals (category);
CREATE INDEX IF NOT EXISTS idx_hospitals_active ON public.hospitals (is_active);

-- ----------------------------------------------------------------------------
-- 2. PROFILES TABLE
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
-- 5. TIMESTAMP TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_hospitals ON public.hospitals;
CREATE TRIGGER set_updated_at_hospitals BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_patients ON public.patients;
CREATE TRIGGER set_updated_at_patients BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_referrals ON public.referrals;
CREATE TRIGGER set_updated_at_referrals BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. AUTO PROFILE ON SIGNUP
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
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on active hospitals" ON public.hospitals;
CREATE POLICY "Allow public read on active hospitals" ON public.hospitals FOR SELECT USING (is_active = true AND city IN ('Chandigarh','Mohali','Panchkula','Zirakpur'));
DROP POLICY IF EXISTS "Allow authenticated staff to insert hospitals" ON public.hospitals;
CREATE POLICY "Allow authenticated staff to insert hospitals" ON public.hospitals FOR INSERT TO authenticated WITH CHECK (city IN ('Chandigarh','Mohali','Panchkula','Zirakpur'));
DROP POLICY IF EXISTS "Allow authenticated staff to update hospitals" ON public.hospitals;
CREATE POLICY "Allow authenticated staff to update hospitals" ON public.hospitals FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow users to view profiles" ON public.profiles;
CREATE POLICY "Allow users to view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated staff to view patients" ON public.patients;
CREATE POLICY "Allow authenticated staff to view patients" ON public.patients FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated staff to create patients" ON public.patients;
CREATE POLICY "Allow authenticated staff to create patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Allow authenticated staff to update patients" ON public.patients;
CREATE POLICY "Allow authenticated staff to update patients" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated staff to view referrals" ON public.referrals;
CREATE POLICY "Allow authenticated staff to view referrals" ON public.referrals FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated staff to create referrals" ON public.referrals;
CREATE POLICY "Allow authenticated staff to create referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Allow authenticated staff to update referrals" ON public.referrals;
CREATE POLICY "Allow authenticated staff to update referrals" ON public.referrals FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 8. SEED DATA — Real Verified Hospitals (Chandigarh Tricity Region)
-- ----------------------------------------------------------------------------
INSERT INTO public.hospitals (id, name, category, city, district, address, latitude, longitude, phone, website, specialties, total_beds, available_beds, icu_beds_available, emergency_services, verification_status, is_active, data_source, last_verified_at)
VALUES
  ('c1111111-1111-1111-1111-111111111111','PGIMER Chandigarh','Government','Chandigarh','Chandigarh UT','Sector 12, Chandigarh - 160012',30.7673,76.7770,'0172-2746018','https://pgimer.edu.in',ARRAY['Multi-Specialty','Trauma Center','Neurology','Cardiology','Oncology','Research'],1900,12,0,true,'verified',true,'pgimer.edu.in (official)','2025-01-01'),
  ('c2222222-2222-2222-2222-222222222222','GMCH Sector 32','Government','Chandigarh','Chandigarh UT','Sector 32-B, Chandigarh - 160047',30.7095,76.7725,'0172-2601023','https://gmch.gov.in',ARRAY['General Surgery','Emergency Medicine','Burn Unit','Orthopaedics'],900,45,2,true,'verified',true,'gmch.gov.in (official)','2025-01-01'),
  ('c3333333-3333-3333-3333-333333333333','Fortis Hospital Chandigarh','Private','Chandigarh','Chandigarh UT','Sector 62, Phase VIII, Mohali - 160062',30.7012,76.7342,'0172-4692222','https://fortishealthcare.com',ARRAY['Cardiology','Oncology','Neurosciences','Orthopaedics','Emergency Care'],262,24,6,true,'verified',true,'fortishealthcare.com (official)','2025-01-01'),
  ('c4444444-4444-4444-4444-444444444444','Civil Hospital Mohali','Government','Mohali','SAS Nagar','Phase 6, SAS Nagar, Mohali - 160055',30.7135,76.7160,'0172-2228010',null,ARRAY['General Medicine','Emergency','Maternity','Paediatrics'],200,18,2,true,'verified',true,'Punjab Health Dept','2025-01-01'),
  ('c5555555-5555-5555-5555-555555555555','Civil Hospital Panchkula','Government','Panchkula','Panchkula','Sector 6, Panchkula, Haryana - 134109',30.6956,76.8546,'0172-2560073',null,ARRAY['General Medicine','Emergency','Maternity','Paediatrics'],300,20,0,true,'verified',true,'Haryana Health Dept','2025-01-01'),
  ('c6666666-6666-6666-6666-666666666666','Lifeline Hospital Zirakpur','Private','Zirakpur','SAS Nagar','VIP Road, Zirakpur, Punjab - 140603',30.6425,76.8180,'+91 99150 99887',null,ARRAY['Trauma','Orthopaedics','Critical Care','General Surgery'],210,38,9,true,'verified',true,'Local Verification (2024)','2024-12-01'),
  ('c7777777-7777-7777-7777-777777777777','Max Super Speciality Hospital Chandigarh','Private','Chandigarh','Chandigarh UT','Industrial Area Ph-1, Chandigarh - 160002',30.7059,76.8037,'0172-6650000','https://maxhealthcare.in',ARRAY['Cardiology','Cancer Care','Neurology','Renal Sciences'],200,19,4,true,'verified',true,'maxhealthcare.in (official)','2025-01-01'),
  ('c8888888-8888-8888-8888-888888888888','Alchemist Hospital','Private','Mohali','SAS Nagar','Sector 21-A, SAS Nagar, Mohali - 160022',30.6980,76.7320,'0172-5095001','https://alchemisthospitals.com',ARRAY['Cardiology','Neurology','Vascular Surgery','Orthopaedics'],250,12,3,true,'verified',true,'alchemisthospitals.com (official)','2025-01-01'),
  ('c9999999-9999-9999-9999-999999999908','Alchemist Hospitals Panchkula','Private','Panchkula','Panchkula','Sector 21, Panchkula, Haryana - 134112',30.6865,76.8530,'+91 172-5095001','https://alchemisthospitals.com',ARRAY['Neurology','Cardiology','Stroke Center','ICU'],90,7,2,true,'verified',true,'alchemisthospitals.com (official)','2025-01-01'),
  ('c9999999-9999-9999-9999-999999999909','Paras Hospital Panchkula','Private','Panchkula','Panchkula','Sector 23-A, Panchkula, Haryana - 134112',30.6910,76.8600,'1800-1030-000','https://parashospitals.com',ARRAY['Emergency Care','Cardiology','Cancer Care','Neurosciences'],250,18,5,true,'verified',true,'parashospitals.com (official)','2025-01-01'),
  ('c9999999-9999-9999-9999-999999999912','Mukat Hospital Zirakpur','Private','Zirakpur','SAS Nagar','NH-22, Dhakoli, Zirakpur - 140603',30.6360,76.8120,'0172-4030000','https://mukathospital.com',ARRAY['Emergency','Trauma','Orthopaedics','Obstetrics'],175,25,4,true,'verified',true,'mukathospital.com (official)','2025-01-01'),
  ('c9999999-9999-9999-9999-999999999903','Ivy Hospital Mohali','Private','Mohali','SAS Nagar','Sector 71, Mohali - 160071',30.6936,76.7217,'0172-5200000','https://ivyhospitals.com',ARRAY['Cardiac Surgery','Neurosurgery','Orthopaedics','Urology'],200,15,5,true,'verified',true,'ivyhospitals.com (official)','2025-01-01')
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  city = EXCLUDED.city,
  district = EXCLUDED.district,
  website = EXCLUDED.website,
  emergency_services = EXCLUDED.emergency_services,
  verification_status = EXCLUDED.verification_status;

-- Seed Patients
INSERT INTO public.patients (id, patient_identifier, full_name, age, gender, contact_number, primary_condition, medical_history)
VALUES
  ('p1111111-1111-1111-1111-111111111111','PT-2291','Harpreet Singh',54,'Male','+91 98721 11001','Acute Myocardial Infarction','Hypertension, Type 2 Diabetes'),
  ('p2222222-2222-2222-2222-222222222222','PT-2292','Rajesh Sharma',29,'Male','+91 98144 22002','Compound Femur Fracture','No prior surgeries'),
  ('p3333333-3333-3333-3333-333333333333','PT-2293','Kamla Devi',67,'Female','+91 98881 33003','Suspected Ischemic Stroke','Atrial Fibrillation, Stent in 2021'),
  ('p4444444-4444-4444-4444-444444444444','PT-2294','Baby Ananya',8,'Female','+91 99151 44004','Severe Dehydration','Recent viral gastroenteritis'),
  ('p5555555-5555-5555-5555-555555555555','PT-2295','Manish Verma',41,'Male','+91 98555 55005','Acute Appendicitis','No known allergies')
ON CONFLICT (id) DO NOTHING;

-- Seed Referrals
INSERT INTO public.referrals (id, referral_code, patient_id, sending_hospital_id, receiving_hospital_id, referral_reason, urgency, clinical_notes, status)
VALUES
  ('r1111111-1111-1111-1111-111111111111','REQ-101','p1111111-1111-1111-1111-111111111111','c3333333-3333-3333-3333-333333333333','c1111111-1111-1111-1111-111111111111','Emergency Cath Lab transfer needed','Critical','STEMI on ECG. Nitroglycerin started.','Accepted'),
  ('r2222222-2222-2222-2222-222222222222','REQ-102','p2222222-2222-2222-2222-222222222222','c4444444-4444-4444-4444-444444444444','c2222222-2222-2222-2222-222222222222','Complex orthopedic trauma surgery','High','Stabilized with traction. ORIF required.','Rejected'),
  ('r3333333-3333-3333-3333-333333333333','REQ-103','p3333333-3333-3333-3333-333333333333','c5555555-5555-5555-5555-555555555555','c3333333-3333-3333-3333-333333333333','Stroke center evaluation & tPA','Critical','Onset 90 minutes ago. NIHSS 14.','Pending'),
  ('r4444444-4444-4444-4444-444444444444','REQ-104','p4444444-4444-4444-4444-444444444444','c6666666-6666-6666-6666-666666666666','c4444444-4444-4444-4444-444444444444','Pediatric ICU bed reservation','Moderate','Severe electrolyte imbalance.','Pending'),
  ('r5555555-5555-5555-5555-555555555555','REQ-105','p5555555-5555-5555-5555-555555555555','c7777777-7777-7777-7777-777777777777','c6666666-6666-6666-6666-666666666666','Emergency appendectomy transfer','High','Ultrasound confirmed appendicitis.','Pending')
ON CONFLICT (id) DO NOTHING;
