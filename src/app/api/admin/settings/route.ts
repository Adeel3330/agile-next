import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { clearSettingsCache } from '@/lib/settings-cache';

// GET /api/admin/settings
// Get all settings (admin only)
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { data: settings, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // If no settings exist, return default structure
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          settings: {
            logoUrl: null,
            contactEmail: null,
            contactPhone: null,
            emergencyNo: null,
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
          }
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
      emergencyNo:
        settings.emergency_no ||
        settings.additional_settings?.emergencyNo ||
        settings.additional_settings?.emergency_no ||
        null,
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

    return NextResponse.json({
      success: true,
      settings: mappedSettings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings
// Update settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      logoUrl,
      contactEmail,
      contactPhone,
      emergencyNo,
      contactAddress,
      contactAddress2,
      contactCity,
      contactState,
      contactZip,
      contactCountry,
      socialFacebook,
      socialTwitter,
      socialInstagram,
      socialLinkedin,
      socialYoutube,
      socialPinterest,
      whatsappUrl,
      chatbotUrl,
      workingHours,
      seoDefaultTitle,
      seoDefaultDescription,
      seoDefaultKeywords,
      seoDefaultImage,
      additionalSettings
    } = body;

    // Check if settings exist (pick first row safely)
    const { data: existingRows } = await supabaseAdmin
      .from('settings')
      .select('id, additional_settings')
      .order('created_at', { ascending: true })
      .limit(1);

    const existing = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map frontend names to database column names
    if (logoUrl !== undefined) updateData.logo_url = logoUrl?.trim() || null;
    if (contactEmail !== undefined) updateData.contact_email = contactEmail?.trim() || null;
    if (contactPhone !== undefined) updateData.contact_phone = contactPhone?.trim() || null;
    if (emergencyNo !== undefined) updateData.emergency_no = emergencyNo?.trim() || null;
    if (contactAddress !== undefined) updateData.contact_address = contactAddress?.trim() || null;
    if (contactAddress2 !== undefined) updateData.contact_address_2 = contactAddress2?.trim() || null;
    if (contactCity !== undefined) updateData.contact_city = contactCity?.trim() || null;
    if (contactState !== undefined) updateData.contact_state = contactState?.trim() || null;
    if (contactZip !== undefined) updateData.contact_zip = contactZip?.trim() || null;
    if (contactCountry !== undefined) updateData.contact_country = contactCountry?.trim() || null;
    if (socialFacebook !== undefined) updateData.social_facebook = socialFacebook?.trim() || null;
    if (socialTwitter !== undefined) updateData.social_twitter = socialTwitter?.trim() || null;
    if (socialInstagram !== undefined) updateData.social_instagram = socialInstagram?.trim() || null;
    if (socialLinkedin !== undefined) updateData.social_linkedin = socialLinkedin?.trim() || null;
    if (socialYoutube !== undefined) updateData.social_youtube = socialYoutube?.trim() || null;
    if (socialPinterest !== undefined) updateData.social_pinterest = socialPinterest?.trim() || null;
    const normalizedWhatsappUrl = whatsappUrl !== undefined ? whatsappUrl?.trim() || null : undefined;
    const normalizedChatbotUrl = chatbotUrl !== undefined ? chatbotUrl?.trim() || null : undefined;

    if (normalizedWhatsappUrl !== undefined) {
      updateData.whatsapp_url = normalizedWhatsappUrl && normalizedWhatsappUrl.length <= 500 ? normalizedWhatsappUrl : null;
    }
    if (normalizedChatbotUrl !== undefined) {
      updateData.chatbot_url = normalizedChatbotUrl && normalizedChatbotUrl.length <= 500 ? normalizedChatbotUrl : null;
    }
    if (workingHours !== undefined) updateData.working_hours = workingHours || {};
    if (seoDefaultTitle !== undefined) updateData.seo_default_title = seoDefaultTitle?.trim() || null;
    if (seoDefaultDescription !== undefined) updateData.seo_default_description = seoDefaultDescription?.trim() || null;
    if (seoDefaultKeywords !== undefined) updateData.seo_default_keywords = seoDefaultKeywords?.trim() || null;
    if (seoDefaultImage !== undefined) updateData.seo_default_image = seoDefaultImage?.trim() || null;
    if (additionalSettings !== undefined) updateData.additional_settings = additionalSettings || {};

    if (
      additionalSettings !== undefined ||
      normalizedWhatsappUrl !== undefined ||
      normalizedChatbotUrl !== undefined ||
      contactAddress2 !== undefined ||
      emergencyNo !== undefined
    ) {
      const nextAdditional = {
        ...(existing?.additional_settings || {}),
        ...(updateData.additional_settings || {}),
      } as any;

      if (emergencyNo !== undefined) {
        nextAdditional.emergencyNo = emergencyNo?.trim() || null;
        nextAdditional.emergency_no = emergencyNo?.trim() || null;
      }

      if (normalizedWhatsappUrl !== undefined) {
        nextAdditional.whatsappUrl = normalizedWhatsappUrl;
      }

      if (normalizedChatbotUrl !== undefined) {
        nextAdditional.chatbotUrl = normalizedChatbotUrl;
      }

      if (contactAddress2 !== undefined) {
        nextAdditional.contactAddress2 = contactAddress2?.trim() || null;
        nextAdditional.contact_address_2 = contactAddress2?.trim() || null;
      }

      updateData.additional_settings = nextAdditional;
    }

    const executeSave = async (payload: any) => {
      if (existing) {
        return await supabaseAdmin
          .from('settings')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
      }

      return await supabaseAdmin
        .from('settings')
        .insert(payload)
        .select()
        .single();
    };

    const extractMissingColumn = (message: string) => {
      const patterns = [
        /Could not find the '([a-zA-Z0-9_]+)' column/i,
        /column\s+"([a-zA-Z0-9_]+)"/i,
        /column\s+'([a-zA-Z0-9_]+)'/i,
        /column\s+([a-zA-Z0-9_]+)\s+does not exist/i
      ];

      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match?.[1]) return match[1];
      }

      return null;
    };

    let payload = { ...updateData };
    let { data: result, error: saveError } = await executeSave(payload);

    for (let i = 0; i < 8 && saveError; i++) {
      const missingColumn = extractMissingColumn(String(saveError.message || ''));
      if (!missingColumn || !(missingColumn in payload)) {
        break;
      }

      delete payload[missingColumn];
      const retryResult = await executeSave(payload);
      result = retryResult.data;
      saveError = retryResult.error;
    }

    if (saveError || !result) {
      console.error('Supabase error:', saveError);
      return NextResponse.json(
        { success: false, message: saveError?.message || 'Failed to update settings' },
        { status: 500 }
      );
    }

    // Map response back to frontend format
    const mappedSettings = {
      logoUrl: result.logo_url,
      contactEmail: result.contact_email,
      contactPhone: result.contact_phone,
      emergencyNo:
        result.emergency_no ||
        result.additional_settings?.emergencyNo ||
        result.additional_settings?.emergency_no ||
        null,
      contactAddress: result.contact_address,
      contactAddress2:
        result.contact_address_2 ||
        result.additional_settings?.contactAddress2 ||
        result.additional_settings?.contact_address_2 ||
        null,
      contactCity: result.contact_city,
      contactState: result.contact_state,
      contactZip: result.contact_zip,
      contactCountry: result.contact_country,
      socialFacebook: result.social_facebook,
      socialTwitter: result.social_twitter,
      socialInstagram: result.social_instagram,
      socialLinkedin: result.social_linkedin,
      socialYoutube: result.social_youtube,
      socialPinterest: result.social_pinterest,
      whatsappUrl: result.whatsapp_url || result.additional_settings?.whatsappUrl || null,
      chatbotUrl: result.chatbot_url || result.additional_settings?.chatbotUrl || null,
      workingHours: result.working_hours || {},
      seoDefaultTitle: result.seo_default_title,
      seoDefaultDescription: result.seo_default_description,
      seoDefaultKeywords: result.seo_default_keywords,
      seoDefaultImage: result.seo_default_image,
      additionalSettings: result.additional_settings || {},
      created_at: result.created_at,
      updated_at: result.updated_at
    };

    // Clear cache after update
    clearSettingsCache();

    return NextResponse.json({
      success: true,
      settings: mappedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
