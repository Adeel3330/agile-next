-- Allow multiple contact submissions per email (contact + affiliate pages)
-- Run in Supabase SQL Editor if duplicate-email inserts fail

ALTER TABLE contact_submissions
  DROP CONSTRAINT IF EXISTS contact_submissions_email_key;
