import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/services?search=&page=&limit=&category=
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
      .from('services')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .is('deleted_at', null);

    // Filter by category if provided
    if (category && typeof category === 'string' && category.trim().length > 0) {
      // First, get category ID from slug
      const { data: categoryData } = await supabaseAdmin
        .from('blog_categories')
        .select('id')
        .eq('slug', category.trim())
        .is('deleted_at', null)
        .maybeSingle();

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
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: services, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch services' },
        { status: 500 }
      );
    }

    // Get all categories for mapping
    const categoryIds = (services || []).map((s: any) => s.category_id).filter(Boolean);
    let categoryMap = new Map();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabaseAdmin
        .from('blog_categories')
        .select('id, name, slug')
        .in('id', categoryIds);
      categoryMap = new Map((categories || []).map((cat: any) => [cat.id, cat]));
    }

    const mappedServices = (services || []).map((service: any) => {
      const category = service.category_id ? categoryMap.get(service.category_id) : null;
      
      return {
        id: service.id,
        title: service.title,
        slug: service.slug,
        description: service.description,
        content: service.content,
        categoryId: service.category_id,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug
        } : null,
        imageUrl: service.image_url,
        icon: service.icon,
        displayOrder: service.display_order,
        seoTitle: service.seo_title,
        seoDescription: service.seo_description,
        seoKeywords: service.seo_keywords,
        seoImage: service.seo_image,
        created_at: service.created_at,
        updated_at: service.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      services: mappedServices,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Services list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
