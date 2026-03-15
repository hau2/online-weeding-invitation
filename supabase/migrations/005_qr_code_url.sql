-- Add qr_code_url column for storing generated QR code image URL
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT DEFAULT NULL;
