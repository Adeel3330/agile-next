# System Settings Module Documentation

## Overview

The System Settings module provides a centralized way to manage all system-wide settings including logo, contact information, social links, working hours, and SEO defaults. Settings are stored in a single table with caching for optimal performance.

## Database Schema

Run the SQL schema in your Supabase SQL Editor:

```sql
-- See: database/system-settings-schema.sql
```

### Settings Table Structure

- **Logo**: `logo_url` (TEXT) - URL to logo image
- **Contact Info**: Email, phone, address, city, state, zip, country
- **Social Links**: Facebook, Twitter, Instagram, LinkedIn, YouTube, Pinterest
- **Working Hours**: JSONB format for flexible day/time management
- **SEO Defaults**: Title, description, keywords, image
- **Additional Settings**: JSONB for extensibility

## API Endpoints

### Admin APIs (JWT Required)

#### Get Settings
```
GET /api/admin/settings
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "logoUrl": "https://...",
    "contactEmail": "contact@example.com",
    "contactPhone": "+1 (123) 456-7890",
    "contactAddress": "123 Main St",
    "contactCity": "New York",
    "contactState": "NY",
    "contactZip": "10001",
    "contactCountry": "USA",
    "socialFacebook": "https://facebook.com/...",
    "socialTwitter": "https://twitter.com/...",
    "socialInstagram": "https://instagram.com/...",
    "socialLinkedin": "https://linkedin.com/...",
    "socialYoutube": "https://youtube.com/...",
    "socialPinterest": "https://pinterest.com/...",
    "workingHours": {
      "monday": {"open": "09:00", "close": "17:00", "closed": false},
      "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
      "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
      "thursday": {"open": "09:00", "close": "17:00", "closed": false},
      "friday": {"open": "09:00", "close": "17:00", "closed": false},
      "saturday": {"open": "10:00", "close": "14:00", "closed": false},
      "sunday": {"open": null, "close": null, "closed": true}
    },
    "seoDefaultTitle": "Default Page Title",
    "seoDefaultDescription": "Default meta description",
    "seoDefaultKeywords": "keyword1, keyword2, keyword3",
    "seoDefaultImage": "https://...",
    "additionalSettings": {},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Settings
```
PUT /api/admin/settings
Content-Type: application/json
Authorization: Bearer <token>

{
  "logoUrl": "https://...",
  "contactEmail": "contact@example.com",
  "contactPhone": "+1 (123) 456-7890",
  "workingHours": {...},
  "seoDefaultTitle": "...",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "settings": {...},
  "message": "Settings updated successfully"
}
```

### Public API (No Auth Required)

#### Get Settings (Cached)
```
GET /api/settings
```

**Response:**
```json
{
  "success": true,
  "settings": {...},
  "cached": true
}
```

**Caching:**
- Settings are cached in-memory for 5 minutes
- Cache is automatically cleared after admin updates
- First request fetches from database, subsequent requests use cache
- Response includes `cached` flag to indicate cache status

## Admin Panel

### Settings Page
- **URL**: `/admin/settings`
- **Features**:
  - Logo upload (via Supabase Storage)
  - Contact information form
  - Social media links
  - Working hours configuration (per day)
  - SEO defaults configuration
  - Real-time preview
  - Success/error notifications

## Working Hours Format

Working hours are stored as JSON:

```json
{
  "monday": {
    "open": "09:00",
    "close": "17:00",
    "closed": false
  },
  "tuesday": {
    "open": "09:00",
    "close": "17:00",
    "closed": false
  },
  "sunday": {
    "open": null,
    "close": null,
    "closed": true
  }
}
```

- `open`: Opening time in HH:MM format (24-hour)
- `close`: Closing time in HH:MM format (24-hour)
- `closed`: Boolean indicating if the day is closed

## Frontend Integration

### Example: Fetching Settings

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
      });
  }, []);

  if (!settings) return <div>Loading...</div>;

  return (
    <footer>
      <div className="contact-info">
        <p>{settings.contactEmail}</p>
        <p>{settings.contactPhone}</p>
        <p>{settings.contactAddress}</p>
      </div>
      <div className="social-links">
        {settings.socialFacebook && (
          <a href={settings.socialFacebook}>Facebook</a>
        )}
        {settings.socialTwitter && (
          <a href={settings.socialTwitter}>Twitter</a>
        )}
        {/* ... other social links */}
      </div>
      <div className="working-hours">
        <h4>Working Hours</h4>
        {Object.entries(settings.workingHours).map(([day, hours]: [string, any]) => (
          <div key={day}>
            <strong>{day}:</strong>{' '}
            {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
          </div>
        ))}
      </div>
    </footer>
  );
}
```

### Example: Using SEO Defaults

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function Page({ title, description }) {
  const [seoDefaults, setSeoDefaults] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSeoDefaults(data.settings);
        }
      });
  }, []);

  useEffect(() => {
    if (seoDefaults) {
      document.title = title || seoDefaults.seoDefaultTitle || 'Default Title';
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description || seoDefaults.seoDefaultDescription || '');
      }
    }
  }, [seoDefaults, title, description]);

  return <div>Page content</div>;
}
```

## Caching Strategy

### In-Memory Cache
- Cache duration: 5 minutes
- Automatic cache invalidation on admin update
- Cache stored in server memory (resets on server restart)

### Production Considerations
For production, consider:
- **Redis**: For distributed caching across multiple servers
- **CDN**: For static settings that rarely change
- **Database Query Optimization**: Since there's only one settings row

### Cache Clearing
Cache is automatically cleared when:
- Admin updates settings via `/api/admin/settings` PUT endpoint
- Manual cache clear function available: `clearSettingsCache()`

## Security

- Admin APIs require JWT authentication
- Public API is read-only (no authentication required)
- Settings table uses Row Level Security
- Service role key used for admin operations

## Best Practices

1. **Logo Upload**: Use Supabase Storage or Cloudinary for logo storage
2. **Working Hours**: Always validate time format (HH:MM)
3. **Social Links**: Validate URLs before saving
4. **SEO Defaults**: Use as fallback when page-specific SEO is not available
5. **Cache Management**: Monitor cache hit rates in production
6. **Settings Validation**: Validate all inputs on both client and server

## Troubleshooting

### Settings Not Updating
- Check JWT token is valid
- Verify database connection
- Check cache is cleared after update

### Cache Not Working
- Verify cache duration is appropriate
- Check server memory usage
- Consider implementing Redis for production

### Working Hours Not Saving
- Validate JSON structure
- Check time format (HH:MM)
- Ensure `closed` boolean is set correctly

## Future Enhancements

- [ ] Multi-language support
- [ ] Timezone configuration
- [ ] Currency settings
- [ ] Date format preferences
- [ ] Email template settings
- [ ] Notification preferences
- [ ] API rate limiting settings
