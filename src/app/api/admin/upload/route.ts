import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Increase timeout for file uploads
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

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

    // Detect file type
    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    // Upload to Cloudinary with timeout
    const uploadPromise = uploadToCloudinary(
      buffer,
      'settings', // Use 'settings' folder for settings uploads
      resourceType
    );

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout. Please try again.')), 50000)
    );

    const result = await Promise.race([uploadPromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      fileType: resourceType
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    
    let message = 'Failed to upload file';
    if (error.message) {
      message = error.message;
    } else if (error.http_code) {
      message = `Cloudinary error: ${error.message || 'Upload failed'}`;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
