import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// EHR / Practice Management cards — position: software-ehr (software page section)
const softwareEhrMediaData = [
  {
    title: 'Virtual Manager',
    description:
      'A powerful athoreline product designed to streamline and optimize your revenue cycle management for medical practices and billing companies.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/curemd.png',
    fileName: 'virtual-manager.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software-ehr',
    status: 'active',
    displayOrder: 1,
    altText: 'Virtual Manager revenue cycle software',
    linkUrl: null,
  },
  {
    title: 'Practice Management',
    description:
      'Streamlined practice operations with comprehensive workflow management, scheduling, and patient demographics.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/kareo.png',
    fileName: 'practice-management.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software-ehr',
    status: 'active',
    displayOrder: 2,
    altText: 'Practice management software solution',
    linkUrl: null,
  },
  {
    title: 'EHR Integration',
    description:
      'Seamless integration with Electronic Health Records systems for unified data management and billing accuracy.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/modmed.png',
    fileName: 'ehr-integration.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software-ehr',
    status: 'active',
    displayOrder: 3,
    altText: 'EHR integration platform',
    linkUrl: null,
  },
];

async function seedSoftwareEhrMedia() {
  console.log('🌱 Starting Software EHR media seeder (position: software-ehr)...\n');

  try {
    for (const mediaItem of softwareEhrMediaData) {
      const { data: existingMedia } = await supabase
        .from('media')
        .select('id, title, file_url')
        .eq('title', mediaItem.title)
        .eq('position', mediaItem.position)
        .is('deleted_at', null)
        .maybeSingle();

      let finalFileUrl = existingMedia?.file_url as string | undefined;
      const isExistingCloudinary =
        typeof finalFileUrl === 'string' && finalFileUrl.includes('res.cloudinary.com');

      if (!isExistingCloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
        const uploaded = await cloudinary.uploader.upload(mediaItem.fileUrl, {
          folder: 'software-ehr',
          resource_type: 'image',
        });
        finalFileUrl = uploaded.secure_url;
      } else if (!finalFileUrl) {
        finalFileUrl = mediaItem.fileUrl;
      }

      const payload = {
        description: mediaItem.description,
        file_url: finalFileUrl,
        file_name: mediaItem.fileName,
        file_size: mediaItem.fileSize,
        file_type: mediaItem.fileType,
        status: mediaItem.status,
        display_order: mediaItem.displayOrder,
        alt_text: mediaItem.altText,
        link_url: mediaItem.linkUrl,
        updated_at: new Date().toISOString(),
      };

      if (existingMedia) {
        const { error: updateError } = await supabase
          .from('media')
          .update(payload)
          .eq('id', existingMedia.id);

        if (updateError) {
          console.error(`❌ Error updating "${mediaItem.title}":`, updateError);
          continue;
        }
        console.log(`✅ Updated: ${mediaItem.title}`);
      } else {
        const { error: insertError } = await supabase.from('media').insert({
          title: mediaItem.title,
          position: mediaItem.position,
          ...payload,
        });

        if (insertError) {
          console.error(`❌ Error creating "${mediaItem.title}":`, insertError);
          continue;
        }
        console.log(`✅ Created: ${mediaItem.title} (position: software-ehr)`);
      }
    }

    console.log('\n🎉 Software EHR media seeder completed!\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

seedSoftwareEhrMedia()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
