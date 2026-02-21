import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function getPlaceholderImage(): string {
  return 'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/v1312461204/sample.jpg';
}

async function seedPages() {
  console.log('🌱 Seeding Medivantek home sections into Pages CMS...');

  const now = new Date().toISOString();

  const pages = [
    {
      title: 'Which of These Revenue Challenges Are Holding Your Practice Back?',
      slug: 'revenue-challenges',
      content: `
        <p>These common revenue challenges keep practices from reaching their full potential:</p>
        <ul>
          <li>Declining collections are putting consistent growth out of reach.</li>
          <li>Lack of financial visibility keeps your practice flying blind.</li>
          <li>Denied claims from coding errors are cutting deep into profits.</li>
          <li>Unresolved A/R over 90 days is quietly draining your revenue.</li>
          <li>Claims stagnating without follow-up are blocking your cash flow.</li>
        </ul>
        <p>If any of these sound familiar, it's time to rethink your billing strategy.</p>
      `.trim(),
      seo_title: 'Revenue Challenges Holding Your Practice Back | Medivantek',
      seo_description:
        'Identify the revenue challenges holding your medical practice back, from denied claims to aging A/R, and learn how Medivantek can help you recover lost revenue.',
      seo_keywords:
        'revenue challenges, medical billing issues, denied claims, AR over 90 days, Medivantek billing',
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
      title: 'Benefits of Medical Billing Outsourcing',
      slug: 'benefits-medical-billing',
      content: `
        <p>Outsourcing your medical billing gives your practice access to specialized revenue cycle expertise without the overhead of building a large in-house team.</p>
        <ul>
          <li>24/7 access to trained, in-demand professionals who shape your revenue cycle for profitability and plug revenue leaks.</li>
          <li>End-to-end HIPAA-compliant workflows that keep patient data secure and audit-ready at all times.</li>
          <li>Up to 70% reduction in operational and administrative costs, freeing cash flow to reinvest in patient care and growth.</li>
        </ul>
        <p>With Medivantek managing your billing, your team can refocus on delivering quality care instead of chasing claims and paperwork.</p>
      `.trim(),
      seo_title: 'Benefits of Medical Billing Outsourcing | Medivantek',
      seo_description:
        'Discover the benefits of outsourcing medical billing with Medivantek, including cost savings, HIPAA-compliant processes, and 24/7 revenue cycle expertise.',
      seo_keywords:
        'benefits of medical billing, outsource medical billing, revenue cycle outsourcing, Medivantek benefits',
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
      title: 'Dedicated Account Managers & Certified Medical Billers for Your Practice',
      slug: 'dedicated-team-billers-coders',
      content: `
        <ul>
          <li>Dedicated billers and coders aligned to your specialty and workflow.</li>
          <li>Proactive claim follow-up to reduce denials and improve collections.</li>
          <li>Transparent communication and reporting from assigned account managers.</li>
          <li>HIPAA-compliant processes built for consistency and scale.</li>
        </ul>
      `.trim(),
      seo_title: 'Dedicated Medical Billing Team for Your Practice | Medivantek',
      seo_description:
        'Get a dedicated team of certified billers, coders, and account managers to support your medical practice and improve reimbursement performance.',
      seo_keywords:
        'dedicated billing team, certified medical coders, account managers, practice billing support',
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
    const { data: existingPages, error: existingError } = await supabaseAdmin
      .from('pages')
      .select('slug')
      .in(
        'slug',
        pages.map((p) => p.slug),
      )
      .is('deleted_at', null);

    if (existingError) {
      console.error('   ❌ Error checking existing pages:', existingError);
      return;
    }

    const existingSlugs = new Set((existingPages || []).map((p: any) => p.slug));
    const pagesToInsert = pages.filter((p) => !existingSlugs.has(p.slug));

    if (pagesToInsert.length === 0) {
      console.log('   ✓ Medivantek home pages already exist, skipping insert...');
      return;
    }

    const { data, error } = await supabaseAdmin.from('pages').insert(pagesToInsert).select();

    if (error) {
      console.error('   ❌ Error seeding Medivantek home pages:', error);
      return;
    }

    console.log(`   ✓ Inserted ${data?.length || 0} Medivantek home page(s)`);
  } catch (error) {
    console.error('   ❌ Unexpected error seeding Medivantek home pages:', error);
  }
}

async function seedMedia() {
  console.log('🌱 Seeding Medivantek home media items...');

  const now = new Date().toISOString();

  const mediaItems = [
    {
      title: 'Revenue Challenges Illustration',
      description: 'Visual representing common revenue challenges for medical practices.',
      file_url: getPlaceholderImage(),
      file_name: 'revenue-challenges.jpg',
      file_size: 0,
      file_type: 'image/jpeg',
      position: 'revenue-challenges',
      status: 'active',
      display_order: 1,
      alt_text: 'Illustration of revenue challenges holding a medical practice back',
      link_url: null as string | null,
      created_at: now,
      updated_at: now,
      deleted_at: null as string | null,
    },
    {
      title: 'Benefits of Medical Billing Illustration',
      description: 'Visual representing key benefits of outsourcing medical billing with Medivantek.',
      file_url: getPlaceholderImage(),
      file_name: 'benefits-medical-billing.jpg',
      file_size: 0,
      file_type: 'image/jpeg',
      position: 'benefits-medical-billing',
      status: 'active',
      display_order: 1,
      alt_text: 'Illustration of benefits of medical billing outsourcing',
      link_url: null as string | null,
      created_at: now,
      updated_at: now,
      deleted_at: null as string | null,
    },
    {
      title: 'Dedicated Team of Billers and Coders',
      description: 'Visual representing a dedicated billing and coding team for medical practices.',
      file_url: getPlaceholderImage(),
      file_name: 'dedicated-team-billers-coders.jpg',
      file_size: 0,
      file_type: 'image/jpeg',
      position: 'dedicated-team-billers-coders',
      status: 'active',
      display_order: 1,
      alt_text: 'Dedicated team of medical billers and coders supporting your practice',
      link_url: null as string | null,
      created_at: now,
      updated_at: now,
      deleted_at: null as string | null,
    },
  ];

  try {
    const { data: existingMedia, error: existingError } = await supabaseAdmin
      .from('media')
      .select('title, position')
      .in(
        'position',
        mediaItems.map((m) => m.position),
      )
      .is('deleted_at', null);

    if (existingError) {
      console.error('   ❌ Error checking existing media:', existingError);
      return;
    }

    const existingKeys = new Set(
      (existingMedia || []).map((m: any) => `${m.position}:${m.title}`),
    );

    const toInsert = mediaItems.filter(
      (m) => !existingKeys.has(`${m.position}:${m.title}`),
    );

    if (toInsert.length === 0) {
      console.log('   ✓ Medivantek home media already exist, skipping insert...');
      return;
    }

    const { data, error } = await supabaseAdmin.from('media').insert(toInsert).select();

    if (error) {
      console.error('   ❌ Error seeding Medivantek media:', error);
      return;
    }

    console.log(`   ✓ Inserted ${data?.length || 0} Medivantek media item(s)`);
  } catch (error) {
    console.error('   ❌ Unexpected error seeding Medivantek media:', error);
  }
}

async function seedMedivantekHome() {
  console.log('\n🚀 Starting Medivantek home sections seeding...\n');

  try {
    await seedPages();
    await seedMedia();

    console.log('\n✅ Medivantek home sections seeding completed.\n');
    console.log('   - You can edit these entries in /admin/pages and /admin/media if needed.');
  } catch (error) {
    console.error('\n❌ Medivantek home sections seeding failed:', error);
    process.exit(1);
  }
}

seedMedivantekHome();

