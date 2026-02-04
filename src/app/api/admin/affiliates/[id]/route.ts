import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/affiliates/[id]
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

    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !affiliate) {
      return NextResponse.json(
        { success: false, message: 'Affiliate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate: {
        _id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone,
        companyName: affiliate.company_name,
        website: affiliate.website,
        affiliateCode: affiliate.affiliate_code,
        commissionRate: parseFloat(affiliate.commission_rate || '10.00'),
        status: affiliate.status,
        notes: affiliate.notes,
        created_at: affiliate.created_at,
        updated_at: affiliate.updated_at
      }
    });
  } catch (error) {
    console.error('Get affiliate error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch affiliate' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/affiliates/[id]
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
    const { name, email, phone, companyName, website, commissionRate, status, notes } = body;

    // Check if affiliate exists
    const { data: existing } = await supabaseAdmin
      .from('affiliates')
      .select('id, email')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (email && email.trim().toLowerCase() !== existing.email) {
      const { data: emailExists } = await supabaseAdmin
        .from('affiliates')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .neq('id', id)
        .is('deleted_at', null)
        .single();

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'An affiliate with this email already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (companyName !== undefined) updateData.company_name = companyName?.trim() || null;
    if (website !== undefined) updateData.website = website?.trim() || null;
    if (commissionRate !== undefined) updateData.commission_rate = parseFloat(commissionRate.toString());
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update affiliate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate: {
        _id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone,
        companyName: affiliate.company_name,
        website: affiliate.website,
        affiliateCode: affiliate.affiliate_code,
        commissionRate: parseFloat(affiliate.commission_rate || '10.00'),
        status: affiliate.status,
        notes: affiliate.notes,
        created_at: affiliate.created_at,
        updated_at: affiliate.updated_at
      }
    });
  } catch (error) {
    console.error('Update affiliate error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update affiliate' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/affiliates/[id] (soft delete)
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

    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !affiliate) {
      return NextResponse.json(
        { success: false, message: 'Affiliate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Affiliate deleted successfully'
    });
  } catch (error) {
    console.error('Delete affiliate error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete affiliate' },
      { status: 500 }
    );
  }
}
