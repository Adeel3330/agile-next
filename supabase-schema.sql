-- Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Careers table
CREATE TABLE IF NOT EXISTS careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(150),
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  description TEXT,
  requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sliders table
CREATE TABLE IF NOT EXISTS sliders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file VARCHAR(500) NOT NULL,
  file_type VARCHAR(20) DEFAULT 'image' CHECK (file_type IN ('image', 'video')),
  seo_title VARCHAR(200),
  seo_content VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_careers_status ON careers(status);
CREATE INDEX IF NOT EXISTS idx_careers_created_at ON careers(created_at);
CREATE INDEX IF NOT EXISTS idx_sliders_deleted_at ON sliders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sliders_created_at ON sliders(created_at);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sliders ENABLE ROW LEVEL SECURITY;

-- Note: Since we're using JWT authentication in the API routes,
-- you may want to create policies for RLS, or disable RLS if you're
-- handling authentication at the application level (which we are).
