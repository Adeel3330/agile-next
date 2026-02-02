-- Pages CMS Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Pages table - stores page content with section-based JSON structure
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT, -- Main content (HTML)
  sections JSONB DEFAULT '[]'::jsonb, -- Section-based content structure
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords VARCHAR(500),
  seo_image VARCHAR(500), -- Cloudinary URL for OG image
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  template VARCHAR(100), -- Template identifier (e.g., 'about', 'contact', 'home')
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Page versions table - for version-safe updates
CREATE TABLE IF NOT EXISTS page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords VARCHAR(500),
  seo_image VARCHAR(500),
  status VARCHAR(20),
  template VARCHAR(100),
  change_note TEXT, -- Note about what changed in this version
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, version_number)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_template ON pages(template);
CREATE INDEX IF NOT EXISTS idx_pages_published_at ON pages(published_at);
CREATE INDEX IF NOT EXISTS idx_pages_deleted_at ON pages(deleted_at);

CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_version_number ON page_versions(version_number);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_page_slug(title_param VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(title_param, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Function to auto-increment version number
CREATE OR REPLACE FUNCTION get_next_version_number(page_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) INTO max_version
  FROM page_versions
  WHERE page_id = page_id_param;
  
  RETURN max_version + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to create version before update
CREATE OR REPLACE FUNCTION create_page_version()
RETURNS TRIGGER AS $$
DECLARE
  new_version INTEGER;
BEGIN
  -- Only create version if page exists (not on insert)
  IF TG_OP = 'UPDATE' AND OLD.id IS NOT NULL THEN
    new_version := get_next_version_number(OLD.id);
    
    INSERT INTO page_versions (
      page_id,
      version_number,
      title,
      slug,
      content,
      sections,
      seo_title,
      seo_description,
      seo_keywords,
      seo_image,
      status,
      template,
      change_note
    ) VALUES (
      OLD.id,
      new_version,
      OLD.title,
      OLD.slug,
      OLD.content,
      OLD.sections,
      OLD.seo_title,
      OLD.seo_description,
      OLD.seo_keywords,
      OLD.seo_image,
      OLD.status,
      OLD.template,
      'Auto-saved version before update'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create version before update
CREATE TRIGGER trigger_create_page_version
  BEFORE UPDATE ON pages
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION create_page_version();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_pages_updated_at_trigger
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

-- Example sections JSON structure (for reference):
-- [
--   {
--     "type": "hero",
--     "title": "Welcome to Our Medical Center",
--     "subtitle": "Expert Care You Can Trust",
--     "image": "https://cloudinary.com/...",
--     "cta": { "text": "Learn More", "link": "/about" }
--   },
--   {
--     "type": "content",
--     "title": "About Us",
--     "content": "<p>Our story...</p>",
--     "columns": 2
--   },
--   {
--     "type": "features",
--     "items": [
--       { "title": "Feature 1", "description": "...", "icon": "..." },
--       { "title": "Feature 2", "description": "...", "icon": "..." }
--     ]
--   },
--   {
--     "type": "stats",
--     "items": [
--       { "label": "Expert Doctors", "value": 180, "suffix": "+" },
--       { "label": "Services", "value": 12.2, "suffix": "+", "decimals": 1 }
--     ]
--   }
-- ]
