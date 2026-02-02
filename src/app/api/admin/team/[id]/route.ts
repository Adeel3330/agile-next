import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/team/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { id } = params;

    const { data: teamMember, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !teamMember) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
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
    console.error('Get team member error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/team/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { id } = params;
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

    // Check if team member exists
    const { data: existing } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (title !== undefined) updateData.title = title.trim();
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (photoUrl !== undefined) updateData.photo_url = photoUrl.trim();
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (linkedinUrl !== undefined) updateData.linkedin_url = linkedinUrl?.trim() || null;
    if (twitterUrl !== undefined) updateData.twitter_url = twitterUrl?.trim() || null;
    if (displayOrder !== undefined) updateData.display_order = displayOrder;
    if (status !== undefined) updateData.status = status;
    if (department !== undefined) updateData.department = department?.trim() || null;

    const { data: teamMember, error } = await supabaseAdmin
      .from('team_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update team member' },
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
    console.error('Update team member error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/team/[id] (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { id } = params;

    const { data: teamMember, error } = await supabaseAdmin
      .from('team_members')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !teamMember) {
      return NextResponse.json(
        { success: false, message: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
