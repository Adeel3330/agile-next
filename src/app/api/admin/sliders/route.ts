import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { isCloudinaryUrl } from '@/lib/cloudinary-utils';

// GET /api/admin/sliders?search=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10' } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('sliders')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},seo_title.ilike.${searchTerm}`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: sliders, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch sliders' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedSliders = (sliders || []).map((slider: any) => ({
      _id: slider.id,
      title: slider.title,
      description: slider.description,
      file: slider.file,
      fileType: slider.file_type,
      seoTitle: slider.seo_title,
      seoContent: slider.seo_content,
      created_at: slider.created_at,
      updated_at: slider.updated_at
    }));

    return NextResponse.json({
      success: true,
      sliders: mappedSliders,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Sliders list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sliders' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sliders
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
      description,
      file,
      fileType,
      seoTitle,
      seoContent
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a title' },
        { status: 400 }
      );
    }

    if (!file || typeof file !== 'string' || file.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a file URL' },
        { status: 400 }
      );
    }

    // Validate that file URL is from Cloudinary (no static files allowed)
    if (!isCloudinaryUrl(file)) {
      return NextResponse.json(
        { success: false, message: 'File must be uploaded to Cloudinary. Static file paths are not allowed.' },
        { status: 400 }
      );
    }

    const { data: slider, error } = await supabaseAdmin
      .from('sliders')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        file: file.trim(),
        file_type: fileType || 'image',
        seo_title: seoTitle?.trim() || null,
        seo_content: seoContent?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create slider. Please check all required fields.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    // Map to frontend expected format
    const mappedSlider = {
      _id: slider.id,
      title: slider.title,
      description: slider.description,
      file: slider.file,
      fileType: slider.file_type,
      seoTitle: slider.seo_title,
      seoContent: slider.seo_content,
      created_at: slider.created_at,
      updated_at: slider.updated_at
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Slider created successfully',
        slider: mappedSlider
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create slider error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create slider. Please check all required fields.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
