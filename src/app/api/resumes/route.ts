import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/resumes
// Public API - Submit a resume (no authentication required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      careerId,
      fullName,
      email,
      phone,
      coverLetter,
      resumeFileUrl
    } = body;

    // Validation
    if (!careerId || typeof careerId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid career ID' },
        { status: 400 }
      );
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide your full name' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (!resumeFileUrl || typeof resumeFileUrl !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please upload a resume file' },
        { status: 400 }
      );
    }

    // Check if user already submitted a resume (one resume per email)
    const { data: existingResume, error: checkError } = await supabaseAdmin
      .from('resumes')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .is('deleted_at', null)
      .maybeSingle();

    if (checkError) {
      console.error('Check existing resume error:', checkError);
      return NextResponse.json(
        { success: false, message: 'Failed to check existing resume' },
        { status: 500 }
      );
    }

    if (existingResume) {
      return NextResponse.json(
        { success: false, message: 'You have already submitted a resume. Each applicant can only submit one resume.' },
        { status: 400 }
      );
    }

    // Verify career exists and is open
    const { data: career, error: careerError } = await supabaseAdmin
      .from('careers')
      .select('id, title, status')
      .eq('id', careerId)
      .maybeSingle();

    if (careerError || !career) {
      return NextResponse.json(
        { success: false, message: 'Career not found' },
        { status: 404 }
      );
    }

    if (career.status !== 'open') {
      return NextResponse.json(
        { success: false, message: 'This career position is not currently accepting applications' },
        { status: 400 }
      );
    }

    // Insert resume
    const { data: resume, error: insertError } = await supabaseAdmin
      .from('resumes')
      .insert({
        career_id: careerId,
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        cover_letter: coverLetter?.trim() || null,
        resume_file_url: resumeFileUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert resume error:', insertError);
      
      // Check if it's a unique constraint violation (email already exists)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'You have already submitted a resume. Each applicant can only submit one resume.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Failed to submit resume. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume submitted successfully!',
      resume: {
        id: resume.id,
        careerId: resume.career_id,
        fullName: resume.full_name,
        email: resume.email
      }
    });
  } catch (error) {
    console.error('Submit resume error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit resume' },
      { status: 500 }
    );
  }
}
