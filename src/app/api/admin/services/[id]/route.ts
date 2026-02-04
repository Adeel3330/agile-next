import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/services/[id]
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

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    // Get category if exists (from blog_categories table)
    let category = null;
    if (service.category_id) {
      const { data: categoryData } = await supabaseAdmin
        .from('blog_categories')
        .select('id, name, slug')
        .eq('id', service.category_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (categoryData) {
        category = {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug
        };
      }
    }

    return NextResponse.json({
      success: true,
      service: {
        _id: service.id,
        title: service.title,
        slug: service.slug,
        description: service.description,
        content: service.content,
        categoryId: service.category_id,
        category: category,
        imageUrl: service.image_url,
        icon: service.icon,
        displayOrder: service.display_order,
        status: service.status,
        seoTitle: service.seo_title,
        seoDescription: service.seo_description,
        seoKeywords: service.seo_keywords,
        seoImage: service.seo_image,
        created_at: service.created_at,
        updated_at: service.updated_at
      }
    });
  } catch (error) {
    console.error('Get service error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/services/[id]
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
    const { 
      title, 
      slug, 
      description, 
      content,
      categoryId,
      imageUrl,
      icon,
      displayOrder,
      status,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoImage
    } = body;

    // Check if service exists
    const { data: existing } = await supabaseAdmin
      .from('services')
      .select('id, slug')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    const serviceSlug = slug?.trim() || existing.slug;
    if (serviceSlug !== existing.slug) {
      const { data: slugExists } = await supabaseAdmin
        .from('services')
        .select('id')
        .eq('slug', serviceSlug)
        .neq('id', id)
        .is('deleted_at', null)
        .maybeSingle();

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'A service with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Validate category if provided (from blog_categories table)
    if (categoryId) {
      const { data: category } = await supabaseAdmin
        .from('blog_categories')
        .select('id')
        .eq('id', categoryId)
        .is('deleted_at', null)
        .maybeSingle();

      if (!category) {
        return NextResponse.json(
          { success: false, message: 'Service category not found' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = serviceSlug;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (content !== undefined) updateData.content = content?.trim() || null;
    if (categoryId !== undefined) updateData.category_id = categoryId || null;
    if (imageUrl !== undefined) updateData.image_url = imageUrl?.trim() || null;
    if (icon !== undefined) updateData.icon = icon?.trim() || null;
    if (displayOrder !== undefined) updateData.display_order = displayOrder;
    if (status !== undefined) updateData.status = status;
    if (seoTitle !== undefined) updateData.seo_title = seoTitle?.trim() || null;
    if (seoDescription !== undefined) updateData.seo_description = seoDescription?.trim() || null;
    if (seoKeywords !== undefined) updateData.seo_keywords = seoKeywords?.trim() || null;
    if (seoImage !== undefined) updateData.seo_image = seoImage?.trim() || null;

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      service: {
        _id: service.id,
        title: service.title,
        slug: service.slug,
        description: service.description,
        content: service.content,
        categoryId: service.category_id,
        imageUrl: service.image_url,
        icon: service.icon,
        displayOrder: service.display_order,
        status: service.status,
        seoTitle: service.seo_title,
        seoDescription: service.seo_description,
        seoKeywords: service.seo_keywords,
        seoImage: service.seo_image,
        created_at: service.created_at,
        updated_at: service.updated_at
      }
    });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/services/[id] (soft delete)
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

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
