-- =============================================================
-- Schema Updates for Onboarding Data Persistence
-- Run these against your Supabase project via the SQL editor
-- =============================================================

-- ── public.users: add onboarding + location fields ──────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS city      TEXT,
  ADD COLUMN IF NOT EXISTS state     TEXT,
  ADD COLUMN IF NOT EXISTS pincode   TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS gst_number    TEXT;

-- ── public.buyers: add all profile fields ───────────────────
ALTER TABLE public.buyers
  ADD COLUMN IF NOT EXISTS business_type   TEXT,
  ADD COLUMN IF NOT EXISTS categories      TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS city            TEXT,
  ADD COLUMN IF NOT EXISTS state           TEXT,
  ADD COLUMN IF NOT EXISTS pincode         TEXT,
  ADD COLUMN IF NOT EXISTS preferences     JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_methods JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notifications   JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS logo_url        TEXT;

-- ── public.sellers: add all profile fields ──────────────────
ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS categories           TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS city                 TEXT,
  ADD COLUMN IF NOT EXISTS state                TEXT,
  ADD COLUMN IF NOT EXISTS pincode              TEXT,
  ADD COLUMN IF NOT EXISTS gstin                TEXT,
  ADD COLUMN IF NOT EXISTS gst_certificate_url  TEXT,
  ADD COLUMN IF NOT EXISTS business_proof_url   TEXT,
  ADD COLUMN IF NOT EXISTS preferences          JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bank_details         JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notifications        JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS logo_url             TEXT;

-- ── Relax sellers.company_name NOT NULL (onboarding sets it) ─
ALTER TABLE public.sellers ALTER COLUMN company_name DROP NOT NULL;

-- ── Ensure uploads storage bucket exists ─────────────────────
-- Run this in the Supabase dashboard Storage settings if the
-- 'uploads' bucket does not already exist, or via:
-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('uploads', 'uploads', true)
--   ON CONFLICT (id) DO NOTHING;
