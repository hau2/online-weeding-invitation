-- ================================================================
-- Phase 8 Admin Panel Migration
-- New tables, columns, and storage for admin features
-- ================================================================

-- ----------------------------------------------------------------
-- 1. system_settings table (key-value store for admin config)
-- No user-facing RLS policies -- service role only
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
-- No SELECT/UPDATE/DELETE policies -- only service role (bypasses RLS) accesses this table

-- Insert default configuration rows
INSERT INTO public.system_settings (key, value) VALUES
  ('payment_config', '{"bankQrUrl": null, "bankName": "", "bankAccountHolder": "", "pricePerInvitation": 50000}'::jsonb),
  ('watermark_config', '{"text": "ThiepCuoiOnline.vn", "opacity": 0.15}'::jsonb),
  ('expiry_config', '{"gracePeriodDays": 7}'::jsonb),
  ('upload_limits', '{"maxPhotoSizeMb": 5, "maxPhotosPerInvitation": 10, "maxPhotosPremium": 20}'::jsonb),
  ('theme_config', '{
    "traditional": {"name": "Truyen thong", "tag": "classic", "thumbnail": null, "isActive": true},
    "modern": {"name": "Hien dai", "tag": "modern", "thumbnail": null, "isActive": true},
    "minimalist": {"name": "Toi gian", "tag": "minimal", "thumbnail": null, "isActive": true}
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Reuse existing set_updated_at() trigger function from 001_foundation_schema.sql
CREATE TRIGGER system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------
-- 2. is_locked column on users (admin can lock/unlock accounts)
-- ----------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- ----------------------------------------------------------------
-- 3. is_disabled column on invitations (admin violation flag)
-- ----------------------------------------------------------------
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT false;

-- ----------------------------------------------------------------
-- 4. admin_notes column on invitations (admin notes for payments)
-- ----------------------------------------------------------------
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS admin_notes TEXT NOT NULL DEFAULT '';

-- ----------------------------------------------------------------
-- 5. usage_count on system_music_tracks
-- ----------------------------------------------------------------
ALTER TABLE public.system_music_tracks ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0;

-- ----------------------------------------------------------------
-- 6. system-settings storage bucket for admin assets
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
  VALUES ('system-settings', 'system-settings', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for system settings assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-settings');
