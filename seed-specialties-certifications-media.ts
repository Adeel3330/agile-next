/**
 * Seed media for Home page: Specialties We Serve + Certification Badges
 * Positions: specialties, certifications
 * Run after applying database/media-position-varchar.sql so these positions are allowed.
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' seed-specialties-certifications-media.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/https://res.cloudinary.com/da59axjla/image/upload/v1776934269/sample.png';

const specialtiesData = [
  'Urgent Care',
  'Cardiology',
  'Dermatology',
  'Family Medicine',
  'Pediatrics',
  'Internal Medicine',
  'Nephrology',
  'Nursing Home',
  'Pain Management',
  'Ambulatory Services',
  'Podiatry',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Ophthalmology',
  'Lab Billing',
  'Urology',
  'Gynecology',
].map((title, i) => ({
  title,
  description: `Medical billing and RCM for ${title}`,
  fileUrl: PLACEHOLDER_IMAGE,
  fileName: `specialty-${(title || '').toLowerCase().replace(/\s+/g, '-')}.jpg`,
  fileSize: 0,
  fileType: 'image/jpeg',
  position: 'specialties',
  status: 'active',
  displayOrder: i + 1,
  altText: title,
  linkUrl: null as string | null,
}));

const certificationsData = [
  { title: 'HIPAA Compliant', altText: 'HIPAA Compliance' },
  { title: 'AAPC Certified', altText: 'AAPC Certification' },
  { title: 'Certified Coders', altText: 'Certified Medical Coders' },
  { title: 'Compliance Standards', altText: 'Compliance Standards' },
].map((item, i) => ({
  title: item.title,
  description: item.altText,
  fileUrl: PLACEHOLDER_IMAGE,
  fileName: `cert-${i + 1}.jpg`,
  fileSize: 0,
  fileType: 'image/jpeg',
  position: 'certifications',
  status: 'active',
  displayOrder: i + 1,
  altText: item.altText,
  linkUrl: null as string | null,
}));

async function seed() {
  console.log('🌱 Seeding Specialties & Certifications media...\n');

  for (const item of [...specialtiesData, ...certificationsData]) {
    const { data: existing } = await supabase
      .from('media')
      .select('id')
      .eq('title', item.title)
      .eq('position', item.position)
      .is('deleted_at', null)
      .maybeSingle();

    const payload = {
      title: item.title,
      description: item.description,
      file_url: item.fileUrl,
      file_name: item.fileName,
      file_size: item.fileSize,
      file_type: item.fileType,
      position: item.position,
      status: item.status,
      display_order: item.displayOrder,
      alt_text: item.altText,
      link_url: item.linkUrl,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('media').update(payload).eq('id', existing.id);
      console.log(`   Updated: ${item.position} – ${item.title}`);
    } else {
      const { data: inserted, error } = await supabase
        .from('media')
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
          deleted_at: null,
        })
        .select('id')
        .single();
      if (error) {
        console.error(`   ❌ Insert failed for ${item.title}:`, error.message);
      } else {
        console.log(`   Created: ${item.position} – ${item.title}`);
      }
    }
  }

  console.log('\n🎉 Specialties & Certifications media seed done.');
  console.log('   Replace placeholder image URLs in Admin > Media for real icons/badges.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
