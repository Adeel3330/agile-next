-- Add fileUrl column to pages table and remove sections requirement
-- Run this SQL in your Supabase SQL Editor

-- Add file_url column
ALTER TABLE pages ADD COLUMN IF NOT EXISTS file_url VARCHAR(500);

-- Add index for file_url
CREATE INDEX IF NOT EXISTS idx_pages_file_url ON pages(file_url);

-- Update page_versions table to include file_url
ALTER TABLE page_versions ADD COLUMN IF NOT EXISTS file_url VARCHAR(500);

-- Note: sections column is kept for backward compatibility but can be set to null
-- You can drop it later if not needed:
-- ALTER TABLE pages DROP COLUMN IF EXISTS sections;
-- ALTER TABLE page_versions DROP COLUMN IF EXISTS sections;
