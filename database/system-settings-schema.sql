-- System Settings Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Settings table - stores all system settings in a single row
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Logo
  logo_url TEXT, -- URL to logo image (Supabase Storage or Cloudinary)
  
  -- Contact Information
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  contact_city VARCHAR(100),
  contact_state VARCHAR(100),
  contact_zip VARCHAR(20),
  contact_country VARCHAR(100),
  
  -- Social Links
  social_facebook VARCHAR(500),
  social_twitter VARCHAR(500),
  social_instagram VARCHAR(500),
  social_linkedin VARCHAR(500),
  social_youtube VARCHAR(500),
  social_pinterest VARCHAR(500),
  
  -- Working Hours (JSON format for flexibility)
  working_hours JSONB DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "monday": {"open": "09:00", "close": "17:00", "closed": false},
  --   "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
  --   "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
  --   "thursday": {"open": "09:00", "close": "17:00", "closed": false},
  --   "friday": {"open": "09:00", "close": "17:00", "closed": false},
  --   "saturday": {"open": "10:00", "close": "14:00", "closed": false},
  --   "sunday": {"open": null, "close": null, "closed": true}
  -- }
  
  -- SEO Defaults
  seo_default_title VARCHAR(255),
  seo_default_description TEXT,
  seo_default_keywords VARCHAR(500),
  seo_default_image TEXT, -- URL to default OG image
  
  -- Additional Settings (JSON for extensibility)
  additional_settings JSONB DEFAULT '{}'::jsonb,
  -- Can store: currency, timezone, date_format, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a single settings record if it doesn't exist
INSERT INTO settings (id) 
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM settings)
ON CONFLICT DO NOTHING;

-- Index for faster queries (though we'll only have one row)
CREATE INDEX IF NOT EXISTS idx_settings_id ON settings(id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_settings_updated_at_trigger
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Note: Settings will be accessed via service role key in API routes
-- Public read access can be granted if needed for frontend
