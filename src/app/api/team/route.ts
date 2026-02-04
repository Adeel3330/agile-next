import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/team
// Public API - Get active team members (no authentication required)
export async function GET(req: NextRequest) {
  try {
    const { department } = Object.fromEntries(req.nextUrl.searchParams);

    let query = supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('status', 'active')
      .is('deleted_at', null);

    if (department && typeof department === 'string' && department.trim().length > 0) {
      query = query.eq('department', department.trim());
    }

    query = query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    const { data: teamMembers, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch team members' },
        { status: 500 }
      );
    }

    // Map Supabase column names to frontend expected names
    const mappedTeamMembers = (teamMembers || []).map((member: any) => ({
      id: member.id,
      name: member.name,
      title: member.title,
      bio: member.bio,
      photoUrl: member.photo_url,
      email: member.email,
      phone: member.phone,
      linkedinUrl: member.linkedin_url,
      twitterUrl: member.twitter_url,
      department: member.department,
      created_at: member.created_at,
      updated_at: member.updated_at
    }));

    return NextResponse.json({
      success: true,
      teamMembers: mappedTeamMembers
    });
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
