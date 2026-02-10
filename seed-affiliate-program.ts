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

// Affiliate Program page – design inspired by https://medivantek.com/affiliate-program/
const affiliatePageData = {
  title: 'Affiliate Program',
  slug: 'affiliate-program',
  template: 'affiliate-program',
  content: `<p>Partner with Agile Nexus Solutions to turn your healthcare network into predictable recurring revenue. We offer multiple partnership paths: refer clinics and specialties, or partner as a white-label billing provider. Earn recurring commissions with clear reporting and fast payouts.</p>`,
  sections: JSON.stringify([
    {
      type: 'hero',
      title: 'Partners & Referrals',
      subtitle: 'Turn your healthcare network into predictable recurring revenue',
      description: 'Refer clinics, specialties, or partner as a white-label billing provider. Earn recurring commissions, backed by reporting and fast payouts.'
    },
    {
      type: 'features',
      title: 'Why Partner with Agile Nexus Solutions',
      subtitle: 'We do more than just handle claims. As a trusted leader, we deliver strategic solutions that benefit both your business and your clients.',
      items: [
        { title: 'Expert Medical Billing Solutions', description: 'Rely on our experience in handling complex medical billing with precision. From accurate coding to efficient denial management, we help secure the reimbursements you deserve.', icon: 'icon-18' },
        { title: 'New Revenue Opportunities', description: 'Take advantage of attractive commission plans and referral incentives to generate an additional, profitable income stream for your business.', icon: 'icon-19' },
        { title: 'Greater Value to Your Clients', description: 'Provide clients with streamlined, compliant, and patient-focused billing services that improve their financial outcomes and satisfaction.', icon: 'icon-20' },
        { title: 'Effortless System Integration', description: 'Our experts seamlessly connect with a wide range of EMR/EHR platforms, ensuring smooth workflows and minimal disruption.', icon: 'icon-21' },
        { title: 'Solutions That Grow With You', description: 'Our adaptable programs support your business at every stage, whether you’re a rising startup or a well-established enterprise.', icon: 'icon-22' },
        { title: 'Reliable Compliance', description: 'Work with peace of mind knowing we maintain the highest standards of HIPAA and industry regulations.', icon: 'icon-23' }
      ]
    },
    {
      type: 'program_cards',
      title: 'Affiliate Programs Built Around Your Success',
      subtitle: 'We’ve created partnership paths that adapt to your business model.',
      items: [
        {
          badge: 'For Software firms & Healthcare Vendors',
          title: 'Partner: EMR/EHR & Consultants',
          subtitle: 'Become a strategic referral partner and provide your clients with a complete, end-to-end RCM solution.',
          bullets: [
            'Who: EMR/EHR software providers, RCM consulting firms, healthcare tech vendors.',
            'Refer clients to us; we manage eligibility, claims, denial management, and collections.',
            'Expand your offering without building internal billing operations.',
            'Earn competitive commissions on collected revenue for every referral.',
            'Dedicated partner support for integrations and co-marketing.'
          ],
          ctaText: 'Partner With Us'
        },
        {
          badge: 'For Clinics & Independent Practices',
          title: 'White-Label Partner',
          subtitle: 'White-label our expertise and grow your business. We handle claims, denials, and AR follow-up under your brand.',
          bullets: [
            'Who: Medical billing companies that want to outsource or expand capacity.',
            'We manage your clients’ billing completely under your brand.',
            'Seamless brand extension with a full suite of billing services.',
            'Cost-effective scalability without major staff or tech investments.',
            'Focus on growth while we handle operations.'
          ],
          ctaText: 'Explore White-Label'
        },
        {
          badge: 'For RCM Companies',
          title: 'Refer a Clinic',
          subtitle: 'Refer clinics and specialties to us. We onboard, bill, and support—you earn recurring commissions.',
          bullets: [
            'Who: Anyone with a healthcare network looking for additional revenue.',
            'You make the introduction; we handle onboarding, billing, and support.',
            'Recurring monthly commissions for all active referrals.',
            'No earning caps or limits on referrals.',
            'Performance-based bonus tiers for top partners.'
          ],
          ctaText: 'Get Started'
        }
      ]
    },
    {
      type: 'steps',
      title: 'Getting Started: Your Path to Partnership',
      items: [
        { title: 'Get Started', description: 'Submit your details through our quick online form and choose the partnership path that fits your goals.' },
        { title: 'Connect & Confirm', description: 'We’ll discuss your objectives, clarify details, and finalize the agreement, including commission rates or white-label terms.' },
        { title: 'Your Growth Starts Here', description: 'We provide all the tools, guidance, and support you need to hit the ground running and begin earning.' }
      ]
    },
    {
      type: 'list',
      title: 'Why Agile Nexus Affiliate Program?',
      subtitle: 'We are a long-term growth partner for healthcare practices. Our services drive stability, efficiency, and revenue growth—which directly benefits our affiliates.',
      items: [
        'Accurate, fully compliant medical billing and coding',
        'Faster reimbursements with optimized revenue cycles',
        'Clear, transparent reporting with full visibility',
        'Dedicated account managers for personalized support',
        'Proven expertise across multiple medical specialties',
        'HIPAA-compliant processes and secure data handling',
        'Seamless communication with no gaps or delays',
        'Industry-leading retention rates mean more consistent payouts for you'
      ]
    },
    {
      type: 'commission',
      title: 'Commission Structure',
      subtitle: 'Earn recurring monthly commissions for every active client you refer with no caps or limits on your earning potential.',
      bullets: [
        'Recurring monthly commissions for all active referrals',
        'No earning caps or limitations',
        'Performance-based bonus tiers for top partners',
        'You make the introduction; we manage onboarding, billing, and support—you enjoy consistent, long-term income.'
      ]
    },
    {
      type: 'faq',
      title: 'Frequently Asked Questions',
      items: [
        { question: 'How are my referrals tracked?', answer: 'Each partner receives a unique referral code or link. All leads and conversions are tracked and reported in your partner dashboard.' },
        { question: 'When do I start earning?', answer: 'Commissions begin as soon as your referral’s first invoice is paid.' },
        { question: 'Is there a limit to referrals?', answer: 'No minimum required. The more you refer, the more you earn.' },
        { question: 'How long do I earn commissions?', answer: 'As long as your referral stays with Agile Nexus Solutions.' },
        { question: 'Do I need to sell services?', answer: 'No. We handle presentations, onboarding, and support.' },
        { question: 'Can international partners join?', answer: 'Yes. International partners can receive payouts via PayPal or other agreed methods.' }
      ]
    },
    {
      type: 'form',
      title: 'Speak to Our Friendly Team',
      description: 'We’ll answer your questions and help you get started—fill the form below and our partnership team will reach out.'
    }
  ]),
  seoTitle: 'Affiliate Program - Partner With Agile Nexus Solutions | Medical Billing',
  seoDescription: 'Partner with Agile Nexus Solutions. Turn your healthcare network into recurring revenue. Earn commissions as an affiliate or white-label medical billing partner. Refer clinics, EMR vendors, or RCM companies welcome.',
  seoKeywords: 'affiliate program, medical billing partner, referral program, white-label billing, healthcare partnerships, RCM partner, EMR affiliate',
  seoImage: '',
  status: 'published',
  published_at: new Date().toISOString()
};

async function seedAffiliateProgramPage() {
  console.log('🌱 Starting Affiliate Program page seeder...\n');

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
      sections: affiliatePageData.sections,
      seo_title: affiliatePageData.seoTitle,
      seo_description: affiliatePageData.seoDescription,
      seo_keywords: affiliatePageData.seoKeywords,
      seo_image: affiliatePageData.seoImage,
      template: affiliatePageData.template,
      status: affiliatePageData.status,
      published_at: affiliatePageData.published_at,
      updated_at: new Date().toISOString()
    };

    if (existingPage) {
      console.log(`⚠️  Page "${affiliatePageData.title}" already exists. Updating...\n`);
      const { error: updateError } = await supabase
        .from('pages')
        .update(payload)
        .eq('id', existingPage.id);
      if (updateError) throw updateError;
      console.log('✅ Successfully updated Affiliate Program page!\n');
    } else {
      const { error: insertError } = await supabase
        .from('pages')
        .insert({
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
  .then(() => { console.log('✨ All done!'); process.exit(0); })
  .catch((e) => { console.error('💥 Fatal error:', e); process.exit(1); });
