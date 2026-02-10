import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Configure Cloudinary for server-side uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Software Media Data
// Pulled from "Our Expertise on Medical Billing Software" section on https://medivantek.com/
const softwareMediaData = [
  {
    title: 'CureMD',
    description: 'CureMD medical billing and EHR platform used across diverse specialties.',
    // Source image URL from Medivantek (will be uploaded to Cloudinary)
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/curemd.png',
    fileName: 'curemd.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 1,
    altText: 'CureMD medical billing software logo',
    linkUrl: null
  },
  {
    title: 'Availity',
    description: 'Availity clearinghouse and revenue cycle network for payers and providers.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/availity.png',
    fileName: 'availity.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 2,
    altText: 'Availity billing and clearinghouse platform logo',
    linkUrl: null
  },
  {
    title: 'Medgen',
    description: 'Medgen practice management and EHR software for medical groups.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/medgen.png',
    fileName: 'medgen.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 3,
    altText: 'Medgen practice management software logo',
    linkUrl: null
  },
  {
    title: 'ModMed',
    description: 'ModMed specialty-specific EHR and billing platform.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/modmed.png',
    fileName: 'modmed.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 4,
    altText: 'ModMed EHR and billing software logo',
    linkUrl: null
  },
  {
    title: 'TherapyNotes',
    description: 'TherapyNotes behavioral health practice management and notes platform.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/therapynotes.png',
    fileName: 'therapynotes.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 5,
    altText: 'TherapyNotes practice management software logo',
    linkUrl: null
  },
  {
    title: 'Office Ally',
    description: 'Office Ally web-based practice management and clearinghouse solution.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/officeally.png',
    fileName: 'officeally.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 6,
    altText: 'Office Ally billing and clearinghouse software logo',
    linkUrl: null
  },
  {
    title: 'Azalea Health',
    description: 'Azalea Health cloud-based EHR and RCM platform.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/azalea.png',
    fileName: 'azalea.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 7,
    altText: 'Azalea Health medical billing software logo',
    linkUrl: null
  },
  {
    title: 'Kareo',
    description: 'Kareo practice management and medical billing software for independent practices.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/kareo.png',
    fileName: 'kareo.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 8,
    altText: 'Kareo practice management and billing software logo',
    linkUrl: null
  },
  {
    title: 'MediTouch',
    description: 'MediTouch cloud-based EHR and practice management platform.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/meditouch.png',
    fileName: 'meditouch.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 9,
    altText: 'MediTouch EHR and practice management software logo',
    linkUrl: null
  },
  {
    title: 'CollaborateMD',
    description: 'CollaborateMD cloud-based medical billing and practice management solution.',
    fileUrl: 'https://medivantek.com/wp-content/themes/medivantek/assets/images/collaboratemd.png',
    fileName: 'collaboratemd.png',
    fileSize: 0,
    fileType: 'image/png',
    position: 'software',
    status: 'active',
    displayOrder: 10,
    altText: 'CollaborateMD medical billing software logo',
    linkUrl: null
  }
];

async function seedSoftwareMedia() {
  console.log('🌱 Starting Software media seeder...\n');

  try {
    for (const mediaItem of softwareMediaData) {
      // Check if media already exists by title and position
      const { data: existingMedia } = await supabase
        .from('media')
        .select('id, title, file_url')
        .eq('title', mediaItem.title)
        .eq('position', mediaItem.position)
        .is('deleted_at', null)
        .maybeSingle();

      // Upload to Cloudinary (or reuse existing Cloudinary URL if already set)
      let finalFileUrl = existingMedia?.file_url as string | null | undefined;

      const isExistingCloudinary =
        typeof finalFileUrl === 'string' &&
        finalFileUrl.includes('res.cloudinary.com');

      if (!isExistingCloudinary) {
        // Upload source URL from Medivantek to your Cloudinary under "software-logos"
        const uploaded = await cloudinary.uploader.upload(mediaItem.fileUrl, {
          folder: 'software-logos',
          resource_type: 'image',
        });
        finalFileUrl = uploaded.secure_url;
      }

      if (existingMedia) {
        console.log(`⚠️  Media "${mediaItem.title}" already exists`);
        console.log('   Updating existing media...\n');

        const { data: updatedMedia, error: updateError } = await supabase
          .from('media')
          .update({
            description: mediaItem.description,
            file_url: finalFileUrl,
            file_name: mediaItem.fileName,
            file_size: mediaItem.fileSize,
            file_type: mediaItem.fileType,
            status: mediaItem.status,
            display_order: mediaItem.displayOrder,
            alt_text: mediaItem.altText,
            link_url: mediaItem.linkUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMedia.id)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ Error updating media "${mediaItem.title}":`, updateError);
          continue;
        }

        console.log(`✅ Successfully updated: ${updatedMedia.title}`);
      } else {
        console.log(`📝 Creating new media: ${mediaItem.title}...\n`);

        const { data: newMedia, error: insertError } = await supabase
          .from('media')
          .insert({
            title: mediaItem.title,
            description: mediaItem.description,
            file_url: finalFileUrl,
            file_name: mediaItem.fileName,
            file_size: mediaItem.fileSize,
            file_type: mediaItem.fileType,
            position: mediaItem.position,
            status: mediaItem.status,
            display_order: mediaItem.displayOrder,
            alt_text: mediaItem.altText,
            link_url: mediaItem.linkUrl
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Error creating media "${mediaItem.title}":`, insertError);
          continue;
        }

        console.log(`✅ Successfully created: ${newMedia.title}`);
        console.log(`   Position: ${newMedia.position}`);
        console.log(`   Display Order: ${newMedia.display_order}\n`);
      }
    }

    console.log('🎉 Software media seeder completed successfully!\n');
    console.log('📝 Note: Please replace placeholder Cloudinary URLs with actual uploaded images.\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Run the seeder
seedSoftwareMedia()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
