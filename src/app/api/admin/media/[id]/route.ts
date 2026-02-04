import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/media/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const { data: mediaItem, error } = await supabaseAdmin
      .from('media')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !mediaItem) {
      return NextResponse.json(
        { success: false, message: 'Media item not found' },
        { status: 404 }
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
    console.error('Get media error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch media item' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/media/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
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

    // Check if media item exists
    const { data: existing } = await supabaseAdmin
      .from('media')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Media item not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (fileUrl !== undefined && fileUrl !== null && fileUrl.trim().length > 0) {
      updateData.file_url = fileUrl.trim();
    }
    if (fileName !== undefined) updateData.file_name = fileName?.trim() || null;
    if (fileSize !== undefined) updateData.file_size = fileSize || null;
    if (fileType !== undefined) updateData.file_type = fileType?.trim() || null;
    if (position !== undefined) {
      if (!['home', 'services', 'about', 'contact', 'cta', 'compliance', 'other'].includes(position)) {
        return NextResponse.json(
          { success: false, message: 'Invalid position. Must be: home, services, about, contact, cta, compliance, or other' },
          { status: 400 }
        );
      }
      updateData.position = position;
    }
    if (status !== undefined) updateData.status = status;
    if (displayOrder !== undefined) updateData.display_order = displayOrder;
    if (altText !== undefined) updateData.alt_text = altText?.trim() || null;
    if (linkUrl !== undefined) updateData.link_url = linkUrl?.trim() || null;

    const { data: mediaItem, error } = await supabaseAdmin
      .from('media')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update media item' },
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
    console.error('Update media error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update media item' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/media/[id] (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    // Get media item to delete file from storage
    const { data: mediaItem } = await supabaseAdmin
      .from('media')
      .select('file_url, file_name')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!mediaItem) {
      return NextResponse.json(
        { success: false, message: 'Media item not found' },
        { status: 404 }
      );
    }

    // Soft delete the record
    const { data: deletedItem, error } = await supabaseAdmin
      .from('media')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete media item' },
        { status: 500 }
      );
    }

    // Optionally delete file from storage (uncomment if you want to delete files)
    // if (mediaItem.file_name) {
    //   const { error: storageError } = await supabaseAdmin.storage
    //     .from('media')
    //     .remove([mediaItem.file_name]);
    //   
    //   if (storageError) {
    //     console.error('Storage delete error:', storageError);
    //     // Continue anyway - record is soft deleted
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: 'Media item deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete media item' },
      { status: 500 }
    );
  }
}
