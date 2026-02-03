-- Fix Media Position Constraint to Include 'compliance'
-- Run this SQL in your Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_position_check;

-- Add the new constraint with 'compliance' included
ALTER TABLE media ADD CONSTRAINT media_position_check 
  CHECK (position IN ('home', 'services', 'about', 'contact', 'cta', 'compliance', 'other'));

-- Verify the constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'media_position_check';
