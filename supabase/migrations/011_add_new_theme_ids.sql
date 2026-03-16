-- Add new theme IDs to template_id check constraint
-- Phase 9.1: Public Page Redesign - 6 new themes + 3 legacy
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_template_id_check;
ALTER TABLE invitations ADD CONSTRAINT invitations_template_id_check CHECK (
  template_id = ANY (ARRAY[
    'traditional', 'modern', 'minimalist',
    'modern-red', 'soft-pink', 'brown-gold',
    'olive-green', 'minimalist-bw', 'classic-red-gold'
  ])
);
