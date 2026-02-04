# Media Management Module Setup Guide

## Overview

The Media Management module allows you to upload and manage images using Supabase Storage with position control, status management, and ordering.

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```sql
-- See: database/media-management-schema.sql
```

This creates:
- `media` table with all required fields
- Indexes for performance
- Triggers for auto-updating timestamps

### 2. Storage Bucket Setup

#### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **"New bucket"**
4. Name it: `media`
5. Choose visibility:
   - **Public**: For direct image access (recommended for images)
   - **Private**: For signed URLs (more secure, requires API calls)

#### Step 2: Set Up Storage Policies

After creating the bucket, run these SQL policies in Supabase SQL Editor:

**For Public Bucket (Recommended):**
```sql
-- Allow public read access
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media');

-- Allow authenticated users (admins) to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media');
```

**For Private Bucket:**
```sql
-- Only allow authenticated users to read
CREATE POLICY "Allow authenticated read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media');
```

### 3. Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Features

### Position Control
- **home**: Images for homepage
- **services**: Images for services section
- **about**: Images for about page
- **contact**: Images for contact page
- **other**: General purpose images

### Status Management
- **active**: Image is visible and can be used
- **inactive**: Image is hidden but not deleted

### Ordering
- `display_order` field controls the order within each position
- Lower numbers appear first
- Default is 0

### File Management
- Upload via Supabase Storage (not Cloudinary)
- Max file size: 10MB
- Supported formats: JPG, PNG, GIF, WebP
- Automatic file naming with timestamps
- Public URLs for easy access

## API Endpoints

### Admin APIs (JWT Required)

#### List Media
```
GET /api/admin/media?search=&page=&limit=&position=&status=
```

**Query Parameters:**
- `search`: Search by title, description, filename
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `position`: Filter by position (home, services, about, contact, other)
- `status`: Filter by status (active, inactive)

**Response:**
```json
{
  "success": true,
  "media": [...],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Get Single Media Item
```
GET /api/admin/media/[id]
```

#### Create Media Item
```
POST /api/admin/media
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Hero Image",
  "description": "Main hero image",
  "fileUrl": "https://...",
  "fileName": "image.jpg",
  "fileSize": 123456,
  "fileType": "image/jpeg",
  "position": "home",
  "status": "active",
  "displayOrder": 0,
  "altText": "Hero image",
  "linkUrl": "https://example.com"
}
```

#### Update Media Item
```
PUT /api/admin/media/[id]
```

#### Delete Media Item (Soft Delete)
```
DELETE /api/admin/media/[id]
```

#### Upload File
```
POST /api/admin/media/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <image file>
```

**Response:**
```json
{
  "success": true,
  "url": "https://...supabase.co/storage/v1/object/public/media/filename.jpg",
  "fileName": "1234567890-abc123.jpg",
  "fileSize": 123456,
  "fileType": "image/jpeg",
  "originalName": "my-image.jpg"
}
```

## Admin Panel

### Pages

1. **List Page**: `/admin/media`
   - View all media items
   - Search and filter
   - Pagination
   - Edit/Delete actions

2. **Create Page**: `/admin/media/create`
   - Upload image to Supabase Storage
   - Set position, status, order
   - Add metadata (title, description, alt text, link)

3. **Edit Page**: `/admin/media/edit/[id]`
   - Update media item details
   - Replace image if needed
   - Update position, status, order

## Usage Example

### Frontend Integration

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    // Fetch media for home position
    fetch('/api/admin/media?position=home&status=active')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Sort by display_order
          const sorted = data.media.sort((a, b) => a.displayOrder - b.displayOrder);
          setMedia(sorted);
        }
      });
  }, []);

  return (
    <div>
      {media.map(item => (
        <img
          key={item._id}
          src={item.fileUrl}
          alt={item.altText || item.title}
          onClick={() => {
            if (item.linkUrl) {
              window.location.href = item.linkUrl;
            }
          }}
        />
      ))}
    </div>
  );
}
```

## Security

- All admin APIs require JWT authentication
- File uploads validated (type, size)
- Storage policies restrict access
- Soft deletes prevent data loss
- Service role key used for admin operations

## Troubleshooting

### Upload Fails
- Check storage bucket exists and is named `media`
- Verify storage policies are set correctly
- Check file size (max 10MB)
- Ensure file is an image type

### Images Not Displaying
- Verify bucket is set to PUBLIC (or use signed URLs)
- Check file URL is correct
- Verify CORS settings in Supabase

### Permission Errors
- Ensure storage policies allow authenticated users
- Check JWT token is valid
- Verify service role key is correct

## Best Practices

1. **Use Alt Text**: Always provide alt text for accessibility
2. **Optimize Images**: Compress images before upload
3. **Consistent Naming**: Use descriptive titles
4. **Order Management**: Use display_order for consistent ordering
5. **Status Management**: Set inactive instead of deleting when possible
6. **Position Organization**: Use positions to organize by page/section
