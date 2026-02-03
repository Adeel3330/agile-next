import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/service-categories
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '50', parent } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 50, 1),
      100
    );

    let query = supabaseAdmin
      .from('service_categories')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (parent === 'null' || parent === '') {
      query = query.is('parent_id', null);
    } else if (parent && parent !== 'all') {
      query = query.eq('parent_id', parent);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    query = query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: categories, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch service categories' },
        { status: 500 }
      );
    }

    // Get parent categories for mapping
    const categoryIds = (categories || []).map((cat: any) => cat.parent_id).filter(Boolean);
    let parentMap = new Map();
    if (categoryIds.length > 0) {
      const { data: parents } = await supabaseAdmin
        .from('service_categories')
        .select('id, name')
        .in('id', categoryIds);
      parentMap = new Map((parents || []).map((p: any) => [p.id, p.name]));
    }

    const mappedCategories = (categories || []).map((category: any) => ({
      _id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parent_id,
      parentName: category.parent_id ? parentMap.get(category.parent_id) : null,
      displayOrder: category.display_order,
      status: category.status,
      created_at: category.created_at,
      updated_at: category.updated_at
    }));

    return NextResponse.json({
      success: true,
      categories: mappedCategories,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Service categories list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/service-categories
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
    const { name, slug, description, parentId, displayOrder, status } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide category name' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const categorySlug = slug?.trim() || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('service_categories')
      .select('id')
      .eq('slug', categorySlug)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    // Validate parent if provided
    if (parentId) {
      const { data: parent } = await supabaseAdmin
        .from('service_categories')
        .select('id')
        .eq('id', parentId)
        .is('deleted_at', null)
        .maybeSingle();

      if (!parent) {
        return NextResponse.json(
          { success: false, message: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    const insertData: any = {
      name: name.trim(),
      slug: categorySlug,
      description: description?.trim() || null,
      parent_id: parentId || null,
      display_order: displayOrder || 0,
      status: status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    const { data: category, error } = await supabaseAdmin
      .from('service_categories')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create service category' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: {
        _id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parent_id,
        displayOrder: category.display_order,
        status: category.status,
        created_at: category.created_at,
        updated_at: category.updated_at
      }
    });
  } catch (error) {
    console.error('Create service category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service category' },
      { status: 500 }
    );
  }
}
