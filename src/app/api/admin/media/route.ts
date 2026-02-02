import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/media?search=&page=&limit=&position=&status=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10', position, status } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('media')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (position && typeof position === 'string' && position.trim().length > 0) {
      query = query.eq('position', position.trim());
    }

    if (status && typeof status === 'string' && status.trim().length > 0) {
      query = query.eq('status', status.trim());
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},file_name.ilike.${searchTerm}`);
    }

    query = query
      .order('position', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: media, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch media' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedMedia = (media || []).map((item: any) => ({
      _id: item.id,
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
      media: mappedMedia,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST /api/admin/media
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
      fileUrl,
      fileName,
      fileSize,
      fileType,
      position,
      status,
      displayOrder,
      altText,
      linkUrl
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide media title' },
        { status: 400 }
      );
    }

    if (!fileUrl || typeof fileUrl !== 'string' || fileUrl.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide file URL' },
        { status: 400 }
      );
    }

    if (!position || !['home', 'services', 'about', 'contact', 'other'].includes(position)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid position (home, services, about, contact, other)' },
        { status: 400 }
      );
    }

    const insertData: any = {
      title: title.trim(),
      description: description?.trim() || null,
      file_url: fileUrl.trim(),
      file_name: fileName?.trim() || null,
      file_size: fileSize || null,
      file_type: fileType?.trim() || null,
      position: position,
      status: status || 'active',
      display_order: displayOrder || 0,
      alt_text: altText?.trim() || null,
      link_url: linkUrl?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    const { data: mediaItem, error } = await supabaseAdmin
      .from('media')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create media item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: {
        _id: mediaItem.id,
        title: mediaItem.title,
        description: mediaItem.description,
        fileUrl: mediaItem.file_url,
        fileName: mediaItem.file_name,
        fileSize: mediaItem.file_size,
        fileType: mediaItem.file_type,
        position: mediaItem.position,
        status: mediaItem.status,
        displayOrder: mediaItem.display_order,
        altText: mediaItem.alt_text,
        linkUrl: mediaItem.link_url,
        created_at: mediaItem.created_at,
        updated_at: mediaItem.updated_at
      }
    });
  } catch (error) {
    console.error('Create media error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create media item' },
      { status: 500 }
    );
  }
}
