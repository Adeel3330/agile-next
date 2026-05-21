-- Add sort_order field to sliders for manual ordering

ALTER TABLE sliders
ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_sliders_sort_order ON sliders(sort_order);
