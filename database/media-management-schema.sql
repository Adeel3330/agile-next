-- Media Management Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Media table - stores media items with position and ordering
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT, -- File size in bytes
  file_type VARCHAR(100), -- MIME type (e.g., image/jpeg, image/png)
  position VARCHAR(50) NOT NULL CHECK (position IN ('home', 'services', 'about', 'contact', 'cta', 'other')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  display_order INTEGER DEFAULT 0, -- For ordering within position
  alt_text VARCHAR(255), -- For accessibility
  link_url VARCHAR(500), -- Optional link when media is clicked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_media_position ON media(position);
CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
CREATE INDEX IF NOT EXISTS idx_media_display_order ON media(display_order);
CREATE INDEX IF NOT EXISTS idx_media_deleted_at ON media(deleted_at);
CREATE INDEX IF NOT EXISTS idx_media_position_status_order ON media(position, status, display_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_media_updated_at_trigger
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_updated_at();

-- Enable Row Level Security
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (admin API)
-- This is handled by using supabaseAdmin client in API routes

-- Storage Bucket Setup Instructions:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket named "media"
-- 3. Set it to PUBLIC if you want public access, or PRIVATE if you want signed URLs
-- 4. For admin-only access, you can keep it PRIVATE and use service role key
-- 5. Recommended: Set bucket to PUBLIC for easier image display
-- 6. Set up policies (see below)

-- Storage Policies (run these after creating the bucket):
-- Allow authenticated users (admins) to upload files
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update their own files
-- CREATE POLICY "Allow authenticated updates" ON storage.objects
--   FOR UPDATE TO authenticated
--   USING (bucket_id = 'media');

-- Allow authenticated users to delete their own files
-- CREATE POLICY "Allow authenticated deletes" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (bucket_id = 'media');

-- Allow public read access (if bucket is PUBLIC)
-- CREATE POLICY "Allow public read" ON storage.objects
--   FOR SELECT TO public
--   USING (bucket_id = 'media');
