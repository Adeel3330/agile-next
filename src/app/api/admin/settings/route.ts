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
            contactAddress: null,
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
      contactAddress: settings.contact_address,
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
      contactAddress,
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
      workingHours,
      seoDefaultTitle,
      seoDefaultDescription,
      seoDefaultKeywords,
      seoDefaultImage,
      additionalSettings
    } = body;

    // Check if settings exist
    const { data: existing } = await supabaseAdmin
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map frontend names to database column names
    if (logoUrl !== undefined) updateData.logo_url = logoUrl?.trim() || null;
    if (contactEmail !== undefined) updateData.contact_email = contactEmail?.trim() || null;
    if (contactPhone !== undefined) updateData.contact_phone = contactPhone?.trim() || null;
    if (contactAddress !== undefined) updateData.contact_address = contactAddress?.trim() || null;
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
    if (workingHours !== undefined) updateData.working_hours = workingHours || {};
    if (seoDefaultTitle !== undefined) updateData.seo_default_title = seoDefaultTitle?.trim() || null;
    if (seoDefaultDescription !== undefined) updateData.seo_default_description = seoDefaultDescription?.trim() || null;
    if (seoDefaultKeywords !== undefined) updateData.seo_default_keywords = seoDefaultKeywords?.trim() || null;
    if (seoDefaultImage !== undefined) updateData.seo_default_image = seoDefaultImage?.trim() || null;
    if (additionalSettings !== undefined) updateData.additional_settings = additionalSettings || {};

    let result;
    if (existing) {
      // Update existing settings
      const { data: updated, error } = await supabaseAdmin
        .from('settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to update settings' },
          { status: 500 }
        );
      }

      result = updated;
    } else {
      // Create new settings record
      const { data: created, error } = await supabaseAdmin
        .from('settings')
        .insert(updateData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to create settings' },
          { status: 500 }
        );
      }

      result = created;
    }

    // Map response back to frontend format
    const mappedSettings = {
      logoUrl: result.logo_url,
      contactEmail: result.contact_email,
      contactPhone: result.contact_phone,
      contactAddress: result.contact_address,
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
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
