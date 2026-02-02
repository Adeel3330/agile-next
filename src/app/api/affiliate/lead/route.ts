import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/affiliate/lead
// Public API - no authentication required
// Track lead generated via affiliate link
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { affiliateCode, name, email, phone, source } = body;

    // Validation
    if (!affiliateCode || typeof affiliateCode !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Affiliate code is required' },
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

    // Get client IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referrer = req.headers.get('referer') || 'unknown';

    // Create lead record
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('affiliate_leads')
      .insert({
        affiliate_id: affiliate.id,
        name: name?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        phone: phone?.trim() || null,
        source: source || 'affiliate_link',
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer_url: referrer,
        converted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
      .select()
      .single();

    if (leadError) {
      console.error('Supabase error:', leadError);
      return NextResponse.json(
        { success: false, message: 'Failed to track lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead tracked successfully',
      leadId: lead.id
    });
  } catch (error) {
    console.error('Track lead error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track lead' },
      { status: 500 }
    );
  }
}
