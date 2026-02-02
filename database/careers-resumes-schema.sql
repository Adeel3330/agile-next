-- Careers and Resumes Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Add slug column to careers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'careers' AND column_name = 'slug'
  ) THEN
    ALTER TABLE careers ADD COLUMN slug VARCHAR(200);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_careers_slug ON careers(slug);
  END IF;
END $$;

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  cover_letter TEXT,
  resume_file_url VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  -- Ensure one resume per email (user can only submit one resume total)
  UNIQUE(email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resumes_career_id ON resumes(career_id);
CREATE INDEX IF NOT EXISTS idx_resumes_email ON resumes(email);
CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(status);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at);
CREATE INDEX IF NOT EXISTS idx_resumes_deleted_at ON resumes(deleted_at);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
