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

-- ── public.users: add onboarding_step for resume support ────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT;

-- ── Ensure uploads storage bucket exists ─────────────────────
-- Run this in the Supabase dashboard Storage settings if the
-- 'uploads' bucket does not already exist, or via:
-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('uploads', 'uploads', true)
--   ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Search Logs Table
-- =============================================================
CREATE TABLE IF NOT EXISTS public.search_logs (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  search_query TEXT NOT NULL,
  result_count INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS search_logs_user_id_idx    ON public.search_logs (user_id);
CREATE INDEX IF NOT EXISTS search_logs_created_at_idx ON public.search_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS search_logs_query_idx      ON public.search_logs USING gin (to_tsvector('english', search_query));

-- RLS: allow any user (including anon) to insert their own searches
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can insert search logs"
  ON public.search_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can view their own search logs"
  ON public.search_logs FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
