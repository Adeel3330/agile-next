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

// About Us Page Data from https://agilenexussolution.com/
const aboutUsPageData = {
  title: 'About Us',
  slug: 'about-us',
  template: 'about-us',
  content: `<h2>About Agile Nexus Solutions</h2>
<p>Agile Nexus Solutions provides medical billing and coding services to healthcare providers in the United States. Agile Nexus Solutions's mission is to be a trusted and valued healthcare partner offering advanced revenue cycle management services with dedication and integrity. We pride ourselves on exceeding expectations and maintaining a commitment to excellent service.</p>
<p>Agile Nexus Solutions services is committed to the future of medical billing with an investment in new technology and people while continuing to provide excellent service.</p>
<h3>Our Mission</h3>
<p>To be a trusted and valued healthcare partner offering advanced revenue cycle management services with dedication and integrity.</p>
<h3>Our Vision</h3>
<p>To provide accessible and equitable healthcare billing solutions, use innovative technology, and empower healthcare providers to focus on patient care.</p>
<h3>Why Choose Agile Nexus Solutions?</h3>
<ul>
  <li><strong>24/7 Services:</strong> Round-the-clock support for all your medical billing needs</li>
  <li><strong>Quick Turn Around Time:</strong> Fast and efficient processing to maximize your revenue</li>
  <li><strong>Cost Effective:</strong> Affordable solutions that don't compromise on quality</li>
  <li><strong>Advanced Technology:</strong> State-of-the-art systems and tools for optimal performance</li>
</ul>`,
  seoTitle: 'About Us - Agile Nexus Solutions | Medical Billing Services',
  seoDescription: 'Learn about Agile Nexus Solutions, a trusted medical billing and coding services provider in the United States. We offer advanced revenue cycle management services with dedication and integrity.',
  seoKeywords: 'about us, medical billing, revenue cycle management, Agile Nexus Solutions, healthcare billing, medical coding services',
  seoImage: '',
  status: 'published',
  published_at: new Date().toISOString()
};

async function seedAboutUsPage() {
  console.log('🌱 Starting About Us page seeder...\n');

  try {
    // Check if page already exists
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, title')
      .eq('slug', aboutUsPageData.slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingPage) {
      console.log(`⚠️  Page "${aboutUsPageData.title}" already exists with slug "${aboutUsPageData.slug}"`);
      console.log('   Updating existing page...\n');

      const { data: updatedPage, error: updateError } = await supabase
        .from('pages')
        .update({
          title: aboutUsPageData.title,
          content: aboutUsPageData.content,
          seo_title: aboutUsPageData.seoTitle,
          seo_description: aboutUsPageData.seoDescription,
          seo_keywords: aboutUsPageData.seoKeywords,
          seo_image: aboutUsPageData.seoImage,
          template: aboutUsPageData.template,
          status: aboutUsPageData.status,
          published_at: aboutUsPageData.published_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPage.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating page:', updateError);
        throw updateError;
      }

      console.log('✅ Successfully updated About Us page!');
      console.log(`   Page ID: ${updatedPage.id}`);
      console.log(`   Title: ${updatedPage.title}`);
      console.log(`   Slug: ${updatedPage.slug}`);
      console.log(`   Template: ${updatedPage.template}`);
      console.log(`   Status: ${updatedPage.status}\n`);
    } else {
      console.log(`📝 Creating new About Us page...\n`);

      const { data: newPage, error: insertError } = await supabase
        .from('pages')
        .insert({
          title: aboutUsPageData.title,
          slug: aboutUsPageData.slug,
          content: aboutUsPageData.content,
          seo_title: aboutUsPageData.seoTitle,
          seo_description: aboutUsPageData.seoDescription,
          seo_keywords: aboutUsPageData.seoKeywords,
          seo_image: aboutUsPageData.seoImage,
          template: aboutUsPageData.template,
          status: aboutUsPageData.status,
          published_at: aboutUsPageData.published_at
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating page:', insertError);
        throw insertError;
      }

      console.log('✅ Successfully created About Us page!');
      console.log(`   Page ID: ${newPage.id}`);
      console.log(`   Title: ${newPage.title}`);
      console.log(`   Slug: ${newPage.slug}`);
      console.log(`   Template: ${newPage.template}`);
      console.log(`   Status: ${newPage.status}\n`);
    }

    console.log('🎉 About Us page seeder completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Run the seeder
seedAboutUsPage()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
