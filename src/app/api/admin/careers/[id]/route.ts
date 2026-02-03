import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/careers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
    const { id } = resolvedParams;

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !career) {
      return NextResponse.json(
        { success: false, message: 'Career not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('Get career error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch career' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/careers/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
    const { id } = resolvedParams;
    const body = await req.json();
    const {
      title,
      slug,
      department,
      location,
      type,
      status,
      description,
      requirements
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a job title' },
        { status: 400 }
      );
    }

    // Map 'active' to 'open' for backward compatibility
    let careerStatus: 'open' | 'closed' | 'draft' | undefined = undefined;
    if (status !== undefined) {
      if (status === 'active') {
        careerStatus = 'open';
      } else if (status === 'closed') {
        careerStatus = 'closed';
      } else if (status === 'draft') {
        careerStatus = 'draft';
      } else {
        careerStatus = status as 'open' | 'closed' | 'draft';
      }
    }

    // Use provided slug or generate from title
    const careerSlug = slug?.trim() || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug already exists (excluding current career), append number if needed
    let finalSlug = careerSlug;
    let slugCounter = 1;
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from('careers')
        .select('id')
        .eq('slug', finalSlug)
        .neq('id', id)
        .maybeSingle();
      
      if (!existing) break;
      finalSlug = `${careerSlug}-${slugCounter}`;
      slugCounter++;
    }

    const updates: any = {
      title: title.trim(),
      slug: finalSlug,
      updated_at: new Date().toISOString()
    };

    if (department !== undefined) {
      updates.department = department?.trim() || null;
    }
    if (location !== undefined) {
      updates.location = location?.trim() || null;
    }
    if (type !== undefined) {
      updates.type = type?.trim() || null;
    }
    if (careerStatus !== undefined) {
      updates.status = careerStatus;
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }
    if (requirements !== undefined) {
      updates.requirements = requirements?.trim() || null;
    }

    const { data: career, error } = await supabaseAdmin
      .from('careers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !career) {
      return NextResponse.json(
        { success: false, message: 'Career not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Career updated successfully',
      data: career
    });
  } catch (error) {
    console.error('Update career error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update career' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/careers/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
    const { id } = resolvedParams;

    const { error } = await supabaseAdmin
      .from('careers')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Career not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Career deleted successfully'
    });
  } catch (error) {
    console.error('Delete career error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete career' },
      { status: 500 }
    );
  }
}

