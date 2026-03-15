-- Migration 004: Add venue map URL for Google Maps embed
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS venue_map_url TEXT NOT NULL DEFAULT '';
