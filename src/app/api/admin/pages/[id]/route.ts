import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/pages/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        fileUrl: page.file_url,
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
  { params }: { params: Promise<{ id: string }> }
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
      content, 
      fileUrl,
      seoTitle, 
      seoDescription, 
      seoKeywords, 
      seoImage,
      status,
      template 
    } = body;

    // Check if page exists and get current data for versioning
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { success: false, message: 'Page not found' },
        { status: 404 }
      );
    }

    // Generate slug from title if title changed and slug not provided, or use provided slug
    let pageSlug = slug?.trim() || existing.slug;
    if (title && title !== existing.title && !slug) {
      // Auto-generate slug from new title
      pageSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    // Check if slug is being changed and if new slug already exists
    if (pageSlug !== existing.slug) {
      // If slug exists, append number
      let finalSlug = pageSlug;
      let slugCounter = 1;
      while (true) {
        const { data: slugExists } = await supabaseAdmin
          .from('pages')
          .select('id')
          .eq('slug', finalSlug)
          .neq('id', id)
          .is('deleted_at', null)
          .maybeSingle();

        if (!slugExists) break;
        finalSlug = `${pageSlug}-${slugCounter}`;
        slugCounter++;
      }
      pageSlug = finalSlug;
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined || (title && title !== existing.title)) updateData.slug = pageSlug;
    if (content !== undefined) updateData.content = content?.trim() || null;
    if (fileUrl !== undefined) updateData.file_url = fileUrl?.trim() || null;
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

    // Check if there are actual changes (not just updated_at)
    const hasChanges = Object.keys(updateData).some(key => {
      if (key === 'updated_at') return false;
      const newValue = updateData[key];
      const oldValue = existing[key as keyof typeof existing];
      
      return newValue !== oldValue;
    });

    // Create a version before updating if there are actual changes
    if (hasChanges) {
      try {
        // Get the next version number
        const { data: maxVersion } = await supabaseAdmin
          .from('page_versions')
          .select('version_number')
          .eq('page_id', id)
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextVersion = (maxVersion?.version_number || 0) + 1;

        // Create version with current (OLD) data
        const { error: versionError } = await supabaseAdmin
          .from('page_versions')
          .insert({
            page_id: id,
            version_number: nextVersion,
            title: existing.title,
            slug: existing.slug,
            content: existing.content,
            file_url: existing.file_url,
            seo_title: existing.seo_title,
            seo_description: existing.seo_description,
            seo_keywords: existing.seo_keywords,
            seo_image: existing.seo_image,
            status: existing.status,
            template: existing.template,
            change_note: 'Auto-saved version before update'
          });

        if (versionError) {
          console.error('Failed to create version:', versionError);
          // Don't fail the update if versioning fails, but log it
        }
      } catch (versionError) {
        // Log but don't fail the update if versioning fails
        console.warn('Failed to create version:', versionError);
      }
    }

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
        fileUrl: page.file_url,
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
  { params }: { params: Promise<{ id: string }> }
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
