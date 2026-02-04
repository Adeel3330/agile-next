import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/pages/[slug]
// Public API - no authentication required
// Fetch published page by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

    const { data: page, error } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
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
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        fileUrl: page.file_url,
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
    console.error('Get page error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}
