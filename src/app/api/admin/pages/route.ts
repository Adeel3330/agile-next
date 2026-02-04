import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/pages?search=&page=&limit=&status=&template=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10', status, template } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('pages')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (status && typeof status === 'string' && status.trim().length > 0) {
      query = query.eq('status', status.trim());
    }

    if (template && typeof template === 'string' && template.trim().length > 0) {
      query = query.eq('template', template.trim());
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},slug.ilike.${searchTerm},seo_title.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: pages, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch pages' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedPages = (pages || []).map((page: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      pages: mappedPages,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Pages list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/admin/pages
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
      content, 
      fileUrl,
      seoTitle, 
      seoDescription, 
      seoKeywords, 
      seoImage,
      status,
      template 
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide page title' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    let pageSlug = slug?.trim() || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if slug already exists and append number if needed
    let finalSlug = pageSlug;
    let slugCounter = 1;
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', finalSlug)
        .is('deleted_at', null)
        .maybeSingle();

      if (!existing) break;
      finalSlug = `${pageSlug}-${slugCounter}`;
      slugCounter++;
    }
    pageSlug = finalSlug;

    const insertData: any = {
      title: title.trim(),
      slug: pageSlug,
      content: content?.trim() || null,
      file_url: fileUrl?.trim() || null,
      seo_title: seoTitle?.trim() || null,
      seo_description: seoDescription?.trim() || null,
      seo_keywords: seoKeywords?.trim() || null,
      seo_image: seoImage?.trim() || null,
      status: status || 'draft',
      template: template?.trim() || null,
      published_at: status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create page' },
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
    console.error('Create page error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create page' },
      { status: 500 }
    );
  }
}
