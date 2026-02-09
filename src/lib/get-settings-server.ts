import { supabaseAdmin } from '@/lib/supabase';
import { getCachedSettings, setCachedSettings } from '@/lib/settings-cache';

const DEFAULT_SETTINGS = {
  logoUrl: null as string | null,
  contactEmail: null as string | null,
  contactPhone: null as string | null,
  contactAddress: null as string | null,
  contactCity: null as string | null,
  contactState: null as string | null,
  contactZip: null as string | null,
  contactCountry: null as string | null,
  socialFacebook: null as string | null,
  socialTwitter: null as string | null,
  socialInstagram: null as string | null,
  socialLinkedin: null as string | null,
  socialYoutube: null as string | null,
  socialPinterest: null as string | null,
  workingHours: {} as Record<string, unknown>,
  seoDefaultTitle: null as string | null,
  seoDefaultDescription: null as string | null,
  seoDefaultKeywords: null as string | null,
  seoDefaultImage: null as string | null,
  additionalSettings: {} as Record<string, unknown>,
  created_at: null as string | null,
  updated_at: null as string | null,
};

export type SettingsForServer = typeof DEFAULT_SETTINGS;

/**
 * Get settings from cache or Supabase (server-only).
 * Used by layout for metadata and by API route.
 */
export async function getSettingsForServer(): Promise<SettingsForServer> {
  const cached = getCachedSettings();
  if (cached) return cached as SettingsForServer;

  const { data: settings, error } = await supabaseAdmin
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      setCachedSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  }

  const mapped: SettingsForServer = {
    logoUrl: settings.logo_url ?? null,
    contactEmail: settings.contact_email ?? null,
    contactPhone: settings.contact_phone ?? null,
    contactAddress: settings.contact_address ?? null,
    contactCity: settings.contact_city ?? null,
    contactState: settings.contact_state ?? null,
    contactZip: settings.contact_zip ?? null,
    contactCountry: settings.contact_country ?? null,
    socialFacebook: settings.social_facebook ?? null,
    socialTwitter: settings.social_twitter ?? null,
    socialInstagram: settings.social_instagram ?? null,
    socialLinkedin: settings.social_linkedin ?? null,
    socialYoutube: settings.social_youtube ?? null,
    socialPinterest: settings.social_pinterest ?? null,
    workingHours: settings.working_hours ?? {},
    seoDefaultTitle: settings.seo_default_title ?? null,
    seoDefaultDescription: settings.seo_default_description ?? null,
    seoDefaultKeywords: settings.seo_default_keywords ?? null,
    seoDefaultImage: settings.seo_default_image ?? null,
    additionalSettings: settings.additional_settings ?? {},
    created_at: settings.created_at ?? null,
    updated_at: settings.updated_at ?? null,
  };

  setCachedSettings(mapped);
  return mapped;
}
