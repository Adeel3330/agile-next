import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/team?search=&page=&limit=&status=&department=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { search, page = '1', limit = '10', status, department } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(limit as string, 10) || 10, 1),
      50
    );

    let query = supabaseAdmin
      .from('team_members')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (status && typeof status === 'string' && status.trim().length > 0) {
      query = query.eq('status', status.trim());
    }

    if (department && typeof department === 'string' && department.trim().length > 0) {
      query = query.eq('department', department.trim());
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},title.ilike.${searchTerm},bio.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }

    query = query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: teamMembers, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch team members' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedTeamMembers = (teamMembers || []).map((member: any) => ({
      _id: member.id,
      name: member.name,
      title: member.title,
      bio: member.bio,
      photoUrl: member.photo_url,
      email: member.email,
      phone: member.phone,
      linkedinUrl: member.linkedin_url,
      twitterUrl: member.twitter_url,
      displayOrder: member.display_order,
      status: member.status,
      department: member.department,
      created_at: member.created_at,
      updated_at: member.updated_at
    }));

    return NextResponse.json({
      success: true,
      teamMembers: mappedTeamMembers,
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1
    });
  } catch (error) {
    console.error('Team list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/admin/team
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
      name, 
      title,
      bio,
      photoUrl,
      email,
      phone,
      linkedinUrl,
      twitterUrl,
      displayOrder,
      status,
      department
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide team member name' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide team member title' },
        { status: 400 }
      );
    }

    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide team member photo URL' },
        { status: 400 }
      );
    }

    const insertData: any = {
      name: name.trim(),
      title: title.trim(),
      bio: bio?.trim() || null,
      photo_url: photoUrl.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      linkedin_url: linkedinUrl?.trim() || null,
      twitter_url: twitterUrl?.trim() || null,
      display_order: displayOrder || 0,
      status: status || 'active',
      department: department?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    const { data: teamMember, error } = await supabaseAdmin
      .from('team_members')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create team member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      teamMember: {
        _id: teamMember.id,
        name: teamMember.name,
        title: teamMember.title,
        bio: teamMember.bio,
        photoUrl: teamMember.photo_url,
        email: teamMember.email,
        phone: teamMember.phone,
        linkedinUrl: teamMember.linkedin_url,
        twitterUrl: teamMember.twitter_url,
        displayOrder: teamMember.display_order,
        status: teamMember.status,
        department: teamMember.department,
        created_at: teamMember.created_at,
        updated_at: teamMember.updated_at
      }
    });
  } catch (error) {
    console.error('Create team member error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create team member' },
      { status: 500 }
    );
  }
}
