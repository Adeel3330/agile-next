import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function getPlaceholderImage(): string {
  return 'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/v1312461204/sample.jpg';
}

async function seedPages() {
  console.log('🌱 Seeding Why Agile Solutions & Effortless Onboarding pages (no sections)...');

  const now = new Date().toISOString();

  const pages = [
    {
      title: 'Why Agile Nexus Solutions?',
      slug: 'why-agile-solutions',
      content: `
        <p>We deliver what we promise. Agile Nexus Solutions offers revenue cycle management services to Healthcare Providers and Medical Billing Companies across the USA. Our goal is to help you manage your business so you can focus on patient care and operations, not paperwork.</p>
        <ul>
          <li><strong>24/7 Services</strong> – Round-the-clock support for your billing needs.</li>
          <li><strong>Quick Turnaround Time</strong> – Faster claims and follow-ups.</li>
          <li><strong>Cost Effective</strong> – Affordable solutions that maximize your revenue.</li>
          <li><strong>Advanced Technology</strong> – Modern tools and workflows for accuracy and efficiency.</li>
        </ul>
      `.trim(),
      seo_title: 'Why Agile Nexus Solutions | RCM & Medical Billing',
      seo_description:
        'Why choose Agile Nexus Solutions for revenue cycle management: 24/7 services, quick turnaround, cost-effective solutions, and advanced technology for healthcare providers and medical billing companies.',
      seo_keywords:
        'why agile solutions, RCM, medical billing, 24/7 billing, quick turnaround, cost effective, advanced technology',
      seo_image: getPlaceholderImage(),
      file_url: getPlaceholderImage(),
      status: 'published',
      template: 'home',
      published_at: now,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      title: 'Effortless Onboarding and Seamless Transition',
      slug: 'one-effortless-onboarding',
      content: `
        <p>We understand that switching to a new billing service can seem daunting. That's why we've designed our onboarding and transition process to be as simple and stress-free as possible. Here's how we ensure an effortless start for your practice:</p>
        <ul>
          <li><strong>Personalized Onboarding Plan</strong> – Tailored to your practice size and specialty.</li>
          <li><strong>Comprehensive Data Migration</strong> – Secure transfer of your existing billing data.</li>
          <li><strong>Step-by-Step Guidance</strong> – Clear support at every stage.</li>
          <li><strong>Seamless Integration</strong> – Works with your current systems and workflows.</li>
          <li><strong>Quick Start to Improved Efficiency</strong> – Get up and running without delay.</li>
        </ul>
        <p>Let's connect and get you started with a smooth transition.</p>
      `.trim(),
      seo_title: 'Effortless Onboarding & Seamless Transition | RCM',
      seo_description:
        'Smooth onboarding and seamless transition to our billing service: personalized plan, data migration, step-by-step guidance, and quick start to improved efficiency.',
      seo_keywords:
        'effortless onboarding, seamless transition, billing onboarding, data migration, RCM onboarding',
      seo_image: getPlaceholderImage(),
      file_url: getPlaceholderImage(),
      status: 'published',
      template: 'home',
      published_at: now,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
  ];

  try {
    const { data: existing } = await supabaseAdmin
      .from('pages')
      .select('slug')
      .in('slug', pages.map((p) => p.slug))
      .is('deleted_at', null);

    const existingSlugs = new Set((existing || []).map((p: any) => p.slug));
    const toInsert = pages.filter((p) => !existingSlugs.has(p.slug));

    if (toInsert.length === 0) {
      console.log('   ✓ Why Agile & Effortless Onboarding pages already exist, skipping.');
      return;
    }

    const { data, error } = await supabaseAdmin.from('pages').insert(toInsert).select();
    if (error) {
      console.error('   ❌ Error seeding pages:', error);
      return;
    }
    console.log(`   ✓ Inserted ${data?.length || 0} page(s)`);
  } catch (e) {
    console.error('   ❌ Unexpected error seeding pages:', e);
  }
}

async function seedMedia() {
  console.log('🌱 Seeding media for Why Agile Solutions & Effortless Onboarding...');

  const now = new Date().toISOString();
  const TEXT_ONLY = '/assets/images/resource/about-1.jpg';

  const whyAgileMedia = [
    {
      title: 'heading',
      description:
        'We deliver what we promise. Agile Nexus Solutions offers revenue cycle management services to Healthcare Providers and Medical Billing Companies across the USA.',
      file_url: TEXT_ONLY,
      file_name: 'text-placeholder.jpg',
      file_type: 'image/jpeg',
      position: 'why-agile-solutions',
      status: 'active',
      display_order: 0,
      alt_text: 'Our Advantages',
      link_url: null as string | null,
    },
    {
      title: '24/7 Services',
      description: 'Round-the-clock support for all your medical billing needs.',
      file_url: getPlaceholderImage(),
      file_name: 'why-agile-24-7.jpg',
      file_type: 'image/jpeg',
      position: 'why-agile-solutions',
      status: 'active',
      display_order: 1,
      alt_text: '24/7 Services',
      link_url: null as string | null,
    },
    {
      title: 'Quick Turnaround Time',
      description: 'Faster claims processing and follow-ups to maximize your revenue.',
      file_url: getPlaceholderImage(),
      file_name: 'why-agile-turnaround.jpg',
      file_type: 'image/jpeg',
      position: 'why-agile-solutions',
      status: 'active',
      display_order: 2,
      alt_text: 'Quick Turnaround Time',
      link_url: null as string | null,
    },
    {
      title: 'Cost Effective',
      description: 'Affordable solutions that do not compromise on quality or compliance.',
      file_url: getPlaceholderImage(),
      file_name: 'why-agile-cost.jpg',
      file_type: 'image/jpeg',
      position: 'why-agile-solutions',
      status: 'active',
      display_order: 3,
      alt_text: 'Cost Effective',
      link_url: null as string | null,
    },
    {
      title: 'Advanced Technology',
      description: 'Modern tools and workflows for accuracy, transparency, and efficiency.',
      file_url: getPlaceholderImage(),
      file_name: 'why-agile-technology.jpg',
      file_type: 'image/jpeg',
      position: 'why-agile-solutions',
      status: 'active',
      display_order: 4,
      alt_text: 'Advanced Technology',
      link_url: null as string | null,
    },
  ];

  const mediaItems = [
    ...whyAgileMedia,
    {
      title: 'Effortless Onboarding',
      description: 'Effortless onboarding and seamless transition for your practice.',
      file_url: getPlaceholderImage(),
      file_name: 'one-effortless-onboarding.jpg',
      file_size: 0,
      file_type: 'image/jpeg',
      position: 'one-effortless-onboarding',
      status: 'active',
      display_order: 1,
      alt_text: 'Effortless onboarding and seamless transition',
      link_url: null as string | null,
      created_at: now,
      updated_at: now,
      deleted_at: null as string | null,
    },
  ];

  try {
    for (const item of whyAgileMedia) {
      const { data: existing } = await supabaseAdmin
        .from('media')
        .select('id')
        .eq('position', item.position)
        .eq('title', item.title)
        .is('deleted_at', null)
        .maybeSingle();

      const payload = {
        description: item.description,
        file_url: item.file_url,
        file_name: item.file_name,
        file_type: item.file_type,
        status: item.status,
        display_order: item.display_order,
        alt_text: item.alt_text,
        link_url: item.link_url,
        updated_at: now,
      };

      if (existing) {
        await supabaseAdmin.from('media').update(payload).eq('id', existing.id);
        console.log(`   ✓ Updated why-agile media: ${item.title}`);
      } else {
        await supabaseAdmin.from('media').insert({ ...item, created_at: now, updated_at: now, deleted_at: null });
        console.log(`   ✓ Created why-agile media: ${item.title}`);
      }
    }

    const { data: existing } = await supabaseAdmin
      .from('media')
      .select('position, title')
      .eq('position', 'one-effortless-onboarding')
      .is('deleted_at', null);

    const existingKeys = new Set((existing || []).map((m: any) => `${m.position}:${m.title}`));
    const onboardingItem = mediaItems.find((m) => m.position === 'one-effortless-onboarding')!;
    if (!existingKeys.has(`${onboardingItem.position}:${onboardingItem.title}`)) {
      const { error } = await supabaseAdmin.from('media').insert(onboardingItem);
      if (error) console.error('   ❌ Error seeding onboarding media:', error);
      else console.log('   ✓ Inserted Effortless Onboarding media');
    } else {
      console.log('   ✓ Effortless Onboarding media already exists, skipping.');
    }
  } catch (e) {
    console.error('   ❌ Unexpected error seeding media:', e);
  }
}

async function main() {
  console.log('\n🚀 Seeding Why Agile Solutions & One Effortless Onboarding...\n');
  try {
    await seedPages();
    await seedMedia();
    console.log('\n✅ Seeding completed. Edit in /admin/pages and /admin/media if needed.\n');
  } catch (e) {
    console.error('\n❌ Seeding failed:', e);
    process.exit(1);
  }
}

main();
