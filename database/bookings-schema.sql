-- Bookings Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name VARCHAR(255),
  subcategory_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  subcategory_name VARCHAR(255),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_subcategory_id ON bookings(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at ON bookings(deleted_at);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Booking services junction table for multi-service selections
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for booking_services
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id ON booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_service_id ON booking_services(service_id);

-- Prevent duplicate service assignments for one booking
CREATE UNIQUE INDEX IF NOT EXISTS uniq_booking_services_booking_service
  ON booking_services(booking_id, service_id);

-- Enable RLS
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

-- Booking subcategories junction table for multi-subcategory selections
CREATE TABLE IF NOT EXISTS booking_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  subcategory_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for booking_subcategories
CREATE INDEX IF NOT EXISTS idx_booking_subcategories_booking_id ON booking_subcategories(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_subcategories_subcategory_id ON booking_subcategories(subcategory_id);

-- Prevent duplicate subcategory assignments for one booking
CREATE UNIQUE INDEX IF NOT EXISTS uniq_booking_subcategories_booking_subcategory
  ON booking_subcategories(booking_id, subcategory_id);

-- Enable RLS
ALTER TABLE booking_subcategories ENABLE ROW LEVEL SECURITY;
