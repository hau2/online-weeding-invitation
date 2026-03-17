-- Migration 014: Custom Themes
-- Adds custom_themes table for admin-created themes,
-- theme-assets storage bucket for background images,
-- and drops the template_id CHECK constraint for custom theme slugs.

-- ============================================================
-- 1. custom_themes table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.custom_themes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  base_theme           TEXT NOT NULL,
  config               JSONB NOT NULL DEFAULT '{}'::jsonb,
  background_image_url TEXT DEFAULT NULL,
  thumbnail_url        TEXT DEFAULT NULL,
  status               TEXT NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft', 'published', 'disabled')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.custom_themes ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policies -- service role only (same as system_settings)

CREATE INDEX idx_custom_themes_status ON public.custom_themes(status);
CREATE INDEX idx_custom_themes_slug ON public.custom_themes(slug);

-- Trigger for updated_at (reuse existing function from foundation migration)
CREATE TRIGGER custom_themes_updated_at
  BEFORE UPDATE ON public.custom_themes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 2. Storage bucket for theme background images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('theme-assets', 'theme-assets', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for theme assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'theme-assets');

-- ============================================================
-- 3. Drop template_id CHECK constraint
-- Custom themes have arbitrary slugs that cannot be part of
-- a fixed CHECK constraint.
-- ============================================================
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_template_id_check;
