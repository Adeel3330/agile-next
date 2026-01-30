import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/blog-categories?search=&page=&limit=
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

    // First, get all categories
    let query = supabaseAdmin
      .from('blog_categories')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},slug.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: categories, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch blog categories', error: process.env.NODE_ENV === 'development' ? error.message : undefined },
        { status: 500 }
      );
    }

    // Create a map of all categories by id for quick lookup
    const categoryMap = new Map((categories || []).map((cat: any) => [cat.id, cat]));

    // Map Supabase column names to frontend expected names and resolve parents
    const mappedCategories = (categories || []).map((cat: any) => {
      let parent = null;
      if (cat.parent_id) {
        const parentCat = categoryMap.get(cat.parent_id);
        if (parentCat) {
          parent = {
            id: parentCat.id,
            name: parentCat.name,
            slug: parentCat.slug
          };
        }
      }
      
      return {
        _id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: cat.parent_id,
        parent: parent,
        created_at: cat.created_at,
        updated_at: cat.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      categories: mappedCategories,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Blog categories list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog-categories
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
    const { name, slug, description, parentId } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a category name' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const categorySlug = slug?.trim() || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Validate parent_id if provided (prevent circular references)
    if (parentId) {
      // Check if parent exists and is not deleted
      const { data: parent } = await supabaseAdmin
        .from('blog_categories')
        .select('id')
        .eq('id', parentId)
        .is('deleted_at', null)
        .single();

      if (!parent) {
        return NextResponse.json(
          { success: false, message: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    const { data: category, error } = await supabaseAdmin
      .from('blog_categories')
      .insert({
        name: name.trim(),
        slug: categorySlug,
        description: description?.trim() || null,
        parent_id: parentId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { success: false, message: 'Category name or slug already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create blog category',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    // Fetch parent if exists
    let parent = null;
    if (category.parent_id) {
      const { data: parentCat } = await supabaseAdmin
        .from('blog_categories')
        .select('id, name, slug')
        .eq('id', category.parent_id)
        .is('deleted_at', null)
        .single();
      
      if (parentCat) {
        parent = {
          id: parentCat.id,
          name: parentCat.name,
          slug: parentCat.slug
        };
      }
    }

    // Map to frontend expected format
    const mappedCategory = {
      _id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parent_id,
      parent: parent,
      created_at: category.created_at,
      updated_at: category.updated_at
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Blog category created successfully',
        category: mappedCategory
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create blog category error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create blog category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
