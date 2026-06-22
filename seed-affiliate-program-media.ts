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

const PLACEHOLDER = '/assets/images/resource/about-1.jpg';

interface MediaSeedItem {
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  position: string;
  displayOrder: number;
  altText: string;
  linkUrl: string | null;
}

const affiliateMediaData: MediaSeedItem[] = [
  {
    title: 'Partners & Referrals',
    description:
      'Turn your healthcare network into predictable recurring revenue\n\nRefer clinics, specialties, or partner as a white-label billing provider. Earn recurring commissions, backed by reporting and fast payouts.',
    fileUrl: PLACEHOLDER,
    fileName: 'affiliate-hero.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-hero',
    displayOrder: 1,
    altText: 'Partners & Referrals - Affiliate Program',
    linkUrl: null,
  },
  {
    title: 'Partner: EMR/EHR',
    description: 'Hero CTA - Partner EMR/EHR',
    fileUrl: PLACEHOLDER,
    fileName: 'cta-emr.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-hero-ctas',
    displayOrder: 1,
    altText: 'Partner EMR/EHR',
    linkUrl: '#programs',
  },
  {
    title: 'White-Label Partner',
    description: 'Hero CTA - White-Label Partner',
    fileUrl: PLACEHOLDER,
    fileName: 'cta-whitelabel.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-hero-ctas',
    displayOrder: 2,
    altText: 'White-Label Partner',
    linkUrl: '#programs',
  },
  {
    title: 'Refer a Clinic',
    description: 'Hero CTA - Refer a Clinic',
    fileUrl: PLACEHOLDER,
    fileName: 'cta-refer.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-hero-ctas',
    displayOrder: 3,
    altText: 'Refer a Clinic',
    linkUrl: '#contact-form',
  },
  {
    title: 'Why partner with Agile Nexus Solutions Medical Billing',
    description:
      'At Agile Nexus Solutions Medical Billing Services, we do more than just handle claims. As a trusted leader in the field, we deliver strategic solutions that benefit both your business and your clients.',
    fileUrl: PLACEHOLDER,
    fileName: 'features-heading.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-features-heading',
    displayOrder: 1,
    altText: 'Why partner with Agile Nexus Solutions',
    linkUrl: null,
  },
  {
    title: 'Expert Medical Billing Solutions',
    description:
      'Rely on our extensive experience in handling complex medical billing with precision. From accurate coding to efficient denial management, we help you secure the reimbursements you deserve.',
    fileUrl: PLACEHOLDER,
    fileName: 'feature-billing.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-features',
    displayOrder: 1,
    altText: 'Expert Medical Billing Solutions',
    linkUrl: null,
  },
  {
    title: 'New Revenue Opportunities',
    description:
      'Take advantage of our attractive commission plans and referral incentives to generate an additional, profitable income stream for your business.',
    fileUrl: PLACEHOLDER,
    fileName: 'feature-revenue.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-features',
    displayOrder: 2,
    altText: 'New Revenue Opportunities',
    linkUrl: null,
  },
  {
    title: 'Greater Value to Your Clients',
    description:
      'Provide your clients with streamlined, compliant, and patient-focused billing services that improve their financial outcomes and enhance overall satisfaction.',
    fileUrl: PLACEHOLDER,
    fileName: 'feature-value.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-features',
    displayOrder: 3,
    altText: 'Greater Value to Your Clients',
    linkUrl: null,
  },
  {
    title: 'Effortless System Integration',
    description:
      'Our experts seamlessly connect with a wide range of EMR/EHR platforms, ensuring smooth workflows and minimal disruption to your operations.',
    fileUrl: PLACEHOLDER,
    fileName: 'feature-integration.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-features',
    displayOrder: 4,
    altText: 'Effortless System Integration',
    linkUrl: null,
  },
  {
    title: 'Solutions That Grow With You',
    description:
      'Our adaptable programs are tailored to support your business at every stage, whether you’re a rising startup or a well-established enterprise.',
    fileUrl: PLACEHOLDER,
    fileName: 'feature-growth.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-features',
    displayOrder: 5,
    altText: 'Solutions That Grow With You',
    linkUrl: null,
  },
  {
    title: 'Reliable Compliance',
    description:
      'Work with peace of mind knowing we maintain the highest standards of HIPAA and industry regulations.',
    fileUrl: PLACEHOLDER,
    fileName: 'feature-compliance.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-features',
    displayOrder: 6,
    altText: 'Reliable Compliance',
    linkUrl: null,
  },
  {
    title: 'Affiliate Programs Built Around Your Success',
    description:
      'We’ve created partnership paths that adapt to your business model, ensuring you get the support and opportunities that fit your goals.',
    fileUrl: PLACEHOLDER,
    fileName: 'programs-heading.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-programs-heading',
    displayOrder: 1,
    altText: 'Affiliate Programs Built Around Your Success',
    linkUrl: null,
  },
  {
    title: 'For Software firms & Healthcare Consultant /Vendors',
    description: [
      'Become a strategic referral partner and provide your clients with a complete, end-to-end RCM solution. Partner with Agile Nexus Solutions Medical Billing to expand your offerings and simplify complex billing processes for your clients.',
      'Who This Is For: EMR/EHR software providers, RCM consulting firms, healthcare tech vendors, and independent RCM consultants looking to grow their service portfolio.',
      'How It Works: Refer your clients to Agile Nexus Solutions Medical Billing, and our team manages everything from eligibility checks and claim submissions to denial management and final collections.',
      'Expand Your Offering: Deliver a full RCM solution without building internal billing operations.',
      'Earn Competitive Commissions: Receive a percentage of collected revenue for every client you refer.',
      'Improve Client Retention: Strengthen relationships by offering reliable billing services that improve financial outcomes.',
      'Dedicated Partner Support: Get help with integrations, co-marketing initiatives, and ongoing client success management.',
    ].join('\n\n'),
    fileUrl: PLACEHOLDER,
    fileName: 'program-emr.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-programs',
    displayOrder: 1,
    altText: 'For Software firms and Healthcare Vendors',
    linkUrl: 'Partner With Us (EMR)',
  },
  {
    title: 'For Clinics & Independent Practices',
    description: [
      'White-label our expertise and grow your business. Partner with Agile Nexus Solutions Medical Billing Services as your backend, handling everything from claims submission and denial management to AR follow-up all under your brand.',
      'Who This Is For: Medical billing companies that want to outsource select services or expand their capacity while keeping their brand front and center.',
      'How It Works: Agile Nexus Solutions manages your clients\' billing completely under your brand, letting you scale without extra staff or infrastructure.',
      'Seamless Brand Extension: Offer a full suite of billing services while maintaining client relationships.',
      'Cost-Effective Scalability: Expand capacity quickly without major investments in staff, technology, or office space.',
      'Quality You Can Trust: Our experienced team ensures accuracy and efficiency through strict quality controls.',
      'Focus on Growth: Free up internal resources to concentrate on sales, client acquisition, and core business goals.',
    ].join('\n\n'),
    fileUrl: PLACEHOLDER,
    fileName: 'program-clinics.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-programs',
    displayOrder: 2,
    altText: 'For Clinics and Independent Practices',
    linkUrl: 'Explore White-Label',
  },
  {
    title: 'For RCM Companies',
    description: [
      'White-label our expertise and grow your business. Partner with Agile Nexus Solutions Medical Billing Services as your backend, handling everything from claims submission and denial management to AR follow-up all under your brand.',
      'Who This Is For: Medical billing companies that want to outsource select services or expand their capacity while keeping their brand front and center.',
      'How It Works: Agile Nexus Solutions manages your clients\' billing completely under your brand, letting you scale without extra staff or infrastructure.',
      'Seamless Brand Extension: Offer a full suite of billing services while maintaining client relationships.',
      'Cost-Effective Scalability: Expand capacity quickly without major investments in staff, technology, or office space.',
      'Quality You Can Trust: Our experienced team ensures accuracy and efficiency through strict quality controls.',
      'Focus on Growth: Free up internal resources to concentrate on sales, client acquisition, and core business goals.',
    ].join('\n\n'),
    fileUrl: PLACEHOLDER,
    fileName: 'program-rcm.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-programs',
    displayOrder: 3,
    altText: 'For RCM Companies',
    linkUrl: 'Explore White-Label',
  },
  {
    title: 'Getting Started: Your Path to Partnership',
    description:
      'We make it simple and straightforward to join, ensuring a smooth start so you can begin earning from your referrals quickly.',
    fileUrl: PLACEHOLDER,
    fileName: 'steps-heading.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-steps-heading',
    displayOrder: 1,
    altText: 'Getting Started',
    linkUrl: null,
  },
  {
    title: 'Get Started',
    description:
      'Submit your details through our quick online form and choose the partnership path that fits your goals.',
    fileUrl: PLACEHOLDER,
    fileName: 'step-get-started.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-steps',
    displayOrder: 1,
    altText: 'Get Started',
    linkUrl: null,
  },
  {
    title: 'Connect & Confirm',
    description:
      'We’ll discuss your objectives, clarify details, and finalize the agreement, including commission rates or white-label terms, so you’re ready to start.',
    fileUrl: PLACEHOLDER,
    fileName: 'step-connect.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-steps',
    displayOrder: 2,
    altText: 'Connect and Confirm',
    linkUrl: null,
  },
  {
    title: 'Your Growth Starts Here',
    description:
      'We provide all the tools, guidance, and support you need to hit the ground running and begin earning with Agile Nexus Solutions medical billing solutions.',
    fileUrl: PLACEHOLDER,
    fileName: 'step-growth.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-steps',
    displayOrder: 3,
    altText: 'Your Growth Starts Here',
    linkUrl: null,
  },
  {
    title: 'Why Agile Nexus Affiliate Program?',
    description: [
      'Agile Nexus Solutions is more than a medical billing company. We are a long-term growth partner for healthcare practices.',
      'Our services are designed to drive stability, efficiency, and revenue growth, which directly benefits our affiliates.',
      'What sets Agile Nexus Solutions apart:',
      'Healthcare providers trust Agile Nexus Solutions to manage their revenue. Affiliates trust us to protect and grow their earnings.',
      'Because your commissions depend on long-term client success, our industry-leading retention rates mean more consistent and higher payouts for you.',
    ].join('\n\n'),
    fileUrl: PLACEHOLDER,
    fileName: 'why-heading.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-why-heading',
    displayOrder: 1,
    altText: 'Why Agile Nexus Affiliate Program',
    linkUrl: null,
  },
  {
    title: 'Accurate billing and coding',
    description: 'Accurate, fully compliant medical billing and coding',
    fileUrl: PLACEHOLDER,
    fileName: 'why-bullet-1.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-why',
    displayOrder: 1,
    altText: 'Accurate billing',
    linkUrl: null,
  },
  {
    title: 'Faster reimbursements',
    description: 'Faster reimbursements with optimized revenue cycles',
    fileUrl: PLACEHOLDER,
    fileName: 'why-bullet-2.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-why',
    displayOrder: 2,
    altText: 'Faster reimbursements',
    linkUrl: null,
  },
  {
    title: 'Transparent reporting',
    description: 'Clear, transparent reporting with full visibility',
    fileUrl: PLACEHOLDER,
    fileName: 'why-bullet-3.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-why',
    displayOrder: 3,
    altText: 'Transparent reporting',
    linkUrl: null,
  },
  {
    title: 'Dedicated account managers',
    description: 'Dedicated account managers for personalized support',
    fileUrl: PLACEHOLDER,
    fileName: 'why-bullet-4.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-why',
    displayOrder: 4,
    altText: 'Dedicated account managers',
    linkUrl: null,
  },
  {
    title: 'Multi-specialty expertise',
    description: 'Proven expertise across multiple medical specialties',
    fileUrl: PLACEHOLDER,
    fileName: 'why-bullet-5.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-why',
    displayOrder: 5,
    altText: 'Multi-specialty expertise',
    linkUrl: null,
  },
  {
    title: 'HIPAA compliance',
    description: 'HIPAA-compliant processes and secure data handling',
    fileUrl: PLACEHOLDER,
    fileName: 'why-bullet-6.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-why',
    displayOrder: 6,
    altText: 'HIPAA compliance',
    linkUrl: null,
  },
  {
    title: 'Seamless communication',
    description: 'Seamless communication with no gaps or delays',
    fileUrl: PLACEHOLDER,
    fileName: 'why-bullet-7.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-why',
    displayOrder: 7,
    altText: 'Seamless communication',
    linkUrl: null,
  },
  {
    title: 'Why Affiliate Program Image',
    description: 'Side image for Why Agile Nexus Affiliate Program section',
    fileUrl: PLACEHOLDER,
    fileName: 'why-image.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-why-image',
    displayOrder: 1,
    altText: 'Why Agile Nexus Affiliate Program',
    linkUrl: null,
  },
  {
    title: 'Commission Structure',
    description: [
      'Earn recurring monthly commissions for every active client you refer with no caps or limits on your earning potential.',
      'Recurring monthly commissions for all active referrals',
      'No earning caps or limitations',
      'Performance-based bonus tiers for top partners',
      'You make the introduction. We manage the entire process from onboarding to billing and ongoing support — while you enjoy consistent, long-term income.',
    ].join('\n\n'),
    fileUrl: PLACEHOLDER,
    fileName: 'commission.jpg',
    fileType: 'image/jpeg',
    position: 'affiliate-commission',
    displayOrder: 1,
    altText: 'Commission Structure',
    linkUrl: null,
  },
  {
    title: 'Speak to Our Friendly Team',
    description:
      'We’ll answer your questions and help you get started — fill the form below and our partnership team will reach out.',
    fileUrl: PLACEHOLDER,
    fileName: 'form-heading.txt',
    fileType: 'image/jpeg',
    position: 'affiliate-form-heading',
    displayOrder: 1,
    altText: 'Speak to Our Friendly Team',
    linkUrl: null,
  },
];

