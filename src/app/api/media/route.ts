import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/media?position=
// Public API - Get active media items by position (no authentication required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const position = searchParams.get('position') || '';

    if (!position) {
      return NextResponse.json(
        { success: false, message: 'Please provide a position parameter' },
        { status: 400 }
      );
    }

    // Validate position
    const validPositions = ['home', 'services', 'about', 'contact', 'cta', 'compliance', 'other'];
    if (!validPositions.includes(position)) {
      return NextResponse.json(
        { success: false, message: 'Invalid position. Must be: home, services, about, contact, cta, compliance, or other' },
        { status: 400 }
      );
    }

    const { data: mediaItems, error } = await supabaseAdmin
      .from('media')
      .select('*')
      .eq('position', position)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch media' },
        { status: 500 }
      );
    }

    const mappedMedia = (mediaItems || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      fileUrl: item.file_url,
      fileName: item.file_name,
      fileSize: item.file_size,
      fileType: item.file_type,
      position: item.position,
      status: item.status,
      displayOrder: item.display_order,
      altText: item.alt_text,
      linkUrl: item.link_url,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    return NextResponse.json({
      success: true,
      media: mappedMedia
    });
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
