import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { isCloudinaryUrl } from '@/lib/cloudinary-utils';

// GET /api/admin/sliders/[id]
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

    const { data: slider, error } = await supabaseAdmin
      .from('sliders')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !slider) {
      return NextResponse.json(
        { success: false, message: 'Slider not found' },
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      slider: mappedSlider
    });
  } catch (error) {
    console.error('Get slider error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch slider' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sliders/[id]
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

    // Get existing slider to check for old file
    const { data: existingSlider } = await supabaseAdmin
      .from('sliders')
      .select('file, file_type')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    const updates: any = {
      title: title.trim(),
      description: description?.trim() || null,
      file: file.trim(),
      file_type: fileType || 'image',
      seo_title: seoTitle?.trim() || null,
      seo_content: seoContent?.trim() || null,
      updated_at: new Date().toISOString()
    };

    const { data: slider, error } = await supabaseAdmin
      .from('sliders')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !slider) {
      return NextResponse.json(
        { success: false, message: 'Slider not found' },
        { status: 404 }
      );
    }

    // If file changed and old file was from Cloudinary, delete it
    if (existingSlider && existingSlider.file !== file && existingSlider.file.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = existingSlider.file.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(publicIdWithExt, existingSlider.file_type as 'image' | 'video');
      } catch (deleteError) {
        console.error('Error deleting old file from Cloudinary:', deleteError);
        // Don't fail the update if deletion fails
      }
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

    return NextResponse.json({
      success: true,
      message: 'Slider updated successfully',
      slider: mappedSlider
    });
  } catch (error: any) {
    console.error('Update slider error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to update slider'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sliders/[id] (Soft Delete)
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

    const { data: slider, error } = await supabaseAdmin
      .from('sliders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !slider) {
      return NextResponse.json(
        { success: false, message: 'Slider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Slider deleted successfully'
    });
  } catch (error) {
    console.error('Delete slider error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete slider' },
      { status: 500 }
    );
  }
}
