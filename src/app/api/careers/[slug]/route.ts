import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/careers/[slug]
// Public API - Get a single career by slug (no authentication required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'open')
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch career' },
        { status: 500 }
      );
    }

    if (!career) {
      return NextResponse.json(
        { success: false, message: 'Career not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      career: {
        id: career.id,
        title: career.title,
        slug: career.slug,
        department: career.department,
        location: career.location,
        type: career.type,
        status: career.status,
        description: career.description,
        requirements: career.requirements,
        created_at: career.created_at,
        updated_at: career.updated_at
      }
    });
  } catch (error) {
    console.error('Career detail error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch career' },
      { status: 500 }
    );
  }
}
