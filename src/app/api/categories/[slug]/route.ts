import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/categories/[slug]
// Public API - no authentication required
// Returns child categories of a parent category identified by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

    // First, find the parent category by slug
    const { data: parentCategory, error: parentError } = await supabaseAdmin
      .from('blog_categories')
      .select('id, name, slug')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (parentError || !parentCategory) {
      return NextResponse.json(
        { success: false, message: 'Parent category not found' },
        { status: 404 }
      );
    }

    // Get all child categories of this parent
    const { data: categories, error } = await supabaseAdmin
      .from('blog_categories')
      .select('*')
      .eq('parent_id', parentCategory.id)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedCategories = (categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parentId: cat.parent_id,
      parent: {
        id: parentCategory.id,
        name: parentCategory.name,
        slug: parentCategory.slug
      },
      created_at: cat.created_at,
      updated_at: cat.updated_at
    }));

    return NextResponse.json({
      success: true,
      categories: mappedCategories,
      parent: {
        id: parentCategory.id,
        name: parentCategory.name,
        slug: parentCategory.slug
      }
    });
  } catch (error) {
    console.error('Categories by parent error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
