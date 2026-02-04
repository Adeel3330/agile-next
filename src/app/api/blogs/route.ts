import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/blogs?search=&page=&limit=&category=
// Public API - no authentication required
export async function GET(req: NextRequest) {
  try {
    const { search, page = '1', limit = '12', category } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 12, 1),
      50
    );

    let query = supabaseAdmin
      .from('blogs')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Filter by category if provided
    if (category && typeof category === 'string' && category.trim().length > 0) {
      // First, get category ID from slug
      const { data: categoryData } = await supabaseAdmin
        .from('blog_categories')
        .select('id')
        .eq('slug', category.trim())
        .is('deleted_at', null)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Search functionality
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},content.ilike.${searchTerm}`);
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

    // Get all categories for mapping
    const { data: allCategories } = await supabaseAdmin
      .from('blog_categories')
      .select('id, name, slug')
      .is('deleted_at', null);

    const categoryMap = new Map((allCategories || []).map((cat: any) => [cat.id, cat]));

    // Map Supabase column names to frontend expected names
    const mappedBlogs = (blogs || []).map((blog: any) => {
      const category = blog.category_id ? categoryMap.get(blog.category_id) : null;
      
      return {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        content: blog.content,
        file: blog.file,
        seoTitle: blog.seo_title,
        seoContent: blog.seo_content,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug
        } : null,
        created_at: blog.created_at,
        updated_at: blog.updated_at
      };
    });

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
