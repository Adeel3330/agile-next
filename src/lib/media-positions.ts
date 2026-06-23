export const TEXT_ONLY_MEDIA_POSITIONS = [
  'about-us-sections',
  'resources',
  'compliance-gallery-heading',
  'software-ehr-heading',
  'software-carousel-heading',
  'affiliate-features-heading',
  'affiliate-programs-heading',
  'affiliate-steps-heading',
  'affiliate-why-heading',
  'affiliate-form-heading',
  'affiliate-hero-ctas',
] as const;

export const TEXT_ONLY_MEDIA_PLACEHOLDER_URL = '/assets/images/resource/about-1.jpg';

export const SUGGESTED_MEDIA_POSITIONS = [
  'home',
  'services',
  'about',
  'about-us-sections',
  'contact',
  'cta',
  'compliance',
  'compliance-hero',
  'compliance-content',
  'compliance-gallery-heading',
  'affiliate',
  'affiliate-hero',
  'affiliate-hero-ctas',
  'affiliate-features-heading',
  'affiliate-features',
  'affiliate-programs-heading',
  'affiliate-programs',
  'affiliate-steps-heading',
  'affiliate-steps',
  'affiliate-why-heading',
  'affiliate-why',
  'affiliate-why-image',
  'affiliate-commission',
  'affiliate-form-heading',
  'software',
  'software-carousel-heading',
  'software-hero',
  'software-content',
  'software-subsections',
  'software-ehr',
  'software-ehr-heading',
  'testimonials',
  'resources',
  'other',
];

export function isTextOnlyMediaPosition(position: string): boolean {
  return (TEXT_ONLY_MEDIA_POSITIONS as readonly string[]).includes(position);
}
