-- Add plan and payment_status columns for monetization
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'none';
