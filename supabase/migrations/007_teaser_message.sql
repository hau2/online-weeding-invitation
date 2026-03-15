-- Add teaser_message column for save-the-date feature
ALTER TABLE invitations
  ADD COLUMN teaser_message TEXT NOT NULL DEFAULT '';
