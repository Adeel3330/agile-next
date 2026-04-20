-- Add emergency phone number support to settings
-- Run this in Supabase SQL editor

ALTER TABLE settings
ADD COLUMN IF NOT EXISTS emergency_no VARCHAR(50);

COMMENT ON COLUMN settings.emergency_no IS 'Emergency contact phone number for CTA and contact blocks.';
