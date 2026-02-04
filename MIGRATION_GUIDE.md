# Migration Guide: MongoDB to Supabase + Cloudinary

This guide explains the changes made to migrate from MongoDB to Supabase and integrate Cloudinary for file uploads.

## Changes Made

### 1. Database Migration (MongoDB → Supabase)

All database operations have been migrated from MongoDB/Mongoose to Supabase:

- **Admin authentication** - Now uses Supabase `admins` table
- **Careers CRUD** - Now uses Supabase `careers` table  
- **Sliders CRUD** - Now uses Supabase `sliders` table

### 2. File Upload (Cloudinary Integration)

- Replaced file URL storage with Cloudinary uploads
- Files are uploaded to Cloudinary when selected in forms
- Cloudinary URLs are stored in the database
- Old files are automatically deleted from Cloudinary when updated

### 3. Code Changes

#### New Files Created:
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/cloudinary.ts` - Cloudinary upload/delete utilities
- `src/lib/auth.ts` - Shared JWT verification utility
- `src/app/api/admin/upload/route.ts` - File upload endpoint
- `supabase-schema.sql` - Database schema for Supabase

#### Updated Files:
- All API routes in `src/app/api/admin/` - Migrated to Supabase
- `src/app/admin/sliders/create/page.tsx` - Added Cloudinary upload
- `src/app/admin/sliders/edit/[id]/page.tsx` - Added Cloudinary upload
- Removed all inline CSS from admin pages

## Setup Instructions

### 1. Install Dependencies

Dependencies have been installed. If you need to reinstall:

```bash
npm install @supabase/supabase-js cloudinary next-cloudinary
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT (keep existing)
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

### 3. Create Supabase Tables

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase-schema.sql` to create all tables

### 4. Migrate Existing Data (if any)

If you have existing MongoDB data, you'll need to:

1. Export data from MongoDB
2. Transform the data format (MongoDB uses `_id`, Supabase uses `id`)
3. Import into Supabase using the Supabase dashboard or API

### 5. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your `.env.local` file

## Database Schema Differences

### Column Name Mappings

**Sliders table:**
- `fileType` (MongoDB) → `file_type` (Supabase)
- `seoTitle` (MongoDB) → `seo_title` (Supabase)
- `seoContent` (MongoDB) → `seo_content` (Supabase)
- `_id` (MongoDB) → `id` (Supabase)

The API routes handle these mappings automatically.

## API Changes

### File Upload Flow

1. User selects a file in the form
2. File is immediately uploaded to Cloudinary via `/api/admin/upload`
3. Cloudinary URL is stored in form state
4. Form submission saves the Cloudinary URL to Supabase

### Soft Deletes

Sliders use soft deletes (setting `deleted_at` timestamp). The API filters out soft-deleted records automatically.

## Testing

After setup, test:

1. Admin login
2. Create/Edit/Delete careers
3. Create/Edit/Delete sliders (with file uploads)
4. Verify files are uploaded to Cloudinary
5. Verify data is stored in Supabase

## Rollback

If you need to rollback:

1. Restore MongoDB connection in `src/lib/db.ts`
2. Restore Mongoose models
3. Revert API routes to use MongoDB
4. Remove Cloudinary integration from forms

## Notes

- The old MongoDB models (`src/models/`) are still in the codebase but not used
- You can remove them after confirming everything works
- The `src/lib/db.ts` file is no longer used but kept for reference
