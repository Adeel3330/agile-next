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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Medical Billing Sliders and Careers Seeder
 * This script seeds:
 * - Sliders (with medical billing images and content)
 * - Careers (medical billing job positions)
 * 
 * All data is based on Agile Nexus Solutions medical billing company
 * 
 * Usage:
 *   npm run seed:sliders-careers
 */

// Helper function to get medical billing related Cloudinary images
// These are placeholder URLs - replace with actual medical billing images
function getMedicalBillingImage(index: number = 1): string {
  // Using Cloudinary demo images as placeholders - replace with actual medical billing images
  const images = [
    'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Medical billing office
    'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/v1312461204/sample.jpg', // Healthcare billing
    'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/v1312461204/sample.jpg', // Revenue cycle
    'https://res.cloudinary.com/demo/image/upload/w_800,h_600,c_fill/v1312461204/sample.jpg', // Medical coding
  ];
  return images[index % images.length];
}

/**
 * Seed Sliders
 */
async function seedSliders() {
  console.log('🌱 Seeding Medical Billing Sliders...');

  const sliders = [
    {
      title: 'Expert Medical Billing Services for Healthcare Providers',
      description: '<p>Agile Nexus Solutions provides comprehensive medical billing and revenue cycle management services. We help healthcare providers maximize revenue, reduce denials, and focus on patient care.</p><p>With over 95% first submission rate and $50M+ in charges submitted, we deliver results that matter.</p>',
      file: getMedicalBillingImage(0),
      file_type: 'image',
      seo_title: 'Medical Billing Services | Healthcare Revenue Cycle Management',
      seo_content: 'Professional medical billing services for healthcare providers. Expert revenue cycle management, claims processing, and denial management.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'Revenue Cycle Management Solutions',
      description: '<p>Streamline your revenue cycle with our comprehensive RCM services. From eligibility verification to payment posting, we handle every step of the billing process.</p><p>Our team processes over 1000K+ charts coded and $25M+ in A/R annually, ensuring maximum revenue for your practice.</p>',
      file: getMedicalBillingImage(1),
      file_type: 'image',
      seo_title: 'Revenue Cycle Management | Healthcare Billing Solutions',
      seo_content: 'Complete revenue cycle management services including eligibility verification, claims submission, payment posting, and denial management.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'Medical Coding & Documentation Services',
      description: '<p>Accurate ICD-10 coding is essential for proper reimbursement. Our certified coders ensure compliance and maximize revenue through precise documentation and coding.</p><p>We specialize in all medical specialties including Urgent Care, Cardiology, Family Medicine, and more.</p>',
      file: getMedicalBillingImage(2),
      file_type: 'image',
      seo_title: 'Medical Coding Services | ICD-10 Coding & Documentation',
      seo_content: 'Professional medical coding services with certified coders. ICD-10 coding, documentation review, and compliance assurance.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'The Most Affordable Medical Billing Company in USA',
      description: '<p>Agile Nexus Solutions offers competitive pricing without compromising on quality. We deliver exceptional medical billing services at affordable rates.</p><p>Our transparent pricing and proven track record make us the preferred choice for healthcare providers nationwide.</p>',
      file: getMedicalBillingImage(3),
      file_type: 'image',
      seo_title: 'Affordable Medical Billing Services | Best Pricing in USA',
      seo_content: 'Affordable medical billing services with transparent pricing. Quality revenue cycle management at competitive rates for healthcare providers.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ];

  try {
    // Check if sliders already exist
    const { data: existing } = await supabaseAdmin
      .from('sliders')
      .select('title')
      .is('deleted_at', null);

    if (existing && existing.length > 0) {
      console.log('   ⚠️  Sliders already exist, skipping...');
      console.log(`   💡 Found ${existing.length} existing slider(s). Delete them first if you want to reseed.`);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('sliders')
      .insert(sliders)
      .select();

    if (error) {
      console.error('   ❌ Error seeding sliders:', error);
      return;
    }

    console.log(`   ✅ Successfully seeded ${data.length} medical billing slider(s)`);
  } catch (error) {
    console.error('   ❌ Error seeding sliders:', error);
  }
}

/**
 * Seed Careers
 */
async function seedCareers() {
  console.log('🌱 Seeding Medical Billing Careers...');

  const careers = [
    {
      title: 'Medical Billing Specialist',
      department: 'Billing Operations',
      location: 'Remote / St. Petersburg, FL',
      type: 'Full-time',
      status: 'open',
      description: '<p>We are seeking an experienced Medical Billing Specialist to join our growing team. The ideal candidate will have a strong background in medical billing, claims processing, and revenue cycle management.</p><p><strong>Key Responsibilities:</strong></p><ul><li>Process and submit medical claims to insurance companies</li><li>Verify patient eligibility and benefits</li><li>Post payments and process denials</li><li>Follow up on outstanding accounts receivable</li><li>Maintain accurate patient billing records</li><li>Ensure compliance with HIPAA and billing regulations</li></ul>',
      requirements: '<p><strong>Requirements:</strong></p><ul><li>Minimum 2 years of medical billing experience</li><li>Knowledge of ICD-10 and CPT coding</li><li>Experience with various insurance payers (Medicare, Medicaid, Commercial)</li><li>Strong attention to detail and accuracy</li><li>Excellent communication skills</li><li>Proficiency in medical billing software</li><li>High school diploma or equivalent (Associate degree preferred)</li></ul>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'Medical Coder (ICD-10)',
      department: 'Coding & Documentation',
      location: 'Remote / St. Petersburg, FL',
      type: 'Full-time',
      status: 'open',
      description: '<p>Join our coding team as a Medical Coder specializing in ICD-10 coding. You will be responsible for accurately coding medical records and ensuring compliance with coding guidelines.</p><p><strong>Key Responsibilities:</strong></p><ul><li>Review and analyze medical records</li><li>Assign appropriate ICD-10 and CPT codes</li><li>Ensure coding accuracy and compliance</li><li>Work with physicians to clarify documentation</li><li>Maintain coding productivity standards</li><li>Stay updated with coding changes and guidelines</li></ul>',
      requirements: '<p><strong>Requirements:</strong></p><ul><li>Certified Professional Coder (CPC) or Certified Coding Specialist (CCS) certification</li><li>Minimum 3 years of medical coding experience</li><li>Strong knowledge of ICD-10-CM and CPT coding systems</li><li>Experience with multiple medical specialties</li><li>Excellent analytical and problem-solving skills</li><li>Detail-oriented with high accuracy</li><li>Associate degree in Health Information Management or related field</li></ul>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'Revenue Cycle Manager',
      department: 'Management',
      location: 'St. Petersburg, FL',
      type: 'Full-time',
      status: 'open',
      description: '<p>We are looking for an experienced Revenue Cycle Manager to oversee our billing operations and optimize revenue collection processes.</p><p><strong>Key Responsibilities:</strong></p><ul><li>Manage and supervise billing team</li><li>Monitor key performance indicators (KPIs)</li><li>Develop and implement revenue cycle strategies</li><li>Analyze denial trends and implement corrective actions</li><li>Ensure compliance with healthcare regulations</li><li>Collaborate with clients to optimize revenue</li><li>Prepare and present revenue reports</li></ul>',
      requirements: '<p><strong>Requirements:</strong></p><ul><li>Bachelor\'s degree in Healthcare Administration, Business, or related field</li><li>Minimum 5 years of revenue cycle management experience</li><li>Strong leadership and team management skills</li><li>Proficiency in revenue cycle analytics</li><li>Knowledge of healthcare billing regulations</li><li>Excellent problem-solving and decision-making abilities</li><li>Certification in Healthcare Financial Management (preferred)</li></ul>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'Claims Processing Specialist',
      department: 'Billing Operations',
      location: 'Remote',
      type: 'Full-time',
      status: 'open',
      description: '<p>Seeking a Claims Processing Specialist to handle insurance claim submissions, follow-ups, and resolution of claim issues.</p><p><strong>Key Responsibilities:</strong></p><ul><li>Submit claims electronically and via paper</li><li>Monitor claim status and follow up on pending claims</li><li>Resolve claim rejections and denials</li><li>Verify claim accuracy before submission</li><li>Maintain claim submission logs</li><li>Communicate with insurance companies regarding claim issues</li></ul>',
      requirements: '<p><strong>Requirements:</strong></p><ul><li>1-2 years of medical claims processing experience</li><li>Knowledge of claim submission processes</li><li>Familiarity with clearinghouse systems</li><li>Strong organizational skills</li><li>Ability to work independently</li><li>High school diploma or equivalent</li></ul>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'AR Follow-up Specialist',
      department: 'Accounts Receivable',
      location: 'Remote / St. Petersburg, FL',
      type: 'Full-time',
      status: 'open',
      description: '<p>Join our Accounts Receivable team to manage outstanding balances and maximize revenue collection.</p><p><strong>Key Responsibilities:</strong></p><ul><li>Follow up on unpaid claims and patient balances</li><li>Investigate payment delays and denials</li><li>Appeal denied claims when appropriate</li><li>Contact insurance companies and patients regarding outstanding balances</li><li>Maintain accurate AR aging reports</li><li>Work towards reducing days in AR</li></ul>',
      requirements: '<p><strong>Requirements:</strong></p><ul><li>2+ years of AR follow-up experience in healthcare</li><li>Strong negotiation and communication skills</li><li>Knowledge of insurance payer processes</li><li>Experience with appeals and claim resubmission</li><li>Proficiency in Excel and billing software</li><li>High school diploma or equivalent</li></ul>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      title: 'Patient Demographics Entry Specialist',
      department: 'Data Entry',
      location: 'Remote',
      type: 'Part-time',
      status: 'open',
      description: '<p>We need a detail-oriented individual to handle patient demographics entry and data verification.</p><p><strong>Key Responsibilities:</strong></p><ul><li>Enter patient demographic information accurately</li><li>Verify insurance information</li><li>Update patient records as needed</li><li>Ensure data accuracy and completeness</li><li>Maintain confidentiality of patient information</li></ul>',
      requirements: '<p><strong>Requirements:</strong></p><ul><li>High school diploma or equivalent</li><li>Fast and accurate typing skills (50+ WPM)</li><li>Attention to detail</li><li>Basic computer skills</li><li>Ability to work independently</li><li>Previous data entry experience (preferred)</li></ul>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  try {
    // Check if careers already exist
    const { data: existing } = await supabaseAdmin
      .from('careers')
      .select('title')
      .eq('status', 'open');

    if (existing && existing.length > 0) {
      console.log('   ⚠️  Careers already exist, skipping...');
      console.log(`   💡 Found ${existing.length} existing career(s). Delete them first if you want to reseed.`);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('careers')
      .insert(careers)
      .select();

    if (error) {
      console.error('   ❌ Error seeding careers:', error);
      return;
    }

    console.log(`   ✅ Successfully seeded ${data.length} medical billing career(s)`);
  } catch (error) {
    console.error('   ❌ Error seeding careers:', error);
  }
}

/**
 * Main seeding function
 */
async function seedAll() {
  console.log('🚀 Starting Medical Billing Sliders & Careers Seeding...\n');

  try {
    await seedSliders();
    await seedCareers();

    console.log('\n✅ Medical Billing Sliders & Careers seeding completed successfully!');
    console.log('\n📝 Note:');
    console.log('   - Replace placeholder image URLs with actual medical billing images from Cloudinary');
    console.log('   - Update job descriptions and requirements as needed for your organization');
    console.log('   - All content is focused on medical billing and revenue cycle management');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedAll();
