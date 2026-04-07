-- Add display ordering for blog/service categories
ALTER TABLE blog_categories
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_blog_categories_display_order
ON blog_categories(display_order);
