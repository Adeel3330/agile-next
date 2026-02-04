import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/services/[slug]
// Public API - no authentication required
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();

    if (error || !service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    // Get category if exists
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
        id: service.id,
        title: service.title,
        slug: service.slug,
        description: service.description,
        content: service.content,
        categoryId: service.category_id,
        category: category,
        imageUrl: service.image_url,
        icon: service.icon,
        displayOrder: service.display_order,
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
