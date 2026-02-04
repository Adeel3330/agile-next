-- Fix blog_categories slug constraint to be unique per parent_id
-- Run this SQL in your Supabase SQL Editor

-- Drop the existing global unique constraint on slug
ALTER TABLE blog_categories DROP CONSTRAINT IF EXISTS blog_categories_slug_key;

-- Drop the existing index if it exists
DROP INDEX IF EXISTS idx_blog_categories_slug;

-- Create a unique constraint on (parent_id, slug) combination
-- This allows the same slug under different parents
-- Note: In PostgreSQL, NULL values are considered distinct in unique constraints
-- So categories with NULL parent_id can have the same slug as categories with different parent_id values
-- But within the same parent_id (including NULL), slugs must be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_categories_parent_slug_unique 
ON blog_categories(parent_id, slug) 
WHERE deleted_at IS NULL;

-- Also create a regular index on slug for performance (non-unique)
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
