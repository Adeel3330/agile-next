-- Services Management Database Schema
-- Run this SQL in your Supabase SQL Editor
-- Note: Service categories are now managed through the unified blog_categories table
-- with parent slug "service-categories". No separate service_categories table needed.

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  image_url VARCHAR(500), -- Cloudinary URL
  icon VARCHAR(100), -- Icon class name (e.g., 'icon-18')
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords VARCHAR(500),
  seo_image VARCHAR(500), -- Cloudinary URL for SEO
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON services(deleted_at);

-- Function to update updated_at timestamp for services
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for services
CREATE TRIGGER update_services_updated_at_trigger
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
