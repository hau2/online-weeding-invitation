-- Migration: Dual-family ceremony info + love story
-- Replaces single ceremony fields with per-family fields (groom side + bride side)
-- and adds a love story timeline JSONB column.

-- 1. Add per-family columns for groom side
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS groom_father TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS groom_mother TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS groom_ceremony_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS groom_ceremony_time TIME DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS groom_venue_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS groom_venue_address TEXT NOT NULL DEFAULT '';

-- 2. Add per-family columns for bride side
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS bride_father TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bride_mother TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bride_ceremony_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bride_ceremony_time TIME DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bride_venue_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bride_venue_address TEXT NOT NULL DEFAULT '';

-- 3. Add love story timeline column (array of milestone objects)
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS love_story JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 4. Migrate existing data: copy old single ceremony fields to groom side
UPDATE public.invitations
SET
  groom_ceremony_date = wedding_date,
  groom_ceremony_time = wedding_time,
  groom_venue_name = venue_name,
  groom_venue_address = venue_address
WHERE wedding_date IS NOT NULL
   OR venue_name != '';

-- 5. Drop old single ceremony columns (replaced by per-family fields)
-- NOTE: venue_map_url is intentionally kept (shared field, per user decision)
ALTER TABLE public.invitations
  DROP COLUMN IF EXISTS wedding_date,
  DROP COLUMN IF EXISTS wedding_time,
  DROP COLUMN IF EXISTS venue_name,
  DROP COLUMN IF EXISTS venue_address;
