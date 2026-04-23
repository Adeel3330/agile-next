-- Add subcategory support to bookings
-- Run this SQL in Supabase SQL editor

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS subcategory_id UUID,
ADD COLUMN IF NOT EXISTS subcategory_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_bookings_subcategory_id ON bookings(subcategory_id);

-- Optional FK (safe if constraint does not already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_subcategory_id_fkey'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_subcategory_id_fkey
    FOREIGN KEY (subcategory_id)
    REFERENCES blog_categories(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Multi-subcategory booking mapping
CREATE TABLE IF NOT EXISTS booking_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  subcategory_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_subcategories_booking_id ON booking_subcategories(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_subcategories_subcategory_id ON booking_subcategories(subcategory_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_booking_subcategories_booking_subcategory
  ON booking_subcategories(booking_id, subcategory_id);
