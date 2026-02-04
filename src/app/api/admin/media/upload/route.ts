import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Increase timeout for file uploads
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

// POST /api/admin/media/upload
// Upload file to Cloudinary
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer with timeout
    const bytes = await Promise.race([
      file.arrayBuffer(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('File read timeout')), 30000)
      )
    ]);
    
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary in 'media' folder
    try {
      const uploadResult = await Promise.race([
        uploadToCloudinary(buffer, 'media', 'image'),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 50000)
        )
      ]);

      return NextResponse.json({
        success: true,
        url: uploadResult.url,
        publicId: uploadResult.public_id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        originalName: file.name
      });
    } catch (uploadError: any) {
      console.error('Cloudinary upload error:', uploadError);
      if (uploadError.message === 'Upload timeout') {
        return NextResponse.json(
          { success: false, message: 'Upload timeout. Please try again with a smaller file.' },
          { status: 408 }
        );
      }
      
      let message = 'Failed to upload file to Cloudinary';
      if (uploadError.message) {
        message = uploadError.message;
      } else if (uploadError.http_code) {
        message = `Cloudinary error: ${uploadError.message || 'Upload failed'}`;
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message,
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (error.message === 'File read timeout') {
      return NextResponse.json(
        { success: false, message: 'File read timeout. Please try again.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to upload file',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
