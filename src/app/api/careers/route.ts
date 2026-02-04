import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/careers
// Public API - Get all open careers (no authentication required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const search = searchParams.get('search') || '';

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

    let query = supabaseAdmin
      .from('careers')
      .select('*', { count: 'exact' })
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (search && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},department.ilike.${searchTerm},location.ilike.${searchTerm},type.ilike.${searchTerm}`);
    }

    query = query.range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: careers, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch careers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      careers: careers || [],
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Careers list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch careers' },
      { status: 500 }
    );
  }
}
