import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/services?search=&page=&limit=&category=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10', category } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('services')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (category && typeof category === 'string' && category.trim().length > 0) {
      query = query.eq('category_id', category.trim());
    }

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
        .from('service_categories')
        .select('id, name, slug')
        .in('id', categoryIds);
      categoryMap = new Map((categories || []).map((cat: any) => [cat.id, cat]));
    }

    const mappedServices = (services || []).map((service: any) => {
      const category = service.category_id ? categoryMap.get(service.category_id) : null;
      
      return {
        _id: service.id,
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
        status: service.status,
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

// POST /api/admin/services
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

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide service title' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const serviceSlug = slug?.trim() || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('services')
      .select('id')
      .eq('slug', serviceSlug)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A service with this slug already exists' },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (categoryId) {
      const { data: category } = await supabaseAdmin
        .from('service_categories')
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

    const insertData: any = {
      title: title.trim(),
      slug: serviceSlug,
      description: description?.trim() || null,
      content: content?.trim() || null,
      category_id: categoryId || null,
      image_url: imageUrl?.trim() || null,
      icon: icon?.trim() || null,
      display_order: displayOrder || 0,
      status: status || 'active',
      seo_title: seoTitle?.trim() || null,
      seo_description: seoDescription?.trim() || null,
      seo_keywords: seoKeywords?.trim() || null,
      seo_image: seoImage?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create service' },
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
    console.error('Create service error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service' },
      { status: 500 }
    );
  }
}
