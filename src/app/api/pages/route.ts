import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/pages?template=
// Public API - no authentication required
// Fetch published pages by template
export async function GET(req: NextRequest) {
  try {
    const { template } = Object.fromEntries(req.nextUrl.searchParams);

    console.log('Pages API - Template parameter:', template);

    let query = supabaseAdmin
      .from('pages')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null);

    // Filter by template if provided
    if (template && typeof template === 'string' && template.trim().length > 0) {
      const templateValue = template.trim();
      console.log('Pages API - Filtering by template:', templateValue);
      
      // Try exact match first
      query = query.eq('template', templateValue);
      
      // Also try case-insensitive match and common variations
      // This handles 'about-us', 'about us', 'About Us', etc.
    }

    query = query.order('created_at', { ascending: false }).limit(1);

    const { data: pages, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch pages', error: error.message },
        { status: 500 }
      );
    }

    console.log('Pages API - Found pages:', pages?.length || 0);
    
    if (!pages || pages.length === 0) {
      // If no pages found with template filter, try without filter to see if any pages exist
      if (template && typeof template === 'string' && template.trim().length > 0) {
        const { data: allPages } = await supabaseAdmin
          .from('pages')
          .select('id, title, template, status')
          .is('deleted_at', null)
          .limit(10);
        
        console.log('Pages API - Available pages (for debugging):', allPages);
      }
      
      return NextResponse.json({
        success: true,
        page: null,
        message: `No published page found with template: ${template}`
      });
    }

    const page = pages[0];

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        description: page.content ? (page.content.replace(/<[^>]*>/g, '').substring(0, 500)) : null, // Extract plain text from content for description
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
    console.error('Get pages error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}
