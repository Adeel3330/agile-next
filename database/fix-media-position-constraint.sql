-- Fix Media Position Constraint to Include CTA
-- Run this SQL in your Supabase SQL Editor

-- Drop the existing check constraint
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_position_check;

-- Add the new constraint with CTA included
ALTER TABLE media ADD CONSTRAINT media_position_check 
  CHECK (position IN ('home', 'services', 'about', 'contact', 'cta', 'other'));
