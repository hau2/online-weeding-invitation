-- ----------------------------------------------------------------
-- Migration 002: Media columns, system music tracks, storage buckets
-- ----------------------------------------------------------------

-- 1. Add media columns to invitations table
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS music_track_id UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_qr_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT NOT NULL DEFAULT '';

-- 2. Create system_music_tracks table
CREATE TABLE IF NOT EXISTS public.system_music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS on system_music_tracks
ALTER TABLE public.system_music_tracks ENABLE ROW LEVEL SECURITY;

-- 4. RLS policy: anyone can read active tracks (public page needs this)
CREATE POLICY "Anyone can read active music tracks"
  ON public.system_music_tracks
  FOR SELECT
  USING (is_active = true);

-- 5. FK constraint: invitations.music_track_id -> system_music_tracks.id
ALTER TABLE public.invitations
  ADD CONSTRAINT fk_invitations_music_track
  FOREIGN KEY (music_track_id)
  REFERENCES public.system_music_tracks(id)
  ON DELETE SET NULL;

-- 6. updated_at trigger on system_music_tracks (reuse existing function)
CREATE TRIGGER system_music_tracks_updated_at
  BEFORE UPDATE ON public.system_music_tracks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------
-- Storage buckets (public = true for serving via getPublicUrl)
-- ----------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation-photos', 'invitation-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-qr', 'bank-qr', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('system-music', 'system-music', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Storage RLS policies: public SELECT on all 3 buckets
-- Service role handles writes via NestJS (no user-facing INSERT/UPDATE)
-- ----------------------------------------------------------------

CREATE POLICY "Public read access for invitation photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invitation-photos');

CREATE POLICY "Public read access for bank QR images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bank-qr');

CREATE POLICY "Public read access for system music"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-music');
