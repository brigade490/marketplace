-- =============================================================
-- Bexo B2B Marketplace — Schema Additions
-- Run this after the initial schema.sql
-- =============================================================

-- Add extra profile fields to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS city         TEXT,
  ADD COLUMN IF NOT EXISTS state        TEXT,
  ADD COLUMN IF NOT EXISTS pincode      TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS gst_number   TEXT;

-- Add images array to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- =============================================================
-- WISHLIST
-- =============================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_own_read"   ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_own_insert" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_own_delete" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- =============================================================
-- ADDRESSES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  street      TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses_own_read"   ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_insert" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_own_update" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_delete" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================
-- NOTIFICATIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'info',   -- 'order', 'message', 'payment', 'info'
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own_read"   ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_insert" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- PAYMENT METHODS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('upi', 'bank')),
  details     JSONB NOT NULL,   -- { upi_id: "..." } or { account_no, ifsc, bank_name, account_name }
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_methods_own_read"   ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payment_methods_own_insert" ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payment_methods_own_update" ON public.payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "payment_methods_own_delete" ON public.payment_methods FOR DELETE USING (auth.uid() = user_id);

-- =============================================================
-- USER SETTINGS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id             UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email_notifs        BOOLEAN NOT NULL DEFAULT TRUE,
  sms_notifs          BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifs         BOOLEAN NOT NULL DEFAULT TRUE,
  language            TEXT NOT NULL DEFAULT 'en',
  currency            TEXT NOT NULL DEFAULT 'INR',
  profile_visible     BOOLEAN NOT NULL DEFAULT TRUE,
  contact_visible     BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_own_read"   ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_own_upsert" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_own_update" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================
-- VERIFICATION DOCUMENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doc_type    TEXT NOT NULL CHECK (doc_type IN ('gst', 'business')),
  file_url    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note        TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE (user_id, doc_type)
);

CREATE INDEX IF NOT EXISTS idx_verification_user ON public.verification_documents(user_id);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_own_read"   ON public.verification_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "verification_own_insert" ON public.verification_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "verification_own_update" ON public.verification_documents FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================
-- SUPPORT TICKETS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_user ON public.support_tickets(user_id);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_own_read"   ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "support_own_insert" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_support_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Update role check to allow seller+buyer combined role
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check CHECK (role IN ('buyer', 'seller', 'seller+buyer', 'admin'));

-- Policy for buyers table: allow own read
DROP POLICY IF EXISTS "buyers_own_read" ON public.buyers;
CREATE POLICY "buyers_own_read" ON public.buyers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "buyers_own_update" ON public.buyers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "buyers_own_insert" ON public.buyers FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy for sellers table: allow public read of seller profile
DROP POLICY IF EXISTS "sellers_public_read" ON public.sellers;
CREATE POLICY "sellers_public_read" ON public.sellers FOR SELECT USING (TRUE);
CREATE POLICY "sellers_own_insert" ON public.sellers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sellers_own_update" ON public.sellers FOR UPDATE USING (user_id = auth.uid());

-- Allow order insert by buyers
CREATE POLICY "orders_buyer_insert" ON public.orders FOR INSERT WITH CHECK (
  buyer_id = (SELECT id FROM public.buyers WHERE user_id = auth.uid())
);

-- Allow order status update by seller
CREATE POLICY "orders_seller_update" ON public.orders FOR UPDATE USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- Allow requirements update by buyer
CREATE POLICY "requirements_buyer_update" ON public.requirements FOR UPDATE USING (
  buyer_id = (SELECT id FROM public.buyers WHERE user_id = auth.uid())
);

-- Allow requirements delete by buyer
CREATE POLICY "requirements_buyer_delete" ON public.requirements FOR DELETE USING (
  buyer_id = (SELECT id FROM public.buyers WHERE user_id = auth.uid())
);

-- Proposals: sellers can insert, both parties can read
CREATE POLICY "proposals_public_read" ON public.proposals FOR SELECT USING (TRUE);
CREATE POLICY "proposals_seller_insert" ON public.proposals FOR INSERT WITH CHECK (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
