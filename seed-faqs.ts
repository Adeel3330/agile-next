/**
 * Seed FAQs for Home and Affiliate pages
 * Data inspired by https://agilenexussolution.com/ (medical billing, RCM, affiliate program).
 *
 * Prerequisite: Run database/faqs-schema.sql in Supabase first.
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' seed-faqs.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Home page FAQs – medical billing, RCM, services (agilenexussolution.com style)
const homeFaqs = [
  {
    question: 'What medical billing services do you offer?',
    answer:
      'We offer full revenue cycle management including eligibility and benefits verification, patient demographics entry, authorizations, ICD-10 coding, charge capture, claims submission, claims audit and rejection fixes, payment posting, denial management, AR follow-up, patient statements, credit balance solutions, credentialing and enrollment, IPA contracting, and virtual assistance.',
  },
  {
    question: 'Do you work with physicians and medical groups?',
    answer:
      'Yes. Agile Nexus Solutions supports healthcare providers, physicians, medical groups, and medical billing companies across the USA. We help you focus on patient care and operations instead of paperwork.',
  },
  {
    question: 'How do you ensure accurate coding and compliance?',
    answer:
      'Our coders are AAPC certified and specialize in their role. We use scrubbing tools to ensure accurate patient information and compliance with payer guidelines, resulting in faster and more accurate reimbursements.',
  },
  {
    question: 'What is your turnaround time for claims?',
    answer:
      'We provide quick turnaround on claims submission and rapid response to any claim issues. Our goal is to streamline the revenue cycle and maximize collections while keeping you compliant.',
  },
  {
    question: 'Do you handle denial management?',
    answer:
      'Yes. We reduce revenue losses and increase cash flow by addressing denials promptly. We identify issues such as denials for medical necessity, non-covered services, and prior authorizations so you get paid.',
  },
  {
    question: 'Can you integrate with our existing EHR/EMR?',
    answer:
      'We integrate with a wide range of EMR/EHR platforms. Our experts connect with your systems to ensure smooth workflows and minimal disruption while managing eligibility, claims, denial management, and collections.',
  },
];

// Affiliate page FAQs – partner program, referrals, commissions (agilenexussolution.com affiliate style)
const affiliateFaqs = [
  {
    question: 'How are my referrals tracked?',
    answer:
      'Each partner receives a unique referral code or link. All leads and conversions are tracked and reported in your partner dashboard so you have full visibility.',
  },
  {
    question: 'When do I start earning?',
    answer: 'Commissions begin as soon as your referral’s first invoice is paid. We keep the process transparent and timely.',
  },
  {
    question: 'Is there a limit to how many referrals I can make?',
    answer: 'No. There are no earning caps or limits on referrals. The more you refer, the more you earn. We also offer performance-based bonus tiers for top partners.',
  },
  {
    question: 'How long do I earn commissions?',
    answer: 'You earn recurring commissions for as long as your referral stays with Agile Nexus Solutions. We focus on retention so your income remains consistent.',
  },
  {
    question: 'Do I need to sell or present your services?',
    answer:
      'No. You make the introduction; we handle presentations, onboarding, billing, and support. We manage the entire relationship so you can focus on your network.',
  },
  {
    question: 'Can international partners join?',
    answer: 'Yes. International partners can receive payouts via PayPal or other agreed methods. We work with partners across the USA and internationally.',
  },
  {
    question: 'Who can become an affiliate partner?',
    answer:
      'EMR/EHR software providers, RCM consulting firms, healthcare tech vendors, medical billing companies that want to outsource or expand capacity, and anyone with a healthcare network looking for additional revenue.',
  },
];

async function seed() {
  console.log('🌱 Seeding FAQs (Home & Affiliate)...\n');
  const now = new Date().toISOString();

  for (const [position, items] of [
    ['home', homeFaqs] as const,
    ['affiliate', affiliateFaqs] as const,
  ]) {
    console.log(`   Position: ${position}`);
    for (let i = 0; i < items.length; i++) {
      const { question, answer } = items[i];
      const { data: existing } = await supabase
        .from('faqs')
        .select('id')
        .eq('question', question)
        .eq('position', position)
        .is('deleted_at', null)
        .maybeSingle();

      const row = {
        question,
        answer,
        position,
        display_order: i,
        status: 'active',
        updated_at: now,
      };

      if (existing) {
        await supabase.from('faqs').update(row).eq('id', existing.id);
        console.log(`      Updated: ${question.slice(0, 50)}...`);
      } else {
        const { error } = await supabase.from('faqs').insert({
          ...row,
          created_at: now,
          deleted_at: null,
        });
        if (error) {
          console.error(`      ❌ ${question.slice(0, 40)}:`, error.message);
        } else {
          console.log(`      Created: ${question.slice(0, 50)}...`);
        }
      }
    }
    console.log('');
  }

  console.log('🎉 FAQ seed completed.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
