import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/resumes/[id]
// Get a single resume (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const id = resolvedParams.id;

    const { data: resume, error } = await supabaseAdmin
      .from('resumes')
      .select(`
        *,
        careers (
          id,
          title,
          slug
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch resume' },
        { status: 500 }
      );
    }

    if (!resume) {
      return NextResponse.json(
        { success: false, message: 'Resume not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        careerId: resume.career_id,
        career: resume.careers ? {
          id: resume.careers.id,
          title: resume.careers.title,
          slug: resume.careers.slug
        } : null,
        fullName: resume.full_name,
        email: resume.email,
        phone: resume.phone,
        coverLetter: resume.cover_letter,
        resumeFileUrl: resume.resume_file_url,
        status: resume.status,
        created_at: resume.created_at,
        updated_at: resume.updated_at
      }
    });
  } catch (error) {
    console.error('Resume detail error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/resumes/[id]
// Update resume status (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const id = resolvedParams.id;
    const body = await req.json();
    const { status } = body;

    if (!status || !['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid status' },
        { status: 400 }
      );
    }

    const { data: resume, error } = await supabaseAdmin
      .from('resumes')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update resume' },
        { status: 500 }
      );
    }

    if (!resume) {
      return NextResponse.json(
        { success: false, message: 'Resume not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume status updated successfully',
      resume: {
        id: resume.id,
        status: resume.status
      }
    });
  } catch (error) {
    console.error('Update resume error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/resumes/[id] (Soft Delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const id = resolvedParams.id;

    const { error } = await supabaseAdmin
      .from('resumes')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete resume' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
