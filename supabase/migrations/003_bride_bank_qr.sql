-- Migration 003: Add bride-side bank QR fields
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS bride_bank_qr_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bride_bank_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bride_bank_account_holder TEXT NOT NULL DEFAULT '';
