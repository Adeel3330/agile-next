import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/pages/[id]
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

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      page: {
        _id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        sections: page.sections || [],
        seoTitle: page.seo_title,
        seoDescription: page.seo_description,
        seoKeywords: page.seo_keywords,
        seoImage: page.seo_image,
        status: page.status,
        template: page.template,
        publishedAt: page.published_at,
        created_at: page.created_at,
        updated_at: page.updated_at
      }
    });
  } catch (error) {
    console.error('Get page error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/pages/[id]
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
    const { 
      title, 
      slug, 
      content, 
      sections, 
      seoTitle, 
      seoDescription, 
      seoKeywords, 
      seoImage,
      status,
      template 
    } = body;

    // Check if page exists
    const { data: existing } = await supabaseAdmin
      .from('pages')
      .select('id, slug')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    const pageSlug = slug?.trim() || existing.slug;
    if (pageSlug !== existing.slug) {
      const { data: slugExists } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', pageSlug)
        .neq('id', id)
        .is('deleted_at', null)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { success: false, message: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = pageSlug;
    if (content !== undefined) updateData.content = content?.trim() || null;
    if (sections !== undefined) updateData.sections = sections || [];
    if (seoTitle !== undefined) updateData.seo_title = seoTitle?.trim() || null;
    if (seoDescription !== undefined) updateData.seo_description = seoDescription?.trim() || null;
    if (seoKeywords !== undefined) updateData.seo_keywords = seoKeywords?.trim() || null;
    if (seoImage !== undefined) updateData.seo_image = seoImage?.trim() || null;
    if (status !== undefined) {
      updateData.status = status;
      // Set published_at when status changes to published
      if (status === 'published' && !existing.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (template !== undefined) updateData.template = template?.trim() || null;

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update page' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      page: {
        _id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        sections: page.sections || [],
        seoTitle: page.seo_title,
        seoDescription: page.seo_description,
        seoKeywords: page.seo_keywords,
        seoImage: page.seo_image,
        status: page.status,
        template: page.template,
        publishedAt: page.published_at,
        created_at: page.created_at,
        updated_at: page.updated_at
      }
    });
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pages/[id] (soft delete)
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

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !page) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
