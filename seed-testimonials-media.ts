/**
 * Seed testimonials media for Home page (position: testimonials)
 * Data sourced from https://agilenexussolution.com/ Testimonials section.
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' seed-testimonials-media.ts
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

// Placeholder for media table (image not displayed in testimonial; title + description only)
const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/https://res.cloudinary.com/da59axjla/image/upload/v1776934269/sample.png';

// Testimonials from https://agilenexussolution.com/
const testimonialsData = [
  {
    title: 'Family Medicine Centre in Maine',
    description:
      'My first time in solo practice I was very concerned about my ability to manage "the business side" of medicine. The personalized care and guidance this group provided to me and my staff were really a life saver. They always had quick turnaround on any questions I sent in, and were very knowledgeable for problem solving on the fly! I never feel like just a number, as I might have with a large corporation.',
  },
  {
    title: 'Nephrology Group in New Hampshire',
    description:
      'We are getting Agile Nexus Solutions Medical Billing services for all our billing needs, the support is second to none! They are always up to date with coding updates which helps to ensure timely billings and prompt payments. I highly recommend Agile Nexus Solutions Medical Billing for your billing needs.',
  },
  {
    title: 'Pain Management in New Jersey',
    description:
      'I am working with Agile Nexus Solutions Medical Billing for almost 2 years, and I could not be more pleased with their service. They really care about my business. With all the complexities of medical billing, we needed a professional partner to help us. Agile Nexus Solutions delivered.',
  },
  {
    title: 'Internal Medicine & Nephrology in Georgia',
    description:
      'We switched to Agile Nexus Solutions, Our claims are getting paid, and we are getting friendly, knowledgeable service. We highly recommend Agile Nexus Solutions.',
  },
  {
    title: 'Peds OT Clinic in Florida',
    description:
      "I'm a small pediatric OT practice and have been with Agile Nexus Solutions for several years now. They have made it so easy for me to keep my focus on patient care by being so knowledgeable and so efficient with all aspects of my billing. When I do have questions, they are always available and able to help quickly. Couldn't be happier!",
  },
].map((item, i) => ({
  title: item.title,
  description: item.description,
  fileUrl: PLACEHOLDER_IMAGE,
  fileName: `testimonial-${i + 1}.jpg`,
  fileSize: 0,
  fileType: 'image/jpeg',
  position: 'testimonials',
  status: 'active',
  displayOrder: i + 1,
  altText: item.title,
  linkUrl: null as string | null,
}));

async function seed() {
  console.log('🌱 Seeding Testimonials media (from agilenexussolution.com)...\n');

  for (const item of testimonialsData) {
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
      console.log(`   Updated: ${item.title}`);
    } else {
      const { error } = await supabase.from('media').insert({
        ...payload,
        created_at: new Date().toISOString(),
        deleted_at: null,
      });
      if (error) {
        console.error(`   ❌ Insert failed for ${item.title}:`, error.message);
      } else {
        console.log(`   Created: ${item.title}`);
      }
    }
  }

  console.log('\n🎉 Testimonials media seed done.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
