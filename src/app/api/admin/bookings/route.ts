import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/bookings
// Admin API - List bookings with filters and pagination
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '20', status } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);

    let query = supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Filter by status
    if (status && typeof status === 'string' && status.trim().length > 0) {
      query = query.eq('status', status.trim());
    }

    // Search functionality
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},service_name.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
