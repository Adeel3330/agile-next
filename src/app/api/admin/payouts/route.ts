import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/payouts?search=&page=&limit=&status=&affiliate_id=
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
      .from('payouts')
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
      query = query.or(`payment_reference.ilike.${searchTerm},notes.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: payouts, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch payouts' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedPayouts = (payouts || []).map((payout: any) => ({
      _id: payout.id,
      affiliateId: payout.affiliate_id,
      affiliate: payout.affiliates ? {
        id: payout.affiliates.id,
        name: payout.affiliates.name,
        email: payout.affiliates.email,
        affiliateCode: payout.affiliates.affiliate_code
      } : null,
      amount: parseFloat(payout.amount || '0.00'),
      commissionRate: parseFloat(payout.commission_rate || '0.00'),
      periodStart: payout.period_start,
      periodEnd: payout.period_end,
      status: payout.status,
      paymentMethod: payout.payment_method,
      paymentReference: payout.payment_reference,
      paidAt: payout.paid_at,
      notes: payout.notes,
      created_at: payout.created_at,
      updated_at: payout.updated_at
    }));

    return NextResponse.json({
      success: true,
      payouts: mappedPayouts,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Payouts list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/payouts
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
    const { affiliateId, amount, commissionRate, periodStart, periodEnd, status, paymentMethod, paymentReference, notes } = body;

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, message: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    if (!amount || parseFloat(amount.toString()) <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { success: false, message: 'Period start and end dates are required' },
        { status: 400 }
      );
    }

    // Check if affiliate exists
    const { data: affiliate } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('id', affiliateId)
      .is('deleted_at', null)
      .single();

    if (!affiliate) {
      return NextResponse.json(
        { success: false, message: 'Affiliate not found' },
        { status: 404 }
      );
    }

    const { data: payout, error } = await supabaseAdmin
      .from('payouts')
      .insert({
        affiliate_id: affiliateId,
        amount: parseFloat(amount.toString()),
        commission_rate: commissionRate ? parseFloat(commissionRate.toString()) : 10.00,
        period_start: periodStart,
        period_end: periodEnd,
        status: status || 'pending',
        payment_method: paymentMethod?.trim() || null,
        payment_reference: paymentReference?.trim() || null,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        notes: notes?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
      .select('*, affiliates(id, name, email, affiliate_code)')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create payout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payout: {
        _id: payout.id,
        affiliateId: payout.affiliate_id,
        affiliate: payout.affiliates ? {
          id: payout.affiliates.id,
          name: payout.affiliates.name,
          email: payout.affiliates.email,
          affiliateCode: payout.affiliates.affiliate_code
        } : null,
        amount: parseFloat(payout.amount || '0.00'),
        commissionRate: parseFloat(payout.commission_rate || '0.00'),
        periodStart: payout.period_start,
        periodEnd: payout.period_end,
        status: payout.status,
        paymentMethod: payout.payment_method,
        paymentReference: payout.payment_reference,
        paidAt: payout.paid_at,
        notes: payout.notes,
        created_at: payout.created_at,
        updated_at: payout.updated_at
      }
    });
  } catch (error) {
    console.error('Create payout error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payout' },
      { status: 500 }
    );
  }
}
