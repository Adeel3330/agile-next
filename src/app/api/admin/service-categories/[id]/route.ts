import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/service-categories/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const { data: category, error } = await supabaseAdmin
      .from('service_categories')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !category) {
      return NextResponse.json(
        { success: false, message: 'Service category not found' },
        { status: 404 }
      );
    }

    // Get parent name if exists
    let parentName = null;
    if (category.parent_id) {
      const { data: parent } = await supabaseAdmin
        .from('service_categories')
        .select('name')
        .eq('id', category.parent_id)
        .maybeSingle();
      parentName = parent?.name || null;
    }

    return NextResponse.json({
      success: true,
      category: {
        _id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parent_id,
        parentName: parentName,
        displayOrder: category.display_order,
        status: category.status,
        created_at: category.created_at,
        updated_at: category.updated_at
      }
    });
  } catch (error) {
    console.error('Get service category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/service-categories/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await req.json();
    const { name, slug, description, parentId, displayOrder, status } = body;

    // Check if category exists
    const { data: existing } = await supabaseAdmin
      .from('service_categories')
      .select('id, slug')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Service category not found' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    const categorySlug = slug?.trim() || existing.slug;
    if (categorySlug !== existing.slug) {
      const { data: slugExists } = await supabaseAdmin
        .from('service_categories')
        .select('id')
        .eq('slug', categorySlug)
        .neq('id', id)
        .is('deleted_at', null)
        .maybeSingle();

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Validate parent if provided (prevent circular references)
    if (parentId) {
      if (parentId === id) {
        return NextResponse.json(
          { success: false, message: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }

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

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) updateData.slug = categorySlug;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (parentId !== undefined) updateData.parent_id = parentId || null;
    if (displayOrder !== undefined) updateData.display_order = displayOrder;
    if (status !== undefined) updateData.status = status;

    const { data: category, error } = await supabaseAdmin
      .from('service_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update service category' },
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
    console.error('Update service category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/service-categories/[id] (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    // Check if category has children
    const { data: children } = await supabaseAdmin
      .from('service_categories')
      .select('id')
      .eq('parent_id', id)
      .is('deleted_at', null)
      .limit(1);

    if (children && children.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete category with child categories. Please delete or move child categories first.' },
        { status: 400 }
      );
    }

    // Check if category has services
    const { data: services } = await supabaseAdmin
      .from('services')
      .select('id')
      .eq('category_id', id)
      .is('deleted_at', null)
      .limit(1);

    if (services && services.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete category with services. Please delete or move services first.' },
        { status: 400 }
      );
    }

    const { data: category, error } = await supabaseAdmin
      .from('service_categories')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !category) {
      return NextResponse.json(
        { success: false, message: 'Service category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service category deleted successfully'
    });
  } catch (error) {
    console.error('Delete service category error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete service category' },
      { status: 500 }
    );
  }
}
