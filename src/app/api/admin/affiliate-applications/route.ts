import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/affiliate-applications?search=&page=&limit=&status=&affiliate_id=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10', status, affiliate_id } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('affiliate_applications')
      .select('*, affiliates(id, name, email, affiliate_code)', { count: 'exact' })
      .is('deleted_at', null);

    if (status && typeof status === 'string' && status.trim().length > 0) {
      query = query.eq('status', status.trim());
    }

    if (affiliate_id && typeof affiliate_id === 'string' && affiliate_id.trim().length > 0) {
      query = query.eq('affiliate_id', affiliate_id.trim());
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: applications, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedApplications = (applications || []).map((app: any) => ({
      _id: app.id,
      affiliateId: app.affiliate_id,
      affiliate: app.affiliates ? {
        id: app.affiliates.id,
        name: app.affiliates.name,
        email: app.affiliates.email,
        affiliateCode: app.affiliates.affiliate_code
      } : null,
      name: app.name,
      email: app.email,
      phone: app.phone,
      providerType: app.provider_type,
      applicationFee: parseFloat(app.application_fee || '0.00'),
      status: app.status,
      notes: app.notes,
      created_at: app.created_at,
      updated_at: app.updated_at
    }));

    return NextResponse.json({
      success: true,
      applications: mappedApplications,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Applications list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
