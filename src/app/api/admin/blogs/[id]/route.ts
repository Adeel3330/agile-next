import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { isCloudinaryUrl } from '@/lib/cloudinary-utils';

// GET /api/admin/blogs/[id]
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

    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Map to frontend expected format
    const mappedBlog = {
      _id: blog.id,
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      content: blog.content,
      file: blog.file,
      seoTitle: blog.seo_title,
      seoContent: blog.seo_content,
      categoryId: blog.category_id || null,
      created_at: blog.created_at,
      updated_at: blog.updated_at
    };

    return NextResponse.json({
      success: true,
      blog: mappedBlog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blogs/[id]
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
      description,
      content,
      file,
      seoTitle,
      seoContent,
      categoryId
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a title' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const blogSlug = slug?.trim() || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (!file || typeof file !== 'string' || file.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a file URL' },
        { status: 400 }
      );
    }

    // Validate that file URL is from Cloudinary (no static files allowed)
    if (!isCloudinaryUrl(file)) {
      return NextResponse.json(
        { success: false, message: 'File must be uploaded to Cloudinary. Static file paths are not allowed.' },
        { status: 400 }
      );
    }

    const updates: any = {
      title: title.trim(),
      slug: blogSlug,
      description: description?.trim() || null,
      content: content?.trim() || null,
      file: file.trim(),
      seo_title: seoTitle?.trim() || null,
      seo_content: seoContent?.trim() || null,
      category_id: categoryId || null,
      updated_at: new Date().toISOString()
    };

    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Map to frontend expected format
    const mappedBlog = {
      _id: blog.id,
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      content: blog.content,
      file: blog.file,
      seoTitle: blog.seo_title,
      seoContent: blog.seo_content,
      created_at: blog.created_at,
      updated_at: blog.updated_at
    };

    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
      blog: mappedBlog
    });
  } catch (error: any) {
    console.error('Update blog error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to update blog'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blogs/[id] (Soft Delete)
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

    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
