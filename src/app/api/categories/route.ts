import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/categories
// Public API - no authentication required
export async function GET(req: NextRequest) {
  try {
    // Get all categories (no pagination for sidebar)
    const { data: categories, error } = await supabaseAdmin
      .from('blog_categories')
      .select('*')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Create a map of all categories by id for quick lookup
    const categoryMap = new Map((categories || []).map((cat: any) => [cat.id, cat]));

    // Map Supabase column names to frontend expected names and resolve parents
    const mappedCategories = (categories || []).map((cat: any) => {
      let parent = null;
      if (cat.parent_id) {
        const parentCat = categoryMap.get(cat.parent_id);
        if (parentCat) {
          parent = {
            id: parentCat.id,
            name: parentCat.name,
            slug: parentCat.slug
          };
        }
      }
      
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: cat.parent_id,
        parent: parent,
        created_at: cat.created_at,
        updated_at: cat.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      categories: mappedCategories
    });
  } catch (error) {
    console.error('Categories list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