async function seedAffiliateMedia() {
  console.log('🌱 Starting Affiliate Program media seeder...\n');

  try {
    for (const item of affiliateMediaData) {
      const { data: existing } = await supabase
        .from('media')
        .select('id, title')
        .eq('title', item.title)
        .eq('position', item.position)
        .is('deleted_at', null)
        .maybeSingle();

      const payload = {
        description: item.description,
        file_url: item.fileUrl,
        file_name: item.fileName,
        file_size: 0,
        file_type: item.fileType,
        position: item.position,
        status: 'active',
        display_order: item.displayOrder,
        alt_text: item.altText,
        link_url: item.linkUrl,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase.from('media').update(payload).eq('id', existing.id);
        if (error) {
          console.error(`❌ Error updating "${item.title}":`, error);
          continue;
        }
        console.log(`✅ Updated: ${item.title} (${item.position})`);
      } else {
        const { error } = await supabase.from('media').insert({
          title: item.title,
          ...payload,
        });
        if (error) {
          console.error(`❌ Error creating "${item.title}":`, error);
          continue;
        }
        console.log(`✅ Created: ${item.title} (${item.position})`);
      }
    }

    console.log('\n🎉 Affiliate Program media seeder completed.');
    console.log('📝 Replace placeholder images in Admin > Media by position.\n');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

seedAffiliateMedia()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('💥 Fatal error:', e);
    process.exit(1);
  });
