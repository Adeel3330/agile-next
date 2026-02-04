import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/resumes?search=&page=&limit=&status=&careerId=
// Get all resumes (admin only)
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10', status, careerId } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('resumes')
      .select(`
        *,
        careers (
          id,
          title,
          slug
        )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (status && typeof status === 'string' && status.trim().length > 0) {
      query = query.eq('status', status.trim());
    }

    if (careerId && typeof careerId === 'string' && careerId.trim().length > 0) {
      query = query.eq('career_id', careerId.trim());
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`);
    }

    query = query.range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: resumes, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch resumes' },
        { status: 500 }
      );
    }

    const mappedResumes = (resumes || []).map((resume: any) => ({
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
    }));

    return NextResponse.json({
      success: true,
      resumes: mappedResumes,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Resumes list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}
