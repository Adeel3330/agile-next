import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/affiliate/apply
// Public API - no authentication required
// Submit application through affiliate link
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { affiliateCode, name, email, phone, providerType } = body;

    // Validation
    if (!affiliateCode || typeof affiliateCode !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Affiliate code is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!providerType || !['individual', 'group'].includes(providerType)) {
      return NextResponse.json(
        { success: false, message: 'Provider type must be individual or group' },
        { status: 400 }
      );
    }

    // Find affiliate by code
    const { data: affiliate, error: affiliateError } = await supabaseAdmin
      .from('affiliates')
      .select('id, status')
      .eq('affiliate_code', affiliateCode.toUpperCase())
      .is('deleted_at', null)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, message: 'Invalid affiliate code' },
        { status: 400 }
      );
    }

    if (affiliate.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Affiliate is not active' },
        { status: 400 }
      );
    }

    // Calculate application fee based on provider type
    const applicationFee = providerType === 'individual' ? 0.00 : 50.00;

    // Create application
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('affiliate_applications')
      .insert({
        affiliate_id: affiliate.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        provider_type: providerType,
        application_fee: applicationFee,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Supabase error:', applicationError);
      return NextResponse.json(
        { success: false, message: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Get client IP and user agent for lead tracking
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referrer = req.headers.get('referer') || 'unknown';

    // Create or update lead record
    await supabaseAdmin
      .from('affiliate_leads')
      .insert({
        affiliate_id: affiliate.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        source: 'application_form',
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer_url: referrer,
        converted: true,
        application_id: application.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        applicationFee: applicationFee,
        providerType: providerType
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
