import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
const TEXT_ONLY_MEDIA_PLACEHOLDER_URL = '/assets/images/resource/about-1.jpg';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const POSITION = 'about-us-sections';

const aboutUsSectionsData = [
  {
    title: 'who-we-are',
    description:
      'We are a trusted partner for healthcare organizations, combining experienced teams and smart workflows to reduce complexity, improve collections, and support long-term financial growth.',
    displayOrder: 1,
  },
  {
    title: 'best-in-industry',
    description:
      'From electronic health records, billing services and practice management tools – Agile Nexus Solutions has you covered! In addition to being an industry leader when it comes to pricing, we also provide personalized support for every client.',
    displayOrder: 2,
  },
  {
    title: 'wecare',
    description:
      'Agile Nexus Solutions services exceed customer expectations, and we are proud of our history, but more importantly, we are focused on the future. We have grown in recent years by continuing to invest in technology and people while maintaining a commitment to excellent service and innovation. We have the best customer service and one of the highest success rates for reimbursement, so you know your money will be going where it belongs - back into your pocket.',
    displayOrder: 3,
  },
  {
    title: 'mission',
    description:
      'Our mission is to improve the financial and operational health of medical practices through accurate, compliant, and transparent revenue cycle services that allow providers to focus on patient care.',
    displayOrder: 4,
  },
  {
    title: 'support',
    description:
      'Healthcare runs around the clock. Our team is available to support urgent billing and operational needs so your revenue workflows stay uninterrupted.',
    displayOrder: 5,
  },
  {
    title: 'support-highlights',
    description: [
      'Healthcare is continuous and your billing support should be too.',
      'Real-time assistance across time zones and provider locations.',
      'Fast response for urgent denials, eligibility, and claim issues.',
    ].join('\n'),
    displayOrder: 6,
  },
];

async function seedAboutUsSections() {
  console.log(`🌱 Starting About Us sections seeder (position: ${POSITION})...\n`);

  try {
    for (const item of aboutUsSectionsData) {
      const { data: existing } = await supabase
        .from('media')
        .select('id, title')
        .eq('position', POSITION)
        .eq('title', item.title)
        .is('deleted_at', null)
        .maybeSingle();

      const payload = {
        description: item.description,
        file_url: TEXT_ONLY_MEDIA_PLACEHOLDER_URL,
        file_name: 'text-section-placeholder.jpg',
        file_type: 'image/jpeg',
        status: 'active',
        display_order: item.displayOrder,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase.from('media').update(payload).eq('id', existing.id);
        if (error) {
          console.error(`❌ Error updating "${item.title}":`, error);
          continue;
        }
        console.log(`✅ Updated: ${item.title}`);
      } else {
        const { error } = await supabase.from('media').insert({
          title: item.title,
          position: POSITION,
          ...payload,
        });
        if (error) {
          console.error(`❌ Error creating "${item.title}":`, error);
          continue;
        }
        console.log(`✅ Created: ${item.title}`);
      }
    }

    console.log('\n🎉 About Us sections seeder completed!\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

seedAboutUsSections()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
