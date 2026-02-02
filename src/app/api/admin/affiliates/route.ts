import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/affiliates?search=&page=&limit=&status=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10', status } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('affiliates')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (status && typeof status === 'string' && status.trim().length > 0) {
      query = query.eq('status', status.trim());
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},affiliate_code.ilike.${searchTerm},company_name.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: affiliates, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      // Check if table doesn't exist
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json(
          { success: false, message: 'Affiliates table does not exist. Please run the database schema first.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Failed to fetch affiliates', error: process.env.NODE_ENV === 'development' ? error.message : undefined },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedAffiliates = (affiliates || []).map((affiliate: any) => ({
      _id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      phone: affiliate.phone,
      companyName: affiliate.company_name,
      website: affiliate.website,
      affiliateCode: affiliate.affiliate_code,
      commissionRate: parseFloat(affiliate.commission_rate || '10.00'),
      status: affiliate.status,
      notes: affiliate.notes,
      created_at: affiliate.created_at,
      updated_at: affiliate.updated_at
    }));

    return NextResponse.json({
      success: true,
      affiliates: mappedAffiliates,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Affiliates list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch affiliates' },
      { status: 500 }
    );
  }
}

// POST /api/admin/affiliates
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, phone, companyName, website, commissionRate, status, notes } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide affiliate name' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .is('deleted_at', null)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An affiliate with this email already exists' },
        { status: 400 }
      );
    }

    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company_name: companyName?.trim() || null,
        website: website?.trim() || null,
        commission_rate: commissionRate ? parseFloat(commissionRate.toString()) : 10.00,
        status: status || 'pending',
        notes: notes?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create affiliate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate: {
        _id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone,
        companyName: affiliate.company_name,
        website: affiliate.website,
        affiliateCode: affiliate.affiliate_code,
        commissionRate: parseFloat(affiliate.commission_rate || '10.00'),
        status: affiliate.status,
        notes: affiliate.notes,
        created_at: affiliate.created_at,
        updated_at: affiliate.updated_at
      }
    });
  } catch (error) {
    console.error('Create affiliate error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create affiliate' },
      { status: 500 }
    );
  }
}
