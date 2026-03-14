-- ================================================================
-- Phase 1 Foundation Schema
-- Wedding Invitation Platform (Thiệp Cưới Online)
-- ================================================================

-- ----------------------------------------------------------------
-- users table
-- Custom auth table (NOT auth.users — we use custom NestJS auth)
-- NestJS signs JWTs with sub = users.id, role = 'authenticated'
-- Supabase RLS evaluates auth.uid() = sub from that JWT
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- User reads own non-deleted record
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING ((SELECT auth.uid()) = id AND deleted_at IS NULL);

-- User updates own non-deleted record
-- USING: row must be visible to be updated
-- WITH CHECK: ensures sub claim cannot change user_id after update
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- ----------------------------------------------------------------
-- invitations table (shell — full columns added in Phase 3)
-- user_id FK to public.users (not auth.users)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug                TEXT DEFAULT NULL,
  status              TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'published', 'save_the_date', 'expired')),
  template_id         TEXT NOT NULL DEFAULT 'traditional'
                        CHECK (template_id IN ('traditional', 'modern', 'minimalist')),
  groom_name          TEXT NOT NULL DEFAULT '',
  bride_name          TEXT NOT NULL DEFAULT '',
  wedding_date        DATE DEFAULT NULL,
  wedding_time        TIME DEFAULT NULL,
  venue_name          TEXT NOT NULL DEFAULT '',
  venue_address       TEXT NOT NULL DEFAULT '',
  invitation_message  TEXT NOT NULL DEFAULT '',
  thank_you_text      TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ DEFAULT NULL
);

-- Slug is unique only when set (partial unique index)
-- This is the DB-level slug immutability enforcement
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_slug_unique
  ON public.invitations(slug)
  WHERE slug IS NOT NULL;

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- User selects their own non-deleted invitations only
CREATE POLICY "invitations_select_own" ON public.invitations
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

-- User inserts invitation for themselves only
CREATE POLICY "invitations_insert_own" ON public.invitations
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- User updates their own non-deleted invitation
CREATE POLICY "invitations_update_own" ON public.invitations
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Soft delete: user can mark their own invitation deleted
-- (NestJS sets deleted_at = NOW() instead of hard DELETE)
CREATE POLICY "invitations_delete_own" ON public.invitations
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_deleted_at ON public.invitations(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- ----------------------------------------------------------------
-- password_reset_tokens table
-- No user-facing RLS policies — NestJS uses service role for all token ops
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- No SELECT/UPDATE/DELETE policies — only service role (bypasses RLS) accesses this table

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
  ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash
  ON public.password_reset_tokens(token_hash);

-- ----------------------------------------------------------------
-- Trigger: auto-update updated_at on users and invitations
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
