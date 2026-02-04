import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/blogs/[slug]
// Public API - no authentication required
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error || !blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Get category if exists
    let category = null;
    if (blog.category_id) {
      const { data: categoryData } = await supabaseAdmin
        .from('blog_categories')
        .select('id, name, slug')
        .eq('id', blog.category_id)
        .is('deleted_at', null)
        .single();

      if (categoryData) {
        category = {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug
        };
      }
    }

    // Map to frontend expected format
    const mappedBlog = {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      content: blog.content,
      file: blog.file,
      seoTitle: blog.seo_title,
      seoContent: blog.seo_content,
      category: category,
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
