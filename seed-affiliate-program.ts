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

const affiliatePageData = {
  title: 'Affiliate Program',
  slug: 'affiliate-program',
  template: 'affiliate-program',
  content: `<p>Partner with Agile Nexus Solutions to turn your healthcare network into predictable recurring revenue.</p>`,
  seoTitle: 'Affiliate Program | Earn Referral Income | Agile Nexus Solutions',
  seoDescription:
    'Partner with Agile Nexus Solutions. Turn your healthcare network into recurring revenue. Earn commissions as an affiliate or white-label medical billing partner.',
  seoKeywords:
    'affiliate program, medical billing partner, referral program, white-label billing, healthcare partnerships, RCM partner, EMR affiliate',
  seoImage: '',
  status: 'published',
  published_at: new Date().toISOString(),
};

async function seedAffiliateProgramPage() {
  console.log('🌱 Starting Affiliate Program page seeder (SEO only)...\n');

  try {
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, title')
      .eq('slug', affiliatePageData.slug)
      .is('deleted_at', null)
      .maybeSingle();

    const payload = {
      title: affiliatePageData.title,
      content: affiliatePageData.content,
      sections: null,
      seo_title: affiliatePageData.seoTitle,
      seo_description: affiliatePageData.seoDescription,
      seo_keywords: affiliatePageData.seoKeywords,
      seo_image: affiliatePageData.seoImage,
      template: affiliatePageData.template,
      status: affiliatePageData.status,
      published_at: affiliatePageData.published_at,
      updated_at: new Date().toISOString(),
    };

    if (existingPage) {
      console.log(`⚠️  Page "${affiliatePageData.title}" already exists. Updating...\n`);
      const { error: updateError } = await supabase.from('pages').update(payload).eq('id', existingPage.id);
      if (updateError) throw updateError;
      console.log('✅ Successfully updated Affiliate Program page!\n');
    } else {
      const { error: insertError } = await supabase.from('pages').insert({
        ...payload,
        slug: affiliatePageData.slug,
      });
      if (insertError) throw insertError;
      console.log('✅ Successfully created Affiliate Program page!\n');
    }

    console.log('🎉 Affiliate Program page seeder completed.\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

seedAffiliateProgramPage()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('💥 Fatal error:', e);
    process.exit(1);
  });
