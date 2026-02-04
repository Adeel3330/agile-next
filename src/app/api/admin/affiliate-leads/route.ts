import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/affiliate-leads?search=&page=&limit=&affiliate_id=&converted=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10', affiliate_id, converted } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('affiliate_leads')
      .select('*, affiliates(id, name, email, affiliate_code), affiliate_applications(id, name, email)', { count: 'exact' })
      .is('deleted_at', null);

    if (affiliate_id && typeof affiliate_id === 'string' && affiliate_id.trim().length > 0) {
      query = query.eq('affiliate_id', affiliate_id.trim());
    }

    if (converted !== undefined && typeof converted === 'string') {
      const isConverted = converted.toLowerCase() === 'true';
      query = query.eq('converted', isConverted);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},source.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedLeads = (leads || []).map((lead: any) => ({
      _id: lead.id,
      affiliateId: lead.affiliate_id,
      affiliate: lead.affiliates ? {
        id: lead.affiliates.id,
        name: lead.affiliates.name,
        email: lead.affiliates.email,
        affiliateCode: lead.affiliates.affiliate_code
      } : null,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      ipAddress: lead.ip_address,
      userAgent: lead.user_agent,
      referrerUrl: lead.referrer_url,
      converted: lead.converted,
      applicationId: lead.application_id,
      application: lead.affiliate_applications ? {
        id: lead.affiliate_applications.id,
        name: lead.affiliate_applications.name,
        email: lead.affiliate_applications.email
      } : null,
      notes: lead.notes,
      created_at: lead.created_at,
      updated_at: lead.updated_at
    }));

    return NextResponse.json({
      success: true,
      leads: mappedLeads,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Leads list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
