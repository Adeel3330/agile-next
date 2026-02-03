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

// Software Page Data from https://agilenexussolution.com/Software.php
const softwarePageData = {
  title: 'Software',
  slug: 'software',
  template: 'software',
  content: `<h2>EHR / Practice Management Software</h2>
<p>Agile Nexus Solutions is a company that provides medical billing and coding services to Healthcare providers, physicians' offices, clinics, and other medical billing companies. Our employees have experience with an extensive list of software programs including the following:</p>

<h3>Virtual Manager, athoreline Product</h3>
<p>Virtual Manager is a powerful tool designed to streamline and optimize your revenue cycle management. It provides comprehensive solutions for medical practices and billing companies to manage their operations efficiently.</p>

<h3>Key Features</h3>
<ul>
  <li><strong>Revenue Cycle Management:</strong> Complete end-to-end management of your revenue cycle</li>
  <li><strong>Practice Management:</strong> Streamlined practice operations and workflow management</li>
  <li><strong>EHR Integration:</strong> Seamless integration with Electronic Health Records systems</li>
  <li><strong>Billing & Coding:</strong> Automated billing and coding processes for maximum efficiency</li>
  <li><strong>Reporting & Analytics:</strong> Comprehensive reporting and analytics for data-driven decisions</li>
  <li><strong>Patient Management:</strong> Complete patient demographics and information management</li>
</ul>

<h3>Why Choose Virtual Manager?</h3>
<p>Virtual Manager offers a comprehensive solution for healthcare providers looking to optimize their revenue cycle management. With years of experience in the medical billing industry, our team understands the unique challenges faced by healthcare practices and has developed solutions to address them effectively.</p>

<p>Our software is designed to integrate seamlessly with existing systems while providing powerful features that help reduce administrative burden, improve cash flow, and enhance overall practice efficiency.</p>

<h3>Request a Demo</h3>
<p>Interested in learning more about Virtual Manager? Contact us to request a demo or get more information about how our software can benefit your practice.</p>`,
  sections: JSON.stringify([
    {
      type: 'form',
      title: 'Request a Demo',
      description: 'Interested in learning more about our software solutions? Fill out the form below and our team will get back to you with more information and demo scheduling options.'
    },
    {
      type: 'features',
      title: 'Software Capabilities',
      items: [
        {
          title: 'Revenue Cycle Management',
          description: 'Complete end-to-end management of your revenue cycle with automated workflows and real-time tracking.',
          icon: 'icon-18'
        },
        {
          title: 'Practice Management',
          description: 'Streamlined practice operations with comprehensive workflow management and scheduling capabilities.',
          icon: 'icon-19'
        },
        {
          title: 'EHR Integration',
          description: 'Seamless integration with Electronic Health Records systems for unified data management.',
          icon: 'icon-20'
        },
        {
          title: 'Billing & Coding',
          description: 'Automated billing and coding processes with ICD-10 compliance and accuracy checks.',
          icon: 'icon-21'
        },
        {
          title: 'Reporting & Analytics',
          description: 'Comprehensive reporting and analytics dashboard for data-driven decision making.',
          icon: 'icon-22'
        },
        {
          title: 'Patient Management',
          description: 'Complete patient demographics, scheduling, and information management system.',
          icon: 'icon-23'
        }
      ]
    }
  ]),
  seoTitle: 'Software - Agile Nexus Solutions | EHR Practice Management Software',
  seoDescription: 'Discover Virtual Manager and our comprehensive EHR/Practice Management Software solutions. Streamline your revenue cycle management with our powerful tools designed for healthcare providers.',
  seoKeywords: 'EHR software, practice management software, Virtual Manager, revenue cycle management software, medical billing software, Agile Nexus Solutions',
  seoImage: '',
  status: 'published',
  published_at: new Date().toISOString()
};

async function seedSoftwarePage() {
  console.log('🌱 Starting Software page seeder...\n');

  try {
    // Check if page already exists
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, title')
      .eq('slug', softwarePageData.slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingPage) {
      console.log(`⚠️  Page "${softwarePageData.title}" already exists with slug "${softwarePageData.slug}"`);
      console.log('   Updating existing page...\n');

      const { data: updatedPage, error: updateError } = await supabase
        .from('pages')
        .update({
          title: softwarePageData.title,
          content: softwarePageData.content,
          sections: softwarePageData.sections,
          seo_title: softwarePageData.seoTitle,
          seo_description: softwarePageData.seoDescription,
          seo_keywords: softwarePageData.seoKeywords,
          seo_image: softwarePageData.seoImage,
          template: softwarePageData.template,
          status: softwarePageData.status,
          published_at: softwarePageData.published_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPage.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating page:', updateError);
        throw updateError;
      }

      console.log('✅ Successfully updated Software page!');
      console.log(`   Page ID: ${updatedPage.id}`);
      console.log(`   Title: ${updatedPage.title}`);
      console.log(`   Slug: ${updatedPage.slug}`);
      console.log(`   Template: ${updatedPage.template}`);
      console.log(`   Status: ${updatedPage.status}\n`);
    } else {
      console.log(`📝 Creating new Software page...\n`);

      const { data: newPage, error: insertError } = await supabase
        .from('pages')
        .insert({
          title: softwarePageData.title,
          slug: softwarePageData.slug,
          content: softwarePageData.content,
          sections: softwarePageData.sections,
          seo_title: softwarePageData.seoTitle,
          seo_description: softwarePageData.seoDescription,
          seo_keywords: softwarePageData.seoKeywords,
          seo_image: softwarePageData.seoImage,
          template: softwarePageData.template,
          status: softwarePageData.status,
          published_at: softwarePageData.published_at
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating page:', insertError);
        throw insertError;
      }

      console.log('✅ Successfully created Software page!');
      console.log(`   Page ID: ${newPage.id}`);
      console.log(`   Title: ${newPage.title}`);
      console.log(`   Slug: ${newPage.slug}`);
      console.log(`   Template: ${newPage.template}`);
      console.log(`   Status: ${newPage.status}\n`);
    }

    console.log('🎉 Software page seeder completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Run the seeder
seedSoftwarePage()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
