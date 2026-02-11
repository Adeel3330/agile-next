import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/team/[id]
// Public API - Get a single active team member by ID (no authentication required)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const { data: member, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      teamMember: {
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
        updated_at: member.updated_at,
      },
    });
  } catch (error) {
    console.error('Get team member error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

