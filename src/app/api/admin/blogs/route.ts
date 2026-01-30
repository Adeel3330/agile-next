import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { isCloudinaryUrl } from '@/lib/cloudinary-utils';

// GET /api/admin/blogs?search=&page=&limit=
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
      .from('blogs')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},seo_title.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: blogs, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch blogs' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedBlogs = (blogs || []).map((blog: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      blogs: mappedBlogs,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Blogs list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/blogs
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

    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .insert({
        title: title.trim(),
        slug: blogSlug,
        description: description?.trim() || null,
        content: content?.trim() || null,
        file: file.trim(),
        seo_title: seoTitle?.trim() || null,
        seo_content: seoContent?.trim() || null,
        category_id: categoryId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create blog. Please check all required fields.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
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

    return NextResponse.json(
      {
        success: true,
        message: 'Blog created successfully',
        blog: mappedBlog
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create blog error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create blog. Please check all required fields.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
