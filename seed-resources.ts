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

const TEXT_ONLY_MEDIA_PLACEHOLDER_URL = '/assets/images/resource/about-1.jpg';
const MEDIA_POSITION = 'resources';

const resourcesPageData = {
  title: 'Explore Helpful Resources',
  slug: 'resources',
  template: 'resources',
  content: 'Resource Center',
  seoTitle: 'Resources | Compliance, Software, Specialities & Blog | Agile Nexus Solutions',
  seoDescription:
    'Explore compliance guidance, software information, specialty billing support, and medical billing insights from Agile Nexus Solutions.',
  seoKeywords:
    'resources, medical billing resources, compliance, software, specialities, healthcare billing blog',
  seoImage: '',
  status: 'published',
  published_at: new Date().toISOString(),
};

const resourceCardsData = [
  {
    title: 'Compliance',
    description: 'Policies, standards, and audit-ready billing operations.',
    linkUrl: '/compliance',
    displayOrder: 1,
  },
  {
    title: 'Software',
    description: 'Platform and system coverage used in your billing workflows.',
    linkUrl: '/software',
    displayOrder: 2,
  },
  {
    title: 'Specialities',
    description: 'Specialty-focused billing support and coding workflows.',
    linkUrl: '/specialities',
    displayOrder: 3,
  },
  {
    title: 'Blog',
    description: 'Insights, updates, and practical medical billing guidance.',
    linkUrl: '/blog',
    displayOrder: 4,
  },
];

async function seedResourcesPage() {
  const { data: existingPage } = await supabase
    .from('pages')
    .select('id, title')
    .eq('slug', resourcesPageData.slug)
    .is('deleted_at', null)
    .maybeSingle();

  const payload = {
    title: resourcesPageData.title,
    content: resourcesPageData.content,
    sections: null,
    seo_title: resourcesPageData.seoTitle,
    seo_description: resourcesPageData.seoDescription,
    seo_keywords: resourcesPageData.seoKeywords,
    seo_image: resourcesPageData.seoImage,
    template: resourcesPageData.template,
    status: resourcesPageData.status,
    published_at: resourcesPageData.published_at,
    updated_at: new Date().toISOString(),
  };

  if (existingPage) {
    const { error } = await supabase.from('pages').update(payload).eq('id', existingPage.id);
    if (error) throw error;
    console.log('✅ Updated Resources page');
  } else {
    const { error } = await supabase.from('pages').insert({
      ...payload,
      slug: resourcesPageData.slug,
    });
    if (error) throw error;
    console.log('✅ Created Resources page');
  }
}

async function seedResourcesMedia() {
  for (const item of resourceCardsData) {
    const { data: existing } = await supabase
      .from('media')
      .select('id, title')
      .eq('position', MEDIA_POSITION)
      .eq('title', item.title)
      .is('deleted_at', null)
      .maybeSingle();

    const payload = {
      description: item.description,
      link_url: item.linkUrl,
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
      console.log(`✅ Updated media: ${item.title}`);
    } else {
      const { error } = await supabase.from('media').insert({
        title: item.title,
        position: MEDIA_POSITION,
        ...payload,
      });
      if (error) {
        console.error(`❌ Error creating "${item.title}":`, error);
        continue;
      }
      console.log(`✅ Created media: ${item.title}`);
    }
  }
}

async function seedResources() {
  console.log('🌱 Starting Resources seeder (page + media)...\n');

  try {
    await seedResourcesPage();
    await seedResourcesMedia();
    console.log('\n🎉 Resources seeder completed!\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

seedResources()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
