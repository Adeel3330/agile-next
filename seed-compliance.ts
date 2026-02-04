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

// Compliance Page Data from https://agilenexussolution.com/
// Based on typical compliance requirements for medical billing companies
const compliancePageData = {
  title: 'Compliance',
  slug: 'compliance',
  template: 'compliance',
  content: `<h2>Compliance & Regulatory Standards</h2>
<p>At Agile Nexus Solutions, we are committed to maintaining the highest standards of compliance and regulatory adherence in all aspects of our medical billing and revenue cycle management services. We understand the critical importance of protecting patient information and ensuring that all operations comply with federal and state regulations.</p>

<h3>HIPAA Compliance</h3>
<p>We are fully compliant with the Health Insurance Portability and Accountability Act (HIPAA) regulations. Our comprehensive HIPAA compliance program includes:</p>
<ul>
  <li>Strict access controls and authentication measures</li>
  <li>Encrypted data transmission and storage</li>
  <li>Regular security audits and risk assessments</li>
  <li>Employee training and certification programs</li>
  <li>Business Associate Agreements (BAAs) with all partners</li>
  <li>Incident response and breach notification procedures</li>
</ul>

<h3>Regulatory Compliance</h3>
<p>Our services adhere to all relevant healthcare regulations including:</p>
<ul>
  <li><strong>CMS Guidelines:</strong> Compliance with Centers for Medicare & Medicaid Services billing requirements</li>
  <li><strong>State Regulations:</strong> Adherence to state-specific healthcare billing regulations</li>
  <li><strong>ICD-10 Coding Standards:</strong> Accurate and up-to-date medical coding practices</li>
  <li><strong>Fraud and Abuse Prevention:</strong> Implementation of safeguards against healthcare fraud</li>
  <li><strong>Audit Readiness:</strong> Maintaining documentation and records for regulatory audits</li>
</ul>

<h3>Data Security</h3>
<p>We employ industry-leading security measures to protect sensitive healthcare information:</p>
<ul>
  <li>End-to-end encryption for all data transmissions</li>
  <li>Secure cloud infrastructure with regular backups</li>
  <li>Multi-factor authentication for system access</li>
  <li>Regular security updates and patch management</li>
  <li>24/7 monitoring and threat detection</li>
</ul>

<h3>Quality Assurance</h3>
<p>Our quality assurance processes ensure accuracy and compliance:</p>
<ul>
  <li>Multi-level review of all claims before submission</li>
  <li>Automated validation checks for coding accuracy</li>
  <li>Regular compliance training for all staff members</li>
  <li>Continuous monitoring and improvement of processes</li>
  <li>Documentation of all compliance activities</li>
</ul>

<h3>Our Commitment</h3>
<p>Compliance is not just a requirement—it's a core value at Agile Nexus Solutions. We continuously invest in technology, training, and processes to ensure we meet and exceed all regulatory standards. Our clients can trust that their billing operations are in full compliance with all applicable laws and regulations.</p>`,
  sections: JSON.stringify([
    {
      type: 'form',
      title: 'Contact Us for Compliance Information',
      description: 'Have questions about our compliance standards or need more information? Please fill out the form below and our compliance team will get back to you.'
    },
    {
      type: 'features',
      title: 'Key Compliance Areas',
      items: [
        {
          title: 'HIPAA Compliance',
          description: 'Fully compliant with Health Insurance Portability and Accountability Act regulations, ensuring patient data protection and privacy.',
          icon: 'icon-18'
        },
        {
          title: 'CMS Guidelines',
          description: 'Adherence to Centers for Medicare & Medicaid Services billing requirements and guidelines.',
          icon: 'icon-19'
        },
        {
          title: 'State Regulations',
          description: 'Compliance with state-specific healthcare billing regulations across all 50 states.',
          icon: 'icon-20'
        },
        {
          title: 'ICD-10 Standards',
          description: 'Accurate and up-to-date medical coding practices following ICD-10 coding standards.',
          icon: 'icon-21'
        },
        {
          title: 'Fraud Prevention',
          description: 'Implementation of comprehensive safeguards against healthcare fraud and abuse.',
          icon: 'icon-22'
        },
        {
          title: 'Data Security',
          description: 'End-to-end encryption and industry-leading security measures to protect sensitive information.',
          icon: 'icon-23'
        }
      ]
    },
    {
      type: 'stats',
      items: [
        {
          label: 'Years of Compliance',
          value: '15',
          suffix: '+',
          icon: 'icon-37'
        },
        {
          label: 'Compliance Certifications',
          value: '100',
          suffix: '%',
          icon: 'icon-38'
        },
        {
          label: 'Audit Success Rate',
          value: '99',
          suffix: '%',
          icon: 'icon-39'
        },
        {
          label: 'Data Security Level',
          value: 'Enterprise',
          icon: 'icon-40'
        }
      ]
    },
    {
      type: 'content',
      title: 'Compliance Certifications',
      content: '<p>We maintain various certifications and undergo regular audits to ensure our compliance standards are met.</p>'
    },
    {
      type: 'list',
      title: 'Regulatory Standards',
      items: [
        'HIPAA Privacy and Security Rules',
        'CMS Billing Guidelines',
        'State Healthcare Regulations',
        'ICD-10 Coding Standards',
        'Fraud and Abuse Prevention',
        'Data Security and Encryption'
      ]
    }
  ]),
  seoTitle: 'Compliance - Agile Nexus Solutions | HIPAA Compliant Medical Billing',
  seoDescription: 'Learn about Agile Nexus Solutions compliance standards, HIPAA compliance, and regulatory adherence for medical billing services. We maintain the highest standards of data security and regulatory compliance.',
  seoKeywords: 'compliance, HIPAA compliance, medical billing compliance, healthcare regulations, CMS guidelines, data security, Agile Nexus Solutions',
  seoImage: '',
  status: 'published',
  published_at: new Date().toISOString()
};

