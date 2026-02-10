-- Media Position: Remove CHECK constraint so position accepts any value (VARCHAR)
-- Run this in your Supabase SQL Editor to allow positions: specialties, certifications, affiliate, etc.

-- Drop the existing check constraint so position is free-form varchar
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_position_check;

-- Document the column (optional)
COMMENT ON COLUMN media.position IS 'Placement/section identifier (e.g. home, services, about, specialties, certifications, compliance, affiliate, other).';
