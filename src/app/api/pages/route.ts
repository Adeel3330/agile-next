import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/pages?template=
// Public API - no authentication required
// Fetch published pages by template
export async function GET(req: NextRequest) {
  try {
    const { template } = Object.fromEntries(req.nextUrl.searchParams);

    let query = supabaseAdmin
      .from('pages')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null);

    // Filter by template if provided
    if (template && typeof template === 'string' && template.trim().length > 0) {
      query = query.eq('template', template.trim());
    }

    query = query.order('created_at', { ascending: false }).limit(1);

    const { data: pages, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch pages' },
        { status: 500 }
      );
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json({
        success: true,
        page: null
      });
    }

    const page = pages[0];

    // Parse sections if it's a JSON string
    let parsedSections = page.sections || [];
    if (typeof page.sections === 'string') {
      try {
        parsedSections = JSON.parse(page.sections);
      } catch (e) {
        console.error('Failed to parse sections JSON:', e);
        parsedSections = [];
      }
    }

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        sections: parsedSections,
        seoTitle: page.seo_title,
        seoDescription: page.seo_description,
        seoKeywords: page.seo_keywords,
        seoImage: page.seo_image,
        template: page.template,
        publishedAt: page.published_at,
        created_at: page.created_at,
        updated_at: page.updated_at
      }
    });
  } catch (error) {
    console.error('Get pages error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}
