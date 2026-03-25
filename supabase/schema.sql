-- =============================================================
-- Bexo B2B Marketplace — Supabase Schema
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- USERS (base auth profile, extends Supabase auth.users)
-- =============================================================
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- BUYERS (extended buyer profile)
-- =============================================================
CREATE TABLE public.buyers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name  TEXT,
  country       TEXT,
  total_orders  INT NOT NULL DEFAULT 0,
  total_spent   NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- SELLERS (extended seller profile with verification tier)
-- =============================================================
CREATE TABLE public.sellers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name     TEXT NOT NULL,
  business_type    TEXT CHECK (business_type IN ('manufacturer', 'distributor', 'wholesaler', 'trader')),
  country          TEXT,
  website          TEXT,
  tax_id           TEXT,
  tier             TEXT NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold')),
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  verification_at  TIMESTAMPTZ,
  total_orders     INT NOT NULL DEFAULT 0,
  total_revenue    NUMERIC(14,2) NOT NULL DEFAULT 0,
  avg_rating       NUMERIC(3,2) NOT NULL DEFAULT 0,
  response_time_h  NUMERIC(4,1),
  on_time_pct      NUMERIC(5,2),
  member_since     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- PRODUCTS
-- =============================================================
CREATE TABLE public.products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id      UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT NOT NULL,
  price          NUMERIC(12,2) NOT NULL,
  price_unit     TEXT NOT NULL DEFAULT 'unit',          -- e.g. 'kg', 'meter', 'panel'
  min_order_qty  INT NOT NULL DEFAULT 1,
  min_order_unit TEXT NOT NULL DEFAULT 'units',
  stock_qty      INT NOT NULL DEFAULT 0,
  location       TEXT,
  tags           TEXT[],
  specifications JSONB,                                 -- { "Belt Width": "600mm", ... }
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  is_flagged     BOOLEAN NOT NULL DEFAULT FALSE,
  avg_rating     NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count   INT NOT NULL DEFAULT 0,
  view_count     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_seller    ON public.products(seller_id);
CREATE INDEX idx_products_category  ON public.products(category);
CREATE INDEX idx_products_active    ON public.products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_flagged   ON public.products(is_flagged) WHERE is_flagged = TRUE;

-- Full-text search index
CREATE INDEX idx_products_fts ON public.products
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TABLE public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id        UUID NOT NULL REFERENCES public.buyers(id),
  seller_id       UUID NOT NULL REFERENCES public.sellers(id),
  product_id      UUID NOT NULL REFERENCES public.products(id),
  quantity        INT NOT NULL,
  unit_price      NUMERIC(12,2) NOT NULL,
  total_amount    NUMERIC(14,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  status          TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
  shipping_address JSONB,                               -- { "line1": "...", "city": "...", ... }
  notes           TEXT,
  confirmed_at    TIMESTAMPTZ,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer   ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller  ON public.orders(seller_id);
CREATE INDEX idx_orders_product ON public.orders(product_id);
CREATE INDEX idx_orders_status  ON public.orders(status);

-- =============================================================
-- REQUIREMENTS (buyer posts what they need)
-- =============================================================
CREATE TABLE public.requirements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id       UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  quantity_text  TEXT,
  budget_min     NUMERIC(14,2),
  budget_max     NUMERIC(14,2),
  budget_display TEXT,                                  -- e.g. "$50,000" or "$80,000/mo"
  deadline       DATE,
  location       TEXT,
  is_urgent      BOOLEAN NOT NULL DEFAULT FALSE,
  is_open        BOOLEAN NOT NULL DEFAULT TRUE,
  proposal_count INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requirements_buyer    ON public.requirements(buyer_id);
CREATE INDEX idx_requirements_category ON public.requirements(category);
CREATE INDEX idx_requirements_open     ON public.requirements(is_open) WHERE is_open = TRUE;

-- =============================================================
-- PROPOSALS (sellers respond to requirements)
-- =============================================================
CREATE TABLE public.proposals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id  UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
  seller_id       UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  message         TEXT NOT NULL,
  quoted_price    NUMERIC(14,2),
  lead_time_days  INT,
  is_accepted     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (requirement_id, seller_id)
);

CREATE INDEX idx_proposals_requirement ON public.proposals(requirement_id);
CREATE INDEX idx_proposals_seller      ON public.proposals(seller_id);

