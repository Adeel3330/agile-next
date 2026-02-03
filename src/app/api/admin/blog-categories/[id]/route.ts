import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/blog-categories/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { id } = params;

    const { data: category, error } = await supabaseAdmin
      .from('blog_categories')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !category) {
      return NextResponse.json(
        { success: false, message: 'Blog category not found' },
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      category: mappedCategory
    });
  } catch (error) {
    console.error('Get blog category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blog-categories/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { id } = params;
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

    // Validate parent_id if provided (prevent circular references and self-reference)
    if (parentId) {
      if (parentId === id) {
        return NextResponse.json(
          { success: false, message: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }

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

    // Check if slug already exists for this parent_id (excluding current category)
    // Slug uniqueness per parent
    let existingCategoryQuery = supabaseAdmin
      .from('blog_categories')
      .select('id, name, slug, parent_id')
      .eq('slug', categorySlug)
      .neq('id', id)
      .is('deleted_at', null);

    if (parentId) {
      existingCategoryQuery = existingCategoryQuery.eq('parent_id', parentId);
    } else {
      existingCategoryQuery = existingCategoryQuery.is('parent_id', null);
    }

    const { data: existingCategory } = await existingCategoryQuery.maybeSingle();

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: `Category slug "${categorySlug}" already exists for this parent category` },
        { status: 409 }
      );
    }

    const updates: any = {
      name: name.trim(),
      slug: categorySlug,
      description: description?.trim() || null,
      parent_id: parentId || null,
      updated_at: new Date().toISOString()
    };

    const { data: category, error } = await supabaseAdmin
      .from('blog_categories')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { success: false, message: 'Category name or slug already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Blog category not found' },
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      message: 'Blog category updated successfully',
      category: mappedCategory
    });
  } catch (error: any) {
    console.error('Update blog category error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to update blog category'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog-categories/[id] (Soft Delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { id } = params;

    const { data: category, error } = await supabaseAdmin
      .from('blog_categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !category) {
      return NextResponse.json(
        { success: false, message: 'Blog category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog category deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete blog category' },
      { status: 500 }
    );
  }
}
