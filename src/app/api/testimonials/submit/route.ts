import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 30;

/**
 * POST /api/testimonials/submit
 * Public – guest/doctor testimonial submission with photo.
 * Creates a media row with position=testimonials, status=inactive for admin approval.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string | null;
    const message = formData.get('message') as string | null;
    const file = formData.get('image') as File | null;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide your name' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide your testimonial message' },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'Please upload a photo' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'Image must be less than 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await uploadToCloudinary(buffer, 'media', 'image');

    const now = new Date().toISOString();

    const { data: mediaItem, error } = await supabaseAdmin
      .from('media')
      .insert({
        title: name.trim(),
        description: message.trim(),
        file_url: uploadResult.url,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        position: 'testimonials',
        status: 'inactive',
        display_order: 0,
        alt_text: name.trim(),
        link_url: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Testimonial submit – insert error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to save testimonial. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your testimonial has been submitted and will appear after review.',
    });
  } catch (err) {
    console.error('Testimonial submit error:', err);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