-- =============================================================
-- REVIEWS
-- =============================================================
CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id    UUID NOT NULL REFERENCES public.buyers(id),
  seller_id   UUID NOT NULL REFERENCES public.sellers(id),
  product_id  UUID NOT NULL REFERENCES public.products(id),
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_seller  ON public.reviews(seller_id);

-- =============================================================
-- CHAT MESSAGES
-- =============================================================
CREATE TABLE public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID NOT NULL REFERENCES public.users(id),
  receiver_id UUID NOT NULL REFERENCES public.users(id),
  order_id    UUID REFERENCES public.orders(id),           -- optional: linked to an order
  product_id  UUID REFERENCES public.products(id),         -- optional: about a product
  content     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sender   ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_receiver ON public.chat_messages(receiver_id);
CREATE INDEX idx_chat_order    ON public.chat_messages(order_id);

-- =============================================================
-- FRAUD REPORTS
-- =============================================================
CREATE TABLE public.fraud_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id  UUID NOT NULL REFERENCES public.users(id),
  product_id   UUID REFERENCES public.products(id),
  seller_id    UUID REFERENCES public.sellers(id),
  reason       TEXT NOT NULL CHECK (reason IN ('fake', 'price', 'scam', 'spam', 'other')),
  details      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by  UUID REFERENCES public.users(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fraud_product ON public.fraud_reports(product_id);
CREATE INDEX idx_fraud_seller  ON public.fraud_reports(seller_id);
CREATE INDEX idx_fraud_status  ON public.fraud_reports(status);

-- =============================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON public.users    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_sellers_updated_at  BEFORE UPDATE ON public.sellers  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at   BEFORE UPDATE ON public.orders   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Recalculate product avg_rating + review_count after a review is inserted
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.products
  SET avg_rating   = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM public.reviews WHERE product_id = NEW.product_id),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;

  UPDATE public.sellers
  SET avg_rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM public.reviews WHERE seller_id = NEW.seller_id)
  WHERE id = NEW.seller_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_product_rating
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- Increment requirement proposal count after a new proposal
CREATE OR REPLACE FUNCTION public.increment_proposal_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.requirements
  SET proposal_count = proposal_count + 1
  WHERE id = NEW.requirement_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_proposals
AFTER INSERT ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.increment_proposal_count();

-- Auto-flag product when a fraud report is submitted
CREATE OR REPLACE FUNCTION public.flag_product_on_report()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products SET is_flagged = TRUE WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_flag_product
AFTER INSERT ON public.fraud_reports
FOR EACH ROW EXECUTE FUNCTION public.flag_product_on_report();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports  ENABLE ROW LEVEL SECURITY;

-- Users: can read own row, admin reads all
CREATE POLICY "users_own_read"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_own_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Products: public read for active non-flagged; sellers manage their own
CREATE POLICY "products_public_read"   ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "products_seller_insert" ON public.products FOR INSERT WITH CHECK (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "products_seller_update" ON public.products FOR UPDATE USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "products_seller_delete" ON public.products FOR DELETE USING (
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- Orders: buyer or seller party can read
CREATE POLICY "orders_party_read" ON public.orders FOR SELECT USING (
  buyer_id  = (SELECT id FROM public.buyers  WHERE user_id = auth.uid()) OR
  seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);

-- Requirements: public read; buyers manage their own
CREATE POLICY "requirements_public_read"   ON public.requirements FOR SELECT USING (is_open = TRUE);
CREATE POLICY "requirements_buyer_insert"  ON public.requirements FOR INSERT WITH CHECK (
  buyer_id = (SELECT id FROM public.buyers WHERE user_id = auth.uid())
);

-- Reviews: public read; buyer who owns order can insert
CREATE POLICY "reviews_public_read"   ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_buyer_insert"  ON public.reviews FOR INSERT WITH CHECK (
  buyer_id = (SELECT id FROM public.buyers WHERE user_id = auth.uid())
);

-- Chat: participants only
CREATE POLICY "chat_participant_read"   ON public.chat_messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "chat_sender_insert" ON public.chat_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Fraud reports: authenticated users can insert; admin reads all
CREATE POLICY "fraud_auth_insert" ON public.fraud_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "fraud_reporter_read" ON public.fraud_reports FOR SELECT USING (reporter_id = auth.uid());
