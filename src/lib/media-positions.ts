export const TEXT_ONLY_MEDIA_POSITIONS = ['about-us-sections', 'compliance-gallery-heading', 'software-ehr-heading'] as const;

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
  'software',
  'software-hero',
  'software-content',
  'software-subsections',
  'software-ehr',
  'software-ehr-heading',
  'testimonials',
  'other',
];

export function isTextOnlyMediaPosition(position: string): boolean {
  return (TEXT_ONLY_MEDIA_POSITIONS as readonly string[]).includes(position);
}
