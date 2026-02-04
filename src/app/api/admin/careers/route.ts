import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/careers?search=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10' } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('careers')
      .select('*', { count: 'exact' });

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},department.ilike.${searchTerm},location.ilike.${searchTerm},type.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

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

// POST /api/admin/careers
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
    const {
      title,
      slug,
      department,
      location,
      type,
      status,
      description,
      requirements
    } = body;

    // Map 'active' to 'open' for backward compatibility
    let careerStatus: 'open' | 'closed' | 'draft' = 'open';
    if (status === 'active') {
      careerStatus = 'open';
    } else if (status === 'closed') {
      careerStatus = 'closed';
    } else if (status === 'draft') {
      careerStatus = 'draft';
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a job title' },
        { status: 400 }
      );
    }

    // Use provided slug or generate from title
    const careerSlug = slug?.trim() || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug already exists, append number if needed
    let finalSlug = careerSlug;
    let slugCounter = 1;
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from('careers')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle();
      
      if (!existing) break;
      finalSlug = `${careerSlug}-${slugCounter}`;
      slugCounter++;
    }

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .insert({
        title: title.trim(),
        slug: finalSlug,
        department: department?.trim() || null,
        location: location?.trim() || null,
        type: type?.trim() || null,
        status: careerStatus,
        description: description?.trim() || null,
        requirements: requirements?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create career. Please check all required fields.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Career created successfully',
        data: career
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create career error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create career. Please check all required fields.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

