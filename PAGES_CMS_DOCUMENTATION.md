# Pages CMS Documentation

A complete Content Management System for dynamic pages in Next.js with Supabase.

## Features

- ✅ Full CRUD operations for pages
- ✅ Section-based content structure (JSON)
- ✅ Version-safe updates (automatic versioning)
- ✅ SEO fields (title, description, keywords, image)
- ✅ Slug-based API fetching
- ✅ Template system for frontend integration
- ✅ Status management (draft, published, archived)
- ✅ Soft deletes

## Database Schema

Run the SQL schema in your Supabase SQL Editor:

```sql
-- See: database/pages-cms-schema.sql
```

### Tables

1. **pages**: Main pages table
   - `id` (UUID, Primary Key)
   - `title` (VARCHAR)
   - `slug` (VARCHAR, Unique)
   - `content` (TEXT, HTML content)
   - `sections` (JSONB, Section-based content)
   - `seo_title`, `seo_description`, `seo_keywords`, `seo_image`
   - `status` (draft, published, archived)
   - `template` (VARCHAR, Template identifier)
   - `published_at`, `created_at`, `updated_at`, `deleted_at`

2. **page_versions**: Version history
   - Automatically created before each update
   - Stores complete page state at each version
   - Can be restored via admin panel

## API Endpoints

### Admin APIs (JWT Required)

#### List Pages
```
GET /api/admin/pages?search=&page=&limit=&status=&template=
```

**Response:**
```json
{
  "success": true,
  "pages": [...],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Get Single Page
```
GET /api/admin/pages/[id]
```

#### Create Page
```
POST /api/admin/pages
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "About Us",
  "slug": "about",
  "content": "<p>Content...</p>",
  "sections": [...],
  "seoTitle": "About Us - Medical Center",
  "seoDescription": "...",
  "seoKeywords": "about, medical",
  "seoImage": "https://res.cloudinary.com/...",
  "status": "published",
  "template": "about"
}
```

#### Update Page
```
PUT /api/admin/pages/[id]
```

#### Delete Page (Soft Delete)
```
DELETE /api/admin/pages/[id]
```

#### Get Page Versions
```
GET /api/admin/pages/[id]/versions
```

#### Restore Version
```
POST /api/admin/pages/[id]/versions
{
  "versionId": "uuid"
}
```

### Public APIs (No Auth Required)

#### Get Published Page by Slug
```
GET /api/pages/[slug]
```

**Response:**
```json
{
  "success": true,
  "page": {
    "id": "uuid",
    "title": "About Us",
    "slug": "about",
    "content": "<p>...</p>",
    "sections": [...],
    "seoTitle": "...",
    "seoDescription": "...",
    "seoKeywords": "...",
    "seoImage": "...",
    "template": "about",
    "publishedAt": "2024-01-01T00:00:00Z",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

## Section JSON Structure

Sections allow flexible, structured content:

```json
[
  {
    "type": "hero",
    "title": "Welcome to Our Medical Center",
    "subtitle": "Expert Care You Can Trust",
    "image": "https://res.cloudinary.com/.../hero.jpg",
    "cta": {
      "text": "Learn More",
      "link": "/about"
    }
  },
  {
    "type": "content",
    "title": "About Us",
    "content": "<p>Our story...</p>",
    "columns": 2
  },
  {
    "type": "features",
    "items": [
      {
        "title": "Feature 1",
        "description": "Description...",
        "icon": "icon-1"
      },
      {
        "title": "Feature 2",
        "description": "Description...",
        "icon": "icon-2"
      }
    ]
  },
  {
    "type": "stats",
    "items": [
      {
        "label": "Expert Doctors",
        "value": 180,
        "suffix": "+",
        "icon": "icon-37"
      },
      {
        "label": "Services",
        "value": 12.2,
        "suffix": "+",
        "decimals": 1,
        "icon": "icon-38"
      }
    ]
  },
  {
    "type": "testimonials",
    "items": [
      {
        "name": "John Doe",
        "role": "Patient",
        "content": "Great service!",
        "image": "https://..."
      }
    ]
  }
]
```

## Admin Panel

### Pages List
- **URL**: `/admin/pages`
- **Features**:
  - Search by title, slug, SEO title
  - Filter by status (draft, published, archived)
  - Filter by template
  - Pagination
  - Edit, Delete, View Versions actions

### Create Page
- **URL**: `/admin/pages/create`
- **Fields**:
  - Title (required)
  - Slug (auto-generated from title)
  - Template identifier
  - Status
  - SEO fields (title, description, keywords, image)
  - Content (Rich Text Editor)
  - Sections (JSON editor)

### Edit Page
- **URL**: `/admin/pages/edit/[id]`
- Same form as create, pre-filled with existing data

### Page Versions
- **URL**: `/admin/pages/[id]/versions`
- View all versions of a page
- Restore any previous version

## Frontend Integration

See `PAGES_CMS_INTEGRATION_EXAMPLE.md` for detailed integration examples.

### Basic Integration

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function DynamicPage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages/about')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPageData(data.page);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!pageData) return <div>Page not found</div>;

  return (
    <div>
      <h1>{pageData.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
      {/* Render sections based on type */}
      {pageData.sections?.map((section, index) => (
        <SectionRenderer key={index} section={section} />
      ))}
    </div>
  );
}
```

## Version Management

### Automatic Versioning

Every time a page is updated:
1. Current state is saved to `page_versions` table
2. Version number is auto-incremented
3. Change note can be added (optional)

### Restoring Versions

1. Go to `/admin/pages`
2. Click "Versions" on any page
3. Select a version
4. Click "Restore"
5. The page will be restored to that version's state

## SEO Integration

Pages include comprehensive SEO fields:

- **SEO Title**: Meta title tag
- **SEO Description**: Meta description
- **SEO Keywords**: Meta keywords
- **SEO Image**: Open Graph image (Cloudinary URL)

These can be used in frontend pages:

```tsx
useEffect(() => {
  if (pageData) {
    document.title = pageData.seoTitle || pageData.title;
    
    // Update meta tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', pageData.seoDescription);
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', pageData.seoImage);
  }
}, [pageData]);
```

## Template System

The `template` field allows frontend pages to identify which template to use:

```tsx
// In your page component
const template = pageData?.template;

if (template === 'about') {
  return <AboutTemplate data={pageData} />;
} else if (template === 'contact') {
  return <ContactTemplate data={pageData} />;
}
```

## Best Practices

1. **Always provide fallback values** in frontend components
2. **Handle loading states** gracefully
3. **Validate JSON sections** before saving
4. **Use Cloudinary URLs** for all images
5. **Keep sections structure consistent** across pages
6. **Test version restoration** before deploying
7. **Set appropriate status** (draft → published workflow)

## Troubleshooting

### Page not found (404)
- Check if page status is "published"
- Verify slug matches exactly
- Ensure page is not soft-deleted

### Sections not rendering
- Validate JSON structure
- Check section type handlers in frontend
- Verify sections array is not empty

### Version restore not working
- Check if version exists
- Verify admin authentication
- Check Supabase logs for errors

## Security

- All admin APIs require JWT authentication
- Public APIs only return published pages
- Soft deletes prevent data loss
- Version history is immutable (read-only)

## Future Enhancements

- [ ] Bulk operations (publish, archive multiple pages)
- [ ] Page preview (draft preview)
- [ ] Scheduled publishing
- [ ] Page templates library
- [ ] Content blocks/reusable components
- [ ] Multi-language support
- [ ] Page analytics
