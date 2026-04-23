import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const affiliateMediaData = [
  {
    title: 'Affiliate Program Hero Banner',
    description: 'Hero banner for affiliate program page',
    fileUrl: 'https://res.cloudinary.com/https://res.cloudinary.com/da59axjla/image/upload/v1776934269/sample.png',
    fileName: 'affiliate-hero.jpg',
    fileSize: 0,
    fileType: 'image/jpeg',
    position: 'affiliate',
    status: 'active',
    displayOrder: 1,
    altText: 'Partners & Referrals - Affiliate Program',
    linkUrl: null
  },
  {
    title: 'Affiliate Program Content',
    description: 'Content image for why partner section',
    fileUrl: 'https://res.cloudinary.com/https://res.cloudinary.com/da59axjla/image/upload/v1776934269/sample.png',
    fileName: 'affiliate-content.jpg',
    fileSize: 0,
    fileType: 'image/jpeg',
    position: 'affiliate',
    status: 'active',
    displayOrder: 2,
    altText: 'Why Partner With Agile Nexus Solutions',
    linkUrl: null
  },
  {
    title: 'Partnership Growth',
    description: 'Image for partnership growth section',
    fileUrl: 'https://res.cloudinary.com/https://res.cloudinary.com/da59axjla/image/upload/v1776934269/sample.png',
    fileName: 'affiliate-growth.jpg',
    fileSize: 0,
    fileType: 'image/jpeg',
    position: 'affiliate',
    status: 'active',
    displayOrder: 3,
    altText: 'Partnership and Growth',
    linkUrl: null
  }
];

async function seedAffiliateMedia() {
  console.log('🌱 Starting Affiliate Program media seeder...\n');

  try {
    for (const item of affiliateMediaData) {
      const { data: existing } = await supabase
        .from('media')
        .select('id, title')
        .eq('title', item.title)
        .eq('position', item.position)
        .is('deleted_at', null)
        .maybeSingle();

      const payload = {
        description: item.description,
        file_url: item.fileUrl,
        file_name: item.fileName,
        file_size: item.fileSize,
        file_type: item.fileType,
        status: item.status,
        display_order: item.displayOrder,
        alt_text: item.altText,
        link_url: item.linkUrl,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        await supabase.from('media').update(payload).eq('id', existing.id);
        console.log(`✅ Updated: ${item.title}`);
      } else {
        await supabase.from('media').insert({
          title: item.title,
          ...payload
        });
        console.log(`✅ Created: ${item.title}`);
      }
    }
    console.log('\n🎉 Affiliate Program media seeder completed.');
    console.log('📝 Note: Replace placeholder Cloudinary URLs with actual images in Admin > Media.\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

seedAffiliateMedia()
  .then(() => { console.log('✨ All done!'); process.exit(0); })
  .catch((e) => { console.error('💥 Fatal error:', e); process.exit(1); });
