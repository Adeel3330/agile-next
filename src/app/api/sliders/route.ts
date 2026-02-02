import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/sliders
// Public API - Get all active sliders (no authentication required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam || '0', 10) || 0, 1), 20) : 10;

    const { data: sliders, error } = await supabaseAdmin
      .from('sliders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error (sliders):', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch sliders' },
        { status: 500 }
      );
    }

    const mappedSliders = (sliders || []).map((slider: any) => ({
      id: slider.id,
      title: slider.title,
      description: slider.description,
      file: slider.file,
      fileType: slider.file_type || 'image',
      seoTitle: slider.seo_title,
      seoContent: slider.seo_content,
      created_at: slider.created_at,
      updated_at: slider.updated_at,
    }));

    return NextResponse.json({
      success: true,
      sliders: mappedSliders,
    });
  } catch (error) {
    console.error('Public sliders error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sliders' },
      { status: 500 }
    );
  }
}