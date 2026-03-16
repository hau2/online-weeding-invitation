-- Add bank account number fields for copy-to-clipboard on public page
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS bank_account_number text NOT NULL DEFAULT '';
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS bride_bank_account_number text NOT NULL DEFAULT '';
