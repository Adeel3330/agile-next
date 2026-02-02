import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Increase timeout for file uploads
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

// POST /api/resumes/upload
// Public API - Upload resume file (no authentication required)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (only PDF and DOC/DOCX)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return NextResponse.json(
        { success: false, message: 'Only PDF and DOC/DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for resumes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
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

    // Upload to Cloudinary in 'resumes' folder
    try {
      const uploadResult = await Promise.race([
        uploadToCloudinary(buffer, 'resumes', 'auto'),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 50000)
        )
      ]);

      return NextResponse.json({
        success: true,
        url: uploadResult.url,
        publicId: uploadResult.public_id
      });
    } catch (uploadError: any) {
      console.error('Cloudinary upload error:', uploadError);
      if (uploadError.message === 'Upload timeout') {
        return NextResponse.json(
          { success: false, message: 'Upload timeout. Please try again with a smaller file.' },
          { status: 408 }
        );
      }
      throw uploadError;
    }
  } catch (error: any) {
    console.error('Resume upload error:', error);
    
    if (error.message === 'File read timeout') {
      return NextResponse.json(
        { success: false, message: 'File read timeout. Please try again.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to upload resume. Please try again.' },
      { status: 500 }
    );
  }
}
