import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCachedSettings, setCachedSettings } from '@/lib/settings-cache';

// GET /api/settings
// Public API - Get settings with caching (no authentication required)
export async function GET(req: NextRequest) {
  try {
    // Check cache first
    const cached = getCachedSettings();
    if (cached) {
      return NextResponse.json({
        success: true,
        settings: cached,
        cached: true
      });
    }

    // Fetch from database
    const { data: settings, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // If no settings exist, return default structure
      if (error.code === 'PGRST116') {
        const defaultSettings = {
          logoUrl: null,
          contactEmail: null,
          contactPhone: null,
          contactAddress: null,
          contactAddress2: null,
          contactCity: null,
          contactState: null,
          contactZip: null,
          contactCountry: null,
          socialFacebook: null,
          socialTwitter: null,
          socialInstagram: null,
          socialLinkedin: null,
          socialYoutube: null,
          socialPinterest: null,
          whatsappUrl: null,
          chatbotUrl: null,
          workingHours: {},
          seoDefaultTitle: null,
          seoDefaultDescription: null,
          seoDefaultKeywords: null,
          seoDefaultImage: null,
          additionalSettings: {},
          created_at: null,
          updated_at: null
        };

        // Cache default settings
        setCachedSettings(defaultSettings);

        return NextResponse.json({
          success: true,
          settings: defaultSettings,
          cached: false
        });
      }

      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedSettings = {
      logoUrl: settings.logo_url,
      contactEmail: settings.contact_email,
      contactPhone: settings.contact_phone,
      contactAddress: settings.contact_address,
      contactAddress2:
        settings.contact_address_2 ||
        settings.additional_settings?.contactAddress2 ||
        settings.additional_settings?.contact_address_2 ||
        null,
      contactCity: settings.contact_city,
      contactState: settings.contact_state,
      contactZip: settings.contact_zip,
      contactCountry: settings.contact_country,
      socialFacebook: settings.social_facebook,
      socialTwitter: settings.social_twitter,
      socialInstagram: settings.social_instagram,
      socialLinkedin: settings.social_linkedin,
      socialYoutube: settings.social_youtube,
      socialPinterest: settings.social_pinterest,
      whatsappUrl: settings.whatsapp_url || settings.additional_settings?.whatsappUrl || null,
      chatbotUrl: settings.chatbot_url || settings.additional_settings?.chatbotUrl || null,
      workingHours: settings.working_hours || {},
      seoDefaultTitle: settings.seo_default_title,
      seoDefaultDescription: settings.seo_default_description,
      seoDefaultKeywords: settings.seo_default_keywords,
      seoDefaultImage: settings.seo_default_image,
      additionalSettings: settings.additional_settings || {},
      created_at: settings.created_at,
      updated_at: settings.updated_at
    };

    // Update cache
    setCachedSettings(mappedSettings);

    return NextResponse.json({
      success: true,
      settings: mappedSettings,
      cached: false
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

