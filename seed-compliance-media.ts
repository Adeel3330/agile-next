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

const complianceMediaData = [
  {
    title: 'Compliance Hero Banner',
    description: 'We maintain the highest standards of HIPAA compliance, CMS adherence, and data security across all medical billing and revenue cycle services.',
    fileUrl: PLACEHOLDER,
    fileName: 'compliance-hero.jpg',
    fileType: 'image/jpeg',
    position: 'compliance-hero',
    displayOrder: 1,
    altText: 'Compliance and Regulatory Standards',
  },
  {
    title: 'Compliance Content Image',
    description: 'Image showing compliance processes and standards',
    fileUrl: PLACEHOLDER,
    fileName: 'compliance-content.jpg',
    fileType: 'image/jpeg',
    position: 'compliance-content',
    displayOrder: 1,
    altText: 'HIPAA Compliance and Data Security',
  },
  {
    title: 'HIPAA Compliance',
    description:
      'Fully compliant with Health Insurance Portability and Accountability Act regulations, ensuring patient data protection and privacy through strict access controls, encrypted data transmission and storage, regular security audits, employee training, Business Associate Agreements, and incident response procedures.',
    fileUrl: PLACEHOLDER,
    fileName: 'hipaa-compliance.jpg',
    fileType: 'image/jpeg',
    position: 'compliance',
    displayOrder: 1,
    altText: 'HIPAA Compliance',
  },
  {
    title: 'CMS Guidelines',
    description:
      'Adherence to Centers for Medicare & Medicaid Services billing requirements and guidelines, ensuring accurate claim submission, proper documentation, and compliance with federal healthcare billing standards.',
    fileUrl: PLACEHOLDER,
    fileName: 'cms-guidelines.jpg',
    fileType: 'image/jpeg',
    position: 'compliance',
    displayOrder: 2,
    altText: 'CMS Guidelines',
  },
  {
    title: 'Data Security',
    description:
      'End-to-end encryption and industry-leading security measures to protect sensitive healthcare information, including secure cloud infrastructure, multi-factor authentication, and 24/7 monitoring.',
    fileUrl: PLACEHOLDER,
    fileName: 'data-security.jpg',
    fileType: 'image/jpeg',
    position: 'compliance',
    displayOrder: 3,
    altText: 'Data Security Standards',
  },
];

async function seedComplianceMedia() {
  console.log('🌱 Starting Compliance media seeder...\n');

  for (const mediaItem of complianceMediaData) {
    const { data: existingMedia } = await supabase
      .from('media')
      .select('id')
      .eq('title', mediaItem.title)
      .eq('position', mediaItem.position)
      .is('deleted_at', null)
      .maybeSingle();

    const payload = {
      description: mediaItem.description,
      file_url: mediaItem.fileUrl,
      file_name: mediaItem.fileName,
      file_size: 0,
      file_type: mediaItem.fileType,
      status: 'active',
      display_order: mediaItem.displayOrder,
      alt_text: mediaItem.altText,
      link_url: null,
      updated_at: new Date().toISOString(),
    };

    if (existingMedia) {
      const { error } = await supabase.from('media').update(payload).eq('id', existingMedia.id);
      if (error) {
        console.error(`❌ Error updating "${mediaItem.title}":`, error);
        continue;
      }
      console.log(`✅ Updated: ${mediaItem.title} (${mediaItem.position})`);
    } else {
      const { error } = await supabase.from('media').insert({
        title: mediaItem.title,
        position: mediaItem.position,
        ...payload,
      });
      if (error) {
        console.error(`❌ Error creating "${mediaItem.title}":`, error);
        continue;
      }
      console.log(`✅ Created: ${mediaItem.title} (${mediaItem.position})`);
    }
  }

  console.log('\n🎉 Compliance media seeder completed!\n');
}

seedComplianceMedia()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
