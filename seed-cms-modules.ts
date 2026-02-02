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
 * CMS Modules Seeders
 * This script seeds:
 * - Pages CMS
 * - Media Management
 * - Affiliates
 * - System Settings
 * 
 * All data is based on Agile Nexus Solutions website:
 * https://agilenexussolution.com/
 * 
 * Usage:
 *   npm run seed:cms-modules
 */

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to get Cloudinary placeholder URL
function getPlaceholderImage(): string {
  return 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';
}

// Helper function to get Supabase Storage placeholder URL
function getStoragePlaceholderImage(): string {
  // This should be replaced with actual Supabase Storage URL after uploading
  return 'https://via.placeholder.com/800x600';
}

/**
 * Seed Pages CMS
 */
async function seedPages() {
  console.log('🌱 Seeding Pages CMS...');

  const pages = [
    {
      title: 'About Us',
      slug: 'about',
      content: '<h2>Welcome to Agile Nexus Solutions</h2><p>Agile Nexus Solutions provides medical billing and coding services to healthcare providers in the United States. Our mission is to be a trusted and valued healthcare partner offering advanced revenue cycle management services with dedication and integrity.</p><p>We pride ourselves on exceeding expectations and maintaining a commitment to excellent service. Agile Nexus Solutions is committed to the future of medical billing with an investment in new technology and people while continuing to provide excellent service.</p><p>We deliver what we promise. Agile Nexus Solutions offers revenue cycle management services to Healthcare Providers and Medical Billing Companies across the USA. Our goal is to help you manage your business in a way where you can focus on patient care and operations, not paperwork!</p>',
      sections: JSON.stringify([
        {
          type: 'hero',
          title: 'Expertise and compassion saved my life',
          subtitle: 'About the company',
          image: getPlaceholderImage(),
          cta: {
            text: 'Learn More',
            link: '/contact'
          }
        },
        {
          type: 'stats',
          items: [
            { label: 'First Submission Rate', value: 95, suffix: '%', icon: 'icon-37' },
            { label: 'Charts Coded', value: 1000, suffix: 'K+', icon: 'icon-38' },
            { label: 'Charges Submitted', value: 50, suffix: 'M+', icon: 'icon-39' },
            { label: 'A/R Processed', value: 25, suffix: 'M+', icon: 'icon-40' }
          ]
        },
        {
          type: 'content',
          title: 'Our Specialities',
          items: [
            'Preventive care',
            'Diagnostic testing',
            'Mental health services'
          ]
        }
      ]),
      seo_title: 'About Us - Agile Nexus Solutions | Medical Billing Company',
      seo_description: 'Learn about Agile Nexus Solutions, a trusted medical billing company providing revenue cycle management services to healthcare providers and medical billing companies across the USA.',
      seo_keywords: 'about us, agile nexus solutions, medical billing company, revenue cycle management, healthcare billing',
      seo_image: getPlaceholderImage(),
      status: 'published',
      template: 'about',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      content: '<h2>Reach Us!</h2><p>We are here to help you with all your medical billing needs. Contact Agile Nexus Solutions today to get started with our revenue cycle management services.</p><p><strong>Contact Information:</strong><br/>Phone: 1-727-635-4993<br/>Email: info@agilenexussolution.com<br/>Address: 7901 4th St N, St. Petersburg, FL 33702, USA</p><p><strong>Office Hours:</strong><br/>Monday - Friday: 9:00 AM - 6:00 PM EST<br/>Saturday: Closed<br/>Sunday: Closed</p>',
      sections: JSON.stringify([
        {
          type: 'hero',
          title: 'Contact Our Medical Center',
          subtitle: 'We are here to help',
          image: getPlaceholderImage()
        },
        {
          type: 'content',
          title: 'Contact Information',
          content: '<p>Phone: +1 (123) 456-7890<br/>Email: contact@medicalcenter.com<br/>Address: 123 Medical Street, Health City, HC 12345</p>'
        }
      ]),
      seo_title: 'Contact Us - Agile Nexus Solutions | Medical Billing Services',
      seo_description: 'Contact Agile Nexus Solutions for medical billing services. Phone: 1-727-635-4993. Located at 7901 4th St N, St. Petersburg, FL 33702, USA.',
      seo_keywords: 'contact, agile nexus solutions, medical billing contact, revenue cycle management contact',
      seo_image: getPlaceholderImage(),
      status: 'published',
      template: 'contact',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'Services',
      slug: 'services',
      content: '<h2>Our Services</h2><p>Agile Nexus Solutions proudly supports Healthcare providers, Physicians, Medical Groups, and Medical Billing Companies. We offer comprehensive revenue cycle management services including Eligibility & Benefits Verification, Coding – ICD 10, Claims Submission, Denial Management, AR Follow Up, Payment Posting, Credentialing & Enrollment, IPA Contracting, and Virtual Assistance.</p><p>We provide 24/7 services with quick turnaround time, cost-effective solutions, and advanced technology to help you focus on patient care while we handle your billing needs.</p>',
      sections: JSON.stringify([
        {
          type: 'hero',
          title: 'Comprehensive Medical Services',
          subtitle: 'Expert care for all your needs',
          image: getPlaceholderImage()
        },
        {
          type: 'features',
          items: [
            {
              title: 'Eligibility & Benefits Verification',
              description: 'Communicating with insurance carriers on your behalf, keeping you compliant while saving you time and money.',
              icon: 'icon-18'
            },
            {
              title: 'Coding – ICD 10',
              description: 'Our coders are AAPC certified and are specialists in their role. The results are faster and accurate reimbursements.',
              icon: 'icon-19'
            },
            {
              title: 'Claims Submission',
              description: 'Streamlining the management of insurance claims and maximizing revenue.',
              icon: 'icon-20'
            },
            {
              title: 'Denial Management',
              description: 'Reduce revenue losses and increase cash flow, without the delays from denied claims.',
              icon: 'icon-21'
            },
            {
              title: 'AR Follow Up',
              description: 'Eliminating A/R issues and reducing late payments.',
              icon: 'icon-22'
            },
            {
              title: 'Credentialing & Enrollment',
              description: 'Identifying and resolving potential administrative issues before they impact reimbursements.',
              icon: 'icon-23'
            }
          ]
        }
      ]),
      seo_title: 'Services - Agile Nexus Solutions | Revenue Cycle Management',
      seo_description: 'Explore our comprehensive revenue cycle management services including Eligibility & Benefits Verification, Coding ICD 10, Claims Submission, Denial Management, AR Follow Up, and more.',
      seo_keywords: 'medical billing services, revenue cycle management, eligibility verification, claims submission, denial management, AR follow up, credentialing',
      seo_image: getPlaceholderImage(),
      status: 'published',
      template: 'services',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ];

  try {
    // Check if pages already exist
    const { data: existingPages } = await supabaseAdmin
      .from('pages')
      .select('slug')
      .is('deleted_at', null);

    const existingSlugs = new Set(existingPages?.map(p => p.slug) || []);

    const pagesToInsert = pages.filter(page => !existingSlugs.has(page.slug));

    if (pagesToInsert.length === 0) {
      console.log('   ✓ Pages already exist, skipping...');
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('pages')
      .insert(pagesToInsert)
      .select();

    if (error) {
      console.error('   ❌ Error seeding pages:', error);
      return;
    }

    console.log(`   ✓ Successfully seeded ${data.length} pages`);
  } catch (error) {
    console.error('   ❌ Error seeding pages:', error);
  }
}

/**
 * Seed Media Management
 */
async function seedMedia() {
  console.log('🌱 Seeding Media Management...');

  const mediaItems = [
    {
      title: 'Agile Nexus Solutions Hero Image',
      description: 'Main hero image for the homepage banner - The Most Affordable Medical Billing Company',
      file_url: getStoragePlaceholderImage(),
      file_name: 'homepage-hero.jpg',
      file_size: 245678,
      file_type: 'image/jpeg',
      position: 'home',
      status: 'active',
      display_order: 1,
      alt_text: 'Agile Nexus Solutions - Expert Billing for Exceptional Care',
      link_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'About Agile Nexus Solutions',
      description: 'Image for the about us page',
      file_url: getStoragePlaceholderImage(),
      file_name: 'about-us.jpg',
      file_size: 189234,
      file_type: 'image/jpeg',
      position: 'about',
      status: 'active',
      display_order: 1,
      alt_text: 'About Agile Nexus Solutions - Medical Billing Company',
      link_url: '/about',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'Revenue Cycle Management Services',
      description: 'Banner image for services section',
      file_url: getStoragePlaceholderImage(),
      file_name: 'services-banner.jpg',
      file_size: 312456,
      file_type: 'image/jpeg',
      position: 'services',
      status: 'active',
      display_order: 1,
      alt_text: 'Revenue Cycle Management Services - Agile Nexus Solutions',
      link_url: '/services',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'Contact Agile Nexus Solutions',
      description: 'Image for contact page',
      file_url: getStoragePlaceholderImage(),
      file_name: 'contact-image.jpg',
      file_size: 198765,
      file_type: 'image/jpeg',
      position: 'contact',
      status: 'active',
      display_order: 1,
      alt_text: 'Contact Agile Nexus Solutions - Medical Billing Services',
      link_url: '/contact',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: '24/7 Services Feature',
      description: 'Feature image highlighting 24/7 services',
      file_url: getStoragePlaceholderImage(),
      file_name: 'home-feature-1.jpg',
      file_size: 223456,
      file_type: 'image/jpeg',
      position: 'home',
      status: 'active',
      display_order: 2,
      alt_text: '24/7 Medical Billing Services',
      link_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      title: 'Cost Effective Solutions',
      description: 'Feature image highlighting cost-effective solutions',
      file_url: getStoragePlaceholderImage(),
      file_name: 'home-feature-2.jpg',
      file_size: 256789,
      file_type: 'image/jpeg',
      position: 'home',
      status: 'active',
      display_order: 3,
      alt_text: 'Cost Effective Medical Billing Solutions',
      link_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ];

  try {
    // Check if media already exists
    const { data: existingMedia } = await supabaseAdmin
      .from('media')
      .select('title')
      .is('deleted_at', null);

    const existingTitles = new Set(existingMedia?.map(m => m.title) || []);

    const mediaToInsert = mediaItems.filter(item => !existingTitles.has(item.title));

    if (mediaToInsert.length === 0) {
      console.log('   ✓ Media items already exist, skipping...');
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('media')
      .insert(mediaToInsert)
      .select();

    if (error) {
      console.error('   ❌ Error seeding media:', error);
      return;
    }

    console.log(`   ✓ Successfully seeded ${data.length} media items`);
  } catch (error) {
    console.error('   ❌ Error seeding media:', error);
  }
}

/**
 * Helper function to generate unique affiliate code
 */
function generateAffiliateCode(name: string, index: number): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 4);
  const timestamp = Date.now().toString().slice(-4);
  return `${initials}${timestamp}${index}`.substring(0, 20);
}

/**
 * Seed Affiliates
 */
async function seedAffiliates() {
  console.log('🌱 Seeding Affiliates...');

  const affiliates = [
    {
      name: 'Family Medicine Centre',
      email: 'contact@familymedicinecentre.com',
      phone: '+1 (207) 555-0100',
      company_name: 'Family Medicine Centre',
      website: 'https://familymedicinecentre.com',
      affiliate_code: generateAffiliateCode('Family Medicine Centre', 1),
      commission_rate: 15.00,
      status: 'active',
      notes: 'Family Medicine Centre in Maine - Active affiliate partner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      name: 'Nephrology Group',
      email: 'info@nephrologygroup.com',
      phone: '+1 (603) 555-0200',
      company_name: 'Nephrology Group',
      website: 'https://nephrologygroup.com',
      affiliate_code: generateAffiliateCode('Nephrology Group', 2),
      commission_rate: 18.00,
      status: 'active',
      notes: 'Nephrology Group in New Hampshire - High volume affiliate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      name: 'Pain Management Center',
      email: 'contact@painmanagementnj.com',
      phone: '+1 (201) 555-0300',
      company_name: 'Pain Management Center',
      website: 'https://painmanagementnj.com',
      affiliate_code: generateAffiliateCode('Pain Management Center', 3),
      commission_rate: 16.50,
      status: 'active',
      notes: 'Pain Management in New Jersey - Active affiliate for 2 years',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      name: 'Internal Medicine & Nephrology',
      email: 'info@internalmedga.com',
      phone: '+1 (404) 555-0400',
      company_name: 'Internal Medicine & Nephrology Practice',
      website: 'https://internalmedga.com',
      affiliate_code: generateAffiliateCode('Internal Medicine & Nephrology', 4),
      commission_rate: 17.00,
      status: 'active',
      notes: 'Internal Medicine & Nephrology in Georgia - Recently switched to Agile Nexus',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      name: 'Peds OT Clinic',
      email: 'contact@pedsotclinic.com',
      phone: '+1 (305) 555-0500',
      company_name: 'Peds OT Clinic',
      website: 'https://pedsotclinic.com',
      affiliate_code: generateAffiliateCode('Peds OT Clinic', 5),
      commission_rate: 12.00,
      status: 'active',
      notes: 'Small pediatric OT practice in Florida - Long-term affiliate partner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ];

  try {
    // Check if affiliates already exist
    const { data: existingAffiliates } = await supabaseAdmin
      .from('affiliates')
      .select('email')
      .is('deleted_at', null);

    const existingEmails = new Set(existingAffiliates?.map(a => a.email) || []);

    const affiliatesToInsert = affiliates.filter(affiliate => !existingEmails.has(affiliate.email));

    if (affiliatesToInsert.length === 0) {
      console.log('   ✓ Affiliates already exist, skipping...');
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .insert(affiliatesToInsert)
      .select();

    if (error) {
      console.error('   ❌ Error seeding affiliates:', error);
      return;
    }

    console.log(`   ✓ Successfully seeded ${data.length} affiliates`);
  } catch (error) {
    console.error('   ❌ Error seeding affiliates:', error);
  }
}

/**
 * Seed System Settings
 */
async function seedSystemSettings() {
  console.log('🌱 Seeding System Settings...');

  const settings = {
    logo_url: getStoragePlaceholderImage(),
    contact_email: 'info@agilenexussolution.com',
    contact_phone: '17276354993',
    contact_address: '7901 4th St N',
    contact_city: 'St. Petersburg',
    contact_state: 'FL',
    contact_zip: '33702',
    contact_country: 'United States',
    social_facebook: 'https://facebook.com/agilenexussolutions',
    social_twitter: 'https://twitter.com/agilenexussol',
    social_instagram: 'https://instagram.com/agilenexussolutions',
    social_linkedin: 'https://linkedin.com/company/agile-nexus-solutions',
    social_youtube: 'https://youtube.com/@agilenexussolutions',
    social_pinterest: null,
    working_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: null, close: null, closed: true },
      sunday: { open: null, close: null, closed: true }
    },
    seo_default_title: 'Agile Nexus Solutions - The Most Affordable Medical Billing Company in USA',
    seo_default_description: 'Agile Nexus Solutions offers expert revenue cycle management services to Healthcare Providers and Medical Billing Companies across the USA. 24/7 services, quick turnaround time, cost-effective solutions.',
    seo_default_keywords: 'medical billing company, revenue cycle management, medical billing services, healthcare billing, claims submission, denial management, AR follow up, credentialing, ICD 10 coding, eligibility verification',
    seo_default_image: getPlaceholderImage(),
    additional_settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      date_format: 'MM/DD/YYYY',
      specialties: [
        'Urgent Care',
        'Cardiology',
        'Dermatology',
        'Family Medicine',
        'Pediatrics',
        'Internal Medicine',
        'Nephrology',
        'Nursing Home',
        'Pain Management',
        'Ambulatory Services',
        'Podiatry',
        'Psychiatry',
        'Pulmonology',
        'Radiology',
        'Surgery',
        'Ophthalmology',
        'Lab Billing',
        'Urology',
        'Gynecology'
      ],
      company_tagline: 'Expert Billing for Exceptional Care',
      company_slogan: 'We Deliver What We Promise'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    // Check if settings already exist
    const { data: existingSettings } = await supabaseAdmin
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabaseAdmin
        .from('settings')
        .update(settings)
        .eq('id', existingSettings.id)
        .select();

      if (error) {
        console.error('   ❌ Error updating settings:', error);
        return;
      }

      console.log('   ✓ Successfully updated system settings');
    } else {
      // Create new settings
      const { data, error } = await supabaseAdmin
        .from('settings')
        .insert(settings)
        .select();

      if (error) {
        console.error('   ❌ Error creating settings:', error);
        return;
      }

      console.log('   ✓ Successfully created system settings');
    }
  } catch (error) {
    console.error('   ❌ Error seeding settings:', error);
  }
}

/**
 * Seed Team Members
 */
async function seedTeamMembers() {
  console.log('🌱 Seeding Team Members...');

  const teamMembers = [
    {
      name: 'John Smith',
      title: 'Chief Executive Officer',
      bio: '<p>John Smith brings over 20 years of experience in healthcare management and revenue cycle optimization. He has led Agile Nexus Solutions to become one of the most trusted medical billing companies in the USA.</p>',
      photo_url: getPlaceholderImage(),
      email: 'john.smith@agilenexussolution.com',
      phone: '+1 (727) 635-4993',
      linkedin_url: 'https://linkedin.com/in/johnsmith',
      twitter_url: null,
      display_order: 1,
      status: 'active',
      department: 'Leadership',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      name: 'Sarah Johnson',
      title: 'Chief Technology Officer',
      bio: '<p>Sarah Johnson is responsible for overseeing all technology initiatives and ensuring our billing systems remain at the forefront of innovation. With expertise in healthcare IT, she drives our digital transformation efforts.</p>',
      photo_url: getPlaceholderImage(),
      email: 'sarah.johnson@agilenexussolution.com',
      phone: '+1 (727) 635-4994',
      linkedin_url: 'https://linkedin.com/in/sarahjohnson',
      twitter_url: 'https://twitter.com/sarahjohnson',
      display_order: 2,
      status: 'active',
      department: 'Leadership',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      name: 'Michael Brown',
      title: 'VP of Revenue Cycle Management',
      bio: '<p>Michael Brown leads our revenue cycle management team, ensuring efficient claims processing and maximizing revenue for our healthcare provider clients. He has extensive experience in medical billing and coding.</p>',
      photo_url: getPlaceholderImage(),
      email: 'michael.brown@agilenexussolution.com',
      phone: '+1 (727) 635-4995',
      linkedin_url: 'https://linkedin.com/in/michaelbrown',
      twitter_url: null,
      display_order: 3,
      status: 'active',
      department: 'Operations',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      name: 'Emily Davis',
      title: 'Director of Client Services',
      bio: '<p>Emily Davis ensures exceptional client satisfaction and manages relationships with healthcare providers and medical billing companies. Her dedication to service excellence has helped build our reputation.</p>',
      photo_url: getPlaceholderImage(),
      email: 'emily.davis@agilenexussolution.com',
      phone: '+1 (727) 635-4996',
      linkedin_url: 'https://linkedin.com/in/emilydavis',
      twitter_url: null,
      display_order: 4,
      status: 'active',
      department: 'Client Services',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      name: 'David Wilson',
      title: 'Lead Medical Coder',
      bio: '<p>David Wilson is an AAPC certified coder with over 15 years of experience in medical coding and documentation. He leads our coding team to ensure accuracy and compliance with ICD-10 standards.</p>',
      photo_url: getPlaceholderImage(),
      email: 'david.wilson@agilenexussolution.com',
      phone: '+1 (727) 635-4997',
      linkedin_url: 'https://linkedin.com/in/davidwilson',
      twitter_url: null,
      display_order: 5,
      status: 'active',
      department: 'Coding',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ];

  try {
    // Check if team members already exist
    const { data: existingMembers } = await supabaseAdmin
      .from('team_members')
      .select('email')
      .is('deleted_at', null);

    const existingEmails = new Set(existingMembers?.map(m => m.email).filter(Boolean) || []);

    const membersToInsert = teamMembers.filter(member => !existingEmails.has(member.email));

    if (membersToInsert.length === 0) {
      console.log('   ✓ Team members already exist, skipping...');
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert(membersToInsert)
      .select();

    if (error) {
      console.error('   ❌ Error seeding team members:', error);
      return;
    }

    console.log(`   ✓ Successfully seeded ${data.length} team members`);
  } catch (error) {
    console.error('   ❌ Error seeding team members:', error);
  }
}

/**
 * Main seeding function
 */
async function seedAll() {
  console.log('🚀 Starting CMS Modules Seeding...\n');

  try {
    await seedPages();
    await seedMedia();
    await seedAffiliates();
    await seedSystemSettings();
    await seedTeamMembers();

    console.log('\n✅ CMS Modules seeding completed successfully!');
    console.log('\n📝 Note:');
    console.log('   - Replace placeholder image URLs with actual Supabase Storage or Cloudinary URLs');
    console.log('   - Update affiliate codes and contact information as needed');
    console.log('   - Review and customize settings for your specific needs');
    console.log('   - Upload real team member photos to replace placeholders');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedAll();