async function seedCompliancePage() {
  console.log('🌱 Starting Compliance page seeder...\n');

  try {
    // Check if page already exists
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id, title')
      .eq('slug', compliancePageData.slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingPage) {
      console.log(`⚠️  Page "${compliancePageData.title}" already exists with slug "${compliancePageData.slug}"`);
      console.log('   Updating existing page...\n');

      const { data: updatedPage, error: updateError } = await supabase
        .from('pages')
        .update({
          title: compliancePageData.title,
          content: compliancePageData.content,
          sections: compliancePageData.sections,
          seo_title: compliancePageData.seoTitle,
          seo_description: compliancePageData.seoDescription,
          seo_keywords: compliancePageData.seoKeywords,
          seo_image: compliancePageData.seoImage,
          template: compliancePageData.template,
          status: compliancePageData.status,
          published_at: compliancePageData.published_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPage.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating page:', updateError);
        throw updateError;
      }

      console.log('✅ Successfully updated Compliance page!');
      console.log(`   Page ID: ${updatedPage.id}`);
      console.log(`   Title: ${updatedPage.title}`);
      console.log(`   Slug: ${updatedPage.slug}`);
      console.log(`   Template: ${updatedPage.template}`);
      console.log(`   Status: ${updatedPage.status}\n`);
    } else {
      console.log(`📝 Creating new Compliance page...\n`);

      const { data: newPage, error: insertError } = await supabase
        .from('pages')
        .insert({
          title: compliancePageData.title,
          slug: compliancePageData.slug,
          content: compliancePageData.content,
          sections: compliancePageData.sections,
          seo_title: compliancePageData.seoTitle,
          seo_description: compliancePageData.seoDescription,
          seo_keywords: compliancePageData.seoKeywords,
          seo_image: compliancePageData.seoImage,
          template: compliancePageData.template,
          status: compliancePageData.status,
          published_at: compliancePageData.published_at
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating page:', insertError);
        throw insertError;
      }

      console.log('✅ Successfully created Compliance page!');
      console.log(`   Page ID: ${newPage.id}`);
      console.log(`   Title: ${newPage.title}`);
      console.log(`   Slug: ${newPage.slug}`);
      console.log(`   Template: ${newPage.template}`);
      console.log(`   Status: ${newPage.status}\n`);
    }

    console.log('🎉 Compliance page seeder completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Run the seeder
seedCompliancePage()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
