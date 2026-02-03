import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Compliance Media Data
// Note: These use placeholder URLs. You should upload actual images to Cloudinary and replace these URLs
const complianceMediaData = [
  {
    title: 'Compliance Hero Banner',
    description: 'Hero banner image for compliance page showcasing our commitment to regulatory standards',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Replace with actual Cloudinary URL
    fileName: 'compliance-hero.jpg',
    fileSize: 0,
    fileType: 'image/jpeg',
    position: 'compliance',
    status: 'active',
    displayOrder: 1,
    altText: 'Compliance and Regulatory Standards',
    linkUrl: null
  },
  {
    title: 'Compliance Content Image',
    description: 'Image showing compliance processes and standards',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Replace with actual Cloudinary URL
    fileName: 'compliance-content.jpg',
    fileSize: 0,
    fileType: 'image/jpeg',
    position: 'compliance',
    status: 'active',
    displayOrder: 2,
    altText: 'HIPAA Compliance and Data Security',
    linkUrl: null
  },
  {
    title: 'Compliance Standards',
    description: 'Visual representation of our compliance standards',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Replace with actual Cloudinary URL
    fileName: 'compliance-standards.jpg',
    fileSize: 0,
    fileType: 'image/jpeg',
    position: 'compliance',
    status: 'active',
    displayOrder: 3,
    altText: 'Compliance Standards and Certifications',
    linkUrl: null
  }
];

async function seedComplianceMedia() {
  console.log('🌱 Starting Compliance media seeder...\n');

  try {
    for (const mediaItem of complianceMediaData) {
      // Check if media already exists by title and position
      const { data: existingMedia } = await supabase
        .from('media')
        .select('id, title')
        .eq('title', mediaItem.title)
        .eq('position', mediaItem.position)
        .is('deleted_at', null)
        .maybeSingle();

      if (existingMedia) {
        console.log(`⚠️  Media "${mediaItem.title}" already exists`);
        console.log('   Updating existing media...\n');

        const { data: updatedMedia, error: updateError } = await supabase
          .from('media')
          .update({
            description: mediaItem.description,
            file_url: mediaItem.fileUrl,
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
            file_url: mediaItem.fileUrl,
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

    console.log('🎉 Compliance media seeder completed successfully!\n');
    console.log('📝 Note: Please replace placeholder Cloudinary URLs with actual uploaded images.\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Run the seeder
seedComplianceMedia()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
