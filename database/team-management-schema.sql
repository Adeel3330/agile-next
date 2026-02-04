-- Team Management Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Team members table - stores team member information with photos
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  bio TEXT,
  photo_url TEXT, -- Cloudinary URL for team member photo
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  display_order INTEGER DEFAULT 0, -- For ordering team members
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  department VARCHAR(100), -- Optional: department or team category
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_team_members_deleted_at ON team_members(deleted_at);
CREATE INDEX IF NOT EXISTS idx_team_members_status_order ON team_members(status, display_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_team_members_updated_at_trigger
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
