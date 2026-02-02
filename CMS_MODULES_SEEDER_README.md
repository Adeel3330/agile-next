# CMS Modules Seeder

This seeder populates sample data for all CMS modules:
- Pages CMS
- Media Management
- Affiliates
- System Settings

## Usage

Run the seeder with:

```bash
npm run seed:cms-modules
```

## What Gets Seeded

### Pages CMS (3 pages)
- **About Us** page (`/about`)
  - Published status
  - Hero section, stats, and content sections
  - SEO metadata
  - Template: `about`

- **Contact Us** page (`/contact`)
  - Published status
  - Contact information sections
  - SEO metadata
  - Template: `contact`

- **Services** page (`/services`)
  - Published status
  - Services features section
  - SEO metadata
  - Template: `services`

### Media Management (6 items)
- Homepage Hero Image (position: `home`, order: 1)
- About Us Image (position: `about`, order: 1)
- Services Banner (position: `services`, order: 1)
- Contact Page Image (position: `contact`, order: 1)
- Homepage Feature Image 1 (position: `home`, order: 2)
- Homepage Feature Image 2 (position: `home`, order: 3)

All media items are set to `active` status.

### Affiliates (5 affiliates)
- **Dr. John Smith** - Active, 15% commission
- **HealthCare Partners LLC** - Active, 20% commission
- **Dr. Sarah Johnson** - Pending, 12.5% commission
- **Regional Medical Network** - Active, 18% commission
- **Dr. Michael Brown** - Inactive, 10% commission

Each affiliate has a unique affiliate code and contact information.

### System Settings (1 record)
- Logo URL (placeholder)
- Contact information (email, phone, address)
- Social media links (Facebook, Twitter, Instagram, LinkedIn, YouTube, Pinterest)
- Working hours (Monday-Friday: 9 AM - 5 PM, Saturday: 10 AM - 2 PM, Sunday: Closed)
- SEO defaults (title, description, keywords, image)
- Additional settings (timezone, currency, date format)

## Important Notes

1. **Placeholder Images**: All image URLs are placeholders. You should:
   - Replace with actual Supabase Storage URLs after uploading images
   - Or use Cloudinary URLs if using Cloudinary
   - Update the `getPlaceholderImage()` and `getStoragePlaceholderImage()` functions

2. **Duplicate Prevention**: The seeder checks for existing records and skips them:
   - Pages: Checks by slug
   - Media: Checks by title
   - Affiliates: Checks by email
   - Settings: Updates existing or creates new

3. **Affiliate Codes**: Codes are auto-generated to ensure uniqueness. Format: `INITIALS + TIMESTAMP + INDEX`

4. **Settings Update**: If settings already exist, the seeder will update them. If not, it creates new settings.

## Customization

To customize the seeded data:

1. Edit `seed-cms-modules.ts`
2. Modify the arrays/objects for each module
3. Update placeholder URLs with actual image URLs
4. Adjust contact information, social links, and working hours as needed

## Running Individual Seeders

You can also run individual seeding functions by modifying the `seedAll()` function:

```typescript
// Seed only pages
await seedPages();

// Seed only media
await seedMedia();

// Seed only affiliates
await seedAffiliates();

// Seed only settings
await seedSystemSettings();
```

## Troubleshooting

### Error: "Missing Supabase configuration"
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Duplicate key value violates unique constraint"
- The seeder should handle this automatically, but if it occurs, check for existing records

### Images not displaying
- Replace placeholder URLs with actual Supabase Storage or Cloudinary URLs
- Ensure storage bucket is configured correctly (for media management)

### Settings not updating
- Settings are updated if they exist, or created if they don't
- Check that the settings table exists and has the correct schema

## Next Steps

After running the seeder:

1. **Upload Real Images**: Replace placeholder image URLs with actual uploaded images
2. **Update Contact Info**: Modify contact information in system settings
3. **Customize Pages**: Edit page content, sections, and SEO metadata
4. **Review Affiliates**: Verify affiliate information and commission rates
5. **Configure Working Hours**: Adjust working hours to match your business schedule
