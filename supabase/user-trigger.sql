-- ================================================================
-- Run this in Supabase SQL Editor AFTER the main schema.sql
-- Project → SQL Editor → New query → paste → Run
-- ================================================================

-- 1. Auto-create public.users profile whenever a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Users: allow insert of own profile (catches users before trigger was set up)
DROP POLICY IF EXISTS "users_own_insert" ON public.users;
CREATE POLICY "users_own_insert" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Sellers: public read (needed so product listing pages can show seller name + tier)
DROP POLICY IF EXISTS "sellers_public_read" ON public.sellers;
CREATE POLICY "sellers_public_read" ON public.sellers
  FOR SELECT USING (TRUE);

-- 4. Sellers: authenticated user can create/update own seller profile
DROP POLICY IF EXISTS "sellers_own_insert" ON public.sellers;
CREATE POLICY "sellers_own_insert" ON public.sellers
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sellers_own_update" ON public.sellers;
CREATE POLICY "sellers_own_update" ON public.sellers
  FOR UPDATE USING (user_id = auth.uid());

-- 5. Buyers: own read + insert
DROP POLICY IF EXISTS "buyers_own_read" ON public.buyers;
CREATE POLICY "buyers_own_read" ON public.buyers
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "buyers_own_insert" ON public.buyers;
CREATE POLICY "buyers_own_insert" ON public.buyers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 6. Orders: buyer can insert
DROP POLICY IF EXISTS "orders_buyer_insert" ON public.orders;
CREATE POLICY "orders_buyer_insert" ON public.orders
  FOR INSERT WITH CHECK (
    buyer_id = (SELECT id FROM public.buyers WHERE user_id = auth.uid())
  );

-- 7. Proposals: public read; sellers can insert
DROP POLICY IF EXISTS "proposals_public_read" ON public.proposals;
CREATE POLICY "proposals_public_read" ON public.proposals
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "proposals_seller_insert" ON public.proposals;
CREATE POLICY "proposals_seller_insert" ON public.proposals
  FOR INSERT WITH CHECK (
    seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  );
