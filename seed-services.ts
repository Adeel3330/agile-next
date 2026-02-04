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

// Service Categories Data from https://agilenexussolution.com/
// These will be created as children of the "service-categories" parent in blog_categories table
const serviceCategories = [
  {
    name: 'Physicians/Medical Groups',
    slug: 'physicians-medical-groups',
    description: 'Comprehensive medical billing services for physicians and medical groups',
    parent_slug: 'service-categories', // Parent slug in blog_categories
    display_order: 1,
    status: 'active'
  },
  {
    name: 'Medical Billing Companies',
    slug: 'medical-billing-companies',
    description: 'Specialized services for medical billing companies',
    parent_slug: 'service-categories',
    display_order: 2,
    status: 'active'
  },
  {
    name: 'Revenue Cycle Management',
    slug: 'revenue-cycle-management',
    description: 'Complete revenue cycle management services to optimize your practice\'s financial performance',
    parent_slug: 'service-categories',
    display_order: 3,
    status: 'active'
  }
];

// Services Data from https://agilenexussolution.com/
const services = [
  {
    title: 'Eligibility & Benefits Verification',
    slug: 'eligibility-benefits-verification',
    description: 'Communicating with insurance carriers on your behalf, keeping you compliant while saving you time and money.',
    content: '<p>Our eligibility and benefits verification service ensures that you have accurate information about patient coverage before services are rendered. We communicate directly with insurance carriers to verify:</p><ul><li>Patient eligibility status</li><li>Coverage benefits and limitations</li><li>Deductibles and copayments</li><li>Authorization requirements</li></ul><p>This proactive approach helps prevent claim denials and ensures you get paid for the services you provide.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-18',
    display_order: 1,
    status: 'active',
    seo_title: 'Eligibility & Benefits Verification Services | Agile Nexus Solutions',
    seo_description: 'Professional eligibility and benefits verification services for healthcare providers. Verify patient coverage, benefits, and authorization requirements to prevent claim denials.',
    seo_keywords: 'eligibility verification, benefits verification, insurance verification, medical billing, revenue cycle management',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Patients Demographics Entry & Authorizations',
    slug: 'patients-demographics-entry-authorizations',
    description: 'Our scrubbing tools help automate and ensure accurate patient information.',
    content: '<p>Accurate patient demographics are crucial for successful claim processing. Our advanced scrubbing tools help automate and ensure accurate patient information entry, including:</p><ul><li>Patient demographics validation</li><li>Insurance information verification</li><li>Prior authorization management</li><li>Real-time eligibility checks</li></ul><p>We help reduce errors and improve your first-pass claim acceptance rate.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-19',
    display_order: 2,
    status: 'active',
    seo_title: 'Patient Demographics Entry & Authorizations | Agile Nexus Solutions',
    seo_description: 'Automated patient demographics entry and authorization services. Our scrubbing tools ensure accurate patient information for faster claim processing.',
    seo_keywords: 'patient demographics, authorization management, medical billing automation, claim processing',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Coding – ICD 10',
    slug: 'coding-icd-10',
    description: 'Our coders are AAPC certified and are specialists in their role. The results are faster and accurate reimbursements.',
    content: '<p>Accurate medical coding is essential for proper reimbursement. Our AAPC-certified coders specialize in ICD-10 coding and ensure:</p><ul><li>Accurate diagnosis coding (ICD-10)</li><li>Proper procedure coding (CPT/HCPCS)</li><li>Compliance with coding guidelines</li><li>Faster claim processing and reimbursements</li></ul><p>Our expert coders stay up-to-date with the latest coding changes and regulations to maximize your revenue.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-20',
    display_order: 3,
    status: 'active',
    seo_title: 'ICD-10 Medical Coding Services | AAPC Certified Coders | Agile Nexus',
    seo_description: 'Professional ICD-10 medical coding services by AAPC certified coders. Accurate coding for faster reimbursements and improved revenue cycle management.',
    seo_keywords: 'ICD-10 coding, medical coding services, AAPC certified coders, CPT coding, HCPCS coding',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Charge Capture',
    slug: 'charge-capture',
    description: 'Decreasing the cycle of slow or no-pay from insurance companies.',
    content: '<p>Efficient charge capture is critical for revenue optimization. Our charge capture services help:</p><ul><li>Capture all billable services accurately</li><li>Reduce charge lag time</li><li>Minimize lost charges</li><li>Improve cash flow</li></ul><p>We help decrease the cycle of slow or no-pay from insurance companies by ensuring charges are captured and submitted promptly.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-21',
    display_order: 4,
    status: 'active',
    seo_title: 'Charge Capture Services | Medical Billing | Agile Nexus Solutions',
    seo_description: 'Professional charge capture services to reduce payment delays. Capture all billable services accurately and improve your practice\'s cash flow.',
    seo_keywords: 'charge capture, medical billing, revenue cycle, cash flow improvement',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Claims Submission',
    slug: 'claims-submission',
    description: 'Streamlining the management of insurance claims and maximizing revenue.',
    content: '<p>Efficient claims submission is key to getting paid quickly. Our claims submission services include:</p><ul><li>Electronic claims submission (EDI)</li><li>Paper claims when necessary</li><li>Real-time claim status tracking</li><li>Automated claim scrubbing</li></ul><p>We streamline the management of insurance claims to maximize your revenue and reduce administrative burden.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-22',
    display_order: 5,
    status: 'active',
    seo_title: 'Claims Submission Services | Electronic Claims Processing | Agile Nexus',
    seo_description: 'Streamlined claims submission services for healthcare providers. Electronic and paper claims processing to maximize revenue and reduce administrative burden.',
    seo_keywords: 'claims submission, electronic claims, EDI claims, medical billing, insurance claims',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Claims Audit (Fix Rejections)',
    slug: 'claims-audit-fix-rejections',
    description: 'Providing a rapid response to any claim issue that arises, so you get paid.',
    content: '<p>When claims are rejected, time is money. Our claims audit and rejection fix services provide:</p><ul><li>Rapid response to claim rejections</li><li>Root cause analysis</li><li>Correction and resubmission</li><li>Preventive measures to avoid future rejections</li></ul><p>We provide a rapid response to any claim issue that arises, so you get paid faster.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-23',
    display_order: 6,
    status: 'active',
    seo_title: 'Claims Audit & Rejection Fix Services | Agile Nexus Solutions',
    seo_description: 'Professional claims audit and rejection fix services. Rapid response to claim issues to ensure you get paid. Root cause analysis and preventive measures.',
    seo_keywords: 'claims audit, claim rejections, fix rejections, medical billing, revenue recovery',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Payment Posting',
    slug: 'payment-posting',
    description: 'Identifying issues such as denials for medical necessities, non-covered services, and reveal prior authorizations.',
    content: '<p>Accurate payment posting is essential for financial clarity. Our payment posting services help:</p><ul><li>Post payments accurately and timely</li><li>Identify denial reasons</li><li>Track underpayments and overpayments</li><li>Reconcile payments with expected amounts</li></ul><p>We identify issues such as denials for medical necessities, non-covered services, and reveal prior authorization problems.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-24',
    display_order: 7,
    status: 'active',
    seo_title: 'Payment Posting Services | Medical Billing | Agile Nexus Solutions',
    seo_description: 'Accurate payment posting services for healthcare providers. Track payments, identify denials, and reconcile accounts to improve financial clarity.',
    seo_keywords: 'payment posting, medical billing, payment reconciliation, denial management',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Denial Management',
    slug: 'denial-management',
    description: 'Reduce revenue losses and increase cash flow, without the delays from denied claims.',
    content: '<p>Effective denial management is crucial for revenue optimization. Our denial management services include:</p><ul><li>Denial analysis and tracking</li><li>Appeal preparation and submission</li><li>Root cause identification</li><li>Preventive measures implementation</li></ul><p>We help reduce revenue losses and increase cash flow, without the delays from denied claims.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-25',
    display_order: 8,
    status: 'active',
    seo_title: 'Denial Management Services | Medical Billing | Agile Nexus Solutions',
    seo_description: 'Professional denial management services to reduce revenue losses. Appeal denials, identify root causes, and implement preventive measures.',
    seo_keywords: 'denial management, claim denials, appeal denials, revenue recovery, medical billing',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'AR Follow Up',
    slug: 'ar-follow-up',
    description: 'Eliminating A/R issues and reducing late payments.',
    content: '<p>Proactive accounts receivable follow-up is essential for maintaining healthy cash flow. Our AR follow-up services include:</p><ul><li>Systematic follow-up on outstanding claims</li><li>Insurance and patient balance collection</li><li>Aging report analysis</li><li>Collection strategies implementation</li></ul><p>We help eliminate A/R issues and reduce late payments to improve your practice\'s financial health.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-26',
    display_order: 9,
    status: 'active',
    seo_title: 'AR Follow Up Services | Accounts Receivable Management | Agile Nexus',
    seo_description: 'Professional AR follow-up services to eliminate accounts receivable issues. Systematic follow-up on outstanding claims and reduce late payments.',
    seo_keywords: 'AR follow up, accounts receivable, medical billing, collection services',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Patient Statements & Follow Up',
    slug: 'patient-statements-follow-up',
    description: 'Handling patient statements and follow ups to ensure accurate claim processing.',
    content: '<p>Effective patient billing and follow-up improves collections and patient satisfaction. Our services include:</p><ul><li>Patient statement generation and mailing</li><li>Payment plan management</li><li>Patient balance follow-up</li><li>Customer service support</li></ul><p>We handle patient statements and follow-ups to ensure accurate claim processing and timely collections.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-27',
    display_order: 10,
    status: 'active',
    seo_title: 'Patient Statements & Follow Up Services | Agile Nexus Solutions',
    seo_description: 'Professional patient statement and follow-up services. Generate statements, manage payment plans, and improve patient collections.',
    seo_keywords: 'patient statements, patient billing, patient collections, medical billing',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Credit Balance Solution',
    slug: 'credit-balance-solution',
    description: 'Eliminating financial stress by providing a self-service tool that helps you achieve the highest balance accuracy.',
    content: '<p>Credit balance management is critical for compliance and financial accuracy. Our credit balance solution provides:</p><ul><li>Credit balance identification and tracking</li><li>Refund processing</li><li>Compliance management</li><li>Self-service tools for balance accuracy</li></ul><p>We help eliminate financial stress by providing tools that help you achieve the highest balance accuracy.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-28',
    display_order: 11,
    status: 'active',
    seo_title: 'Credit Balance Solution | Medical Billing | Agile Nexus Solutions',
    seo_description: 'Professional credit balance management solution. Track credits, process refunds, and maintain compliance with self-service tools.',
    seo_keywords: 'credit balance, refund processing, medical billing compliance, balance accuracy',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Credentialing & Enrollment',
    slug: 'credentialing-enrollment',
    description: 'Identifying and resolving potential administrative issues before they impact reimbursements.',
    content: '<p>Proper credentialing and enrollment is essential for network participation. Our services include:</p><ul><li>Provider credentialing</li><li>Insurance network enrollment</li><li>Re-credentialing management</li><li>Administrative issue resolution</li></ul><p>We identify and resolve potential administrative issues before they impact reimbursements.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-29',
    display_order: 12,
    status: 'active',
    seo_title: 'Credentialing & Enrollment Services | Healthcare Providers | Agile Nexus',
    seo_description: 'Professional credentialing and enrollment services for healthcare providers. Provider credentialing, insurance network enrollment, and administrative support.',
    seo_keywords: 'credentialing, provider enrollment, insurance network enrollment, healthcare credentialing',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'IPA Contracting',
    slug: 'ipa-contracting',
    description: 'We offer comprehensive IPA(Independent Practice/Physician Association) contracting services to healthcare providers across the US, streamlining agreements with payers for optimized network participation. Enhance your practice\'s network access and reimbursement potential with our expert IPA contracting solutions nationwide.',
    content: '<p>IPA contracting services help healthcare providers optimize their network participation and reimbursement potential. Our comprehensive services include:</p><ul><li>IPA contract negotiation</li><li>Payer agreement management</li><li>Network participation optimization</li><li>Reimbursement rate analysis</li></ul><p>We offer comprehensive IPA (Independent Practice/Physician Association) contracting services to healthcare providers across the US, streamlining agreements with payers for optimized network participation. Enhance your practice\'s network access and reimbursement potential with our expert IPA contracting solutions nationwide.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-30',
    display_order: 13,
    status: 'active',
    seo_title: 'IPA Contracting Services | Healthcare Network Participation | Agile Nexus',
    seo_description: 'Comprehensive IPA contracting services for healthcare providers. Optimize network participation and reimbursement potential with expert contracting solutions.',
    seo_keywords: 'IPA contracting, physician association contracting, network participation, healthcare contracts',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  {
    title: 'Virtual Assistance',
    slug: 'virtual-assistance',
    description: 'We provide 24/7 Assistance, Appointment Scheduling, Prior Authorizations, Eligibility and Benefits Verification, and Patient Help Desk services to doctor offices.',
    content: '<p>Our virtual assistance services provide comprehensive support for doctor offices, including:</p><ul><li>24/7 assistance and support</li><li>Appointment scheduling</li><li>Prior authorization management</li><li>Eligibility and benefits verification</li><li>Patient help desk services</li></ul><p>We provide 24/7 assistance, appointment scheduling, prior authorizations, eligibility and benefits verification, and patient help desk services to doctor offices.</p>',
    category_slug: 'revenue-cycle-management',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    icon: 'icon-31',
    display_order: 14,
    status: 'active',
    seo_title: 'Virtual Assistance Services | 24/7 Medical Office Support | Agile Nexus',
    seo_description: '24/7 virtual assistance services for doctor offices. Appointment scheduling, prior authorizations, eligibility verification, and patient help desk support.',
    seo_keywords: 'virtual assistance, medical office support, appointment scheduling, patient help desk, 24/7 support',
    seo_image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  }
];

async function seedServiceCategories() {
  console.log('🌱 Seeding service categories...');

  // First, ensure the parent category "service-categories" exists in blog_categories
  let parentCategoryId: string | null = null;
  
  const { data: existingParent } = await supabase
    .from('blog_categories')
    .select('id')
    .eq('slug', 'service-categories')
    .is('deleted_at', null)
    .maybeSingle();

  if (existingParent) {
    parentCategoryId = existingParent.id;
    console.log('✅ Parent category "service-categories" already exists');
  } else {
    // Create the parent category
    const { data: parentData, error: parentError } = await supabase
      .from('blog_categories')
      .insert({
        name: 'Service Categories',
        slug: 'service-categories',
        description: 'Root category for all service categories',
        parent_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (parentError) {
      console.error('❌ Error creating parent category "service-categories":', parentError);
      return new Map();
    }

    parentCategoryId = parentData.id;
    console.log('✅ Created parent category "service-categories"');
  }

  const categoryMap = new Map<string, string>();

  for (const category of serviceCategories) {
    try {
      // Check if category already exists
      const { data: existing } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', category.slug)
        .is('deleted_at', null)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Category "${category.name}" already exists, skipping...`);
        categoryMap.set(category.slug, existing.id);
        continue;
      }

      const { data, error } = await supabase
        .from('blog_categories')
        .insert({
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: parentCategoryId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating category "${category.name}":`, error);
        continue;
      }

      console.log(`✅ Created category: ${category.name}`);
      categoryMap.set(category.slug, data.id);
    } catch (err) {
      console.error(`❌ Error processing category "${category.name}":`, err);
    }
  }

  return categoryMap;
}

async function seedServices(categoryMap: Map<string, string>) {
  console.log('\n🌱 Seeding services...');

  for (const service of services) {
    try {
      // Check if service already exists
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .eq('slug', service.slug)
        .is('deleted_at', null)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Service "${service.title}" already exists, skipping...`);
        continue;
      }

      // Get category ID
      const categoryId = categoryMap.get(service.category_slug);
      if (!categoryId) {
        console.error(`❌ Category "${service.category_slug}" not found for service "${service.title}"`);
        continue;
      }

      const { data, error } = await supabase
        .from('services')
        .insert({
          title: service.title,
          slug: service.slug,
          description: service.description,
          content: service.content,
          category_id: categoryId,
          image_url: service.image_url,
          icon: service.icon,
          display_order: service.display_order,
          status: service.status,
          seo_title: service.seo_title,
          seo_description: service.seo_description,
          seo_keywords: service.seo_keywords,
          seo_image: service.seo_image,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating service "${service.title}":`, error);
        continue;
      }

      console.log(`✅ Created service: ${service.title}`);
    } catch (err) {
      console.error(`❌ Error processing service "${service.title}":`, err);
    }
  }
}

async function main() {
  console.log('🚀 Starting services seeder...\n');

  try {
    // Seed categories first
    const categoryMap = await seedServiceCategories();

    // Then seed services
    await seedServices(categoryMap);

    console.log('\n✨ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
