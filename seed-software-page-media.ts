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

const PLACEHOLDER = '/assets/images/resource/about-1.jpg';

const softwarePageMedia = [
  {
    title: 'Software Hero Banner',
    description: 'Discover our EHR and practice management platforms, including Virtual Manager, built to streamline revenue cycle operations for healthcare providers.',
    fileUrl: PLACEHOLDER,
    fileName: 'software-hero.jpg',
    fileType: 'image/jpeg',
    position: 'software-hero',
    displayOrder: 1,
    altText: 'Software solutions hero',
  },
  {
    title: 'Software Content Image',
    description: 'Content section image for the software page',
    fileUrl: PLACEHOLDER,
    fileName: 'software-content.jpg',
    fileType: 'image/jpeg',
    position: 'software-content',
    displayOrder: 1,
    altText: 'Software platform overview',
  },
  {
    title: 'EHR / Practice Management Software',
    description:
      'Comprehensive software solutions designed to streamline and optimize your revenue cycle management.',
    fileUrl: PLACEHOLDER,
    fileName: 'software-ehr-heading.txt',
    fileType: 'image/jpeg',
    position: 'software-ehr-heading',
    displayOrder: 1,
    altText: 'Our Software Solutions',
  },
];

async function seedSoftwarePageMedia() {
  console.log('🌱 Starting Software page media seeder...\n');

  for (const item of softwarePageMedia) {
    const { data: existing } = await supabase
      .from('media')
      .select('id')
      .eq('position', item.position)
      .eq('title', item.title)
      .is('deleted_at', null)
      .maybeSingle();

    const payload = {
      description: item.description,
      file_url: item.fileUrl,
      file_name: item.fileName,
      file_size: 0,
      file_type: item.fileType,
      status: 'active',
      display_order: item.displayOrder,
      alt_text: item.altText,
      link_url: null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('media').update(payload).eq('id', existing.id);
      console.log(`✅ Updated: ${item.title} (${item.position})`);
    } else {
      await supabase.from('media').insert({
        title: item.title,
        position: item.position,
        ...payload,
      });
      console.log(`✅ Created: ${item.title} (${item.position})`);
    }
  }

  console.log('\n🎉 Software page media seeder completed!\n');
}

seedSoftwarePageMedia()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
