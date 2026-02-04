import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/affiliate-applications/[id]
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
    const { id } = resolvedParams;

    const { data: application, error } = await supabaseAdmin
      .from('affiliate_applications')
      .select('*, affiliates(id, name, email, affiliate_code)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        _id: application.id,
        affiliateId: application.affiliate_id,
        affiliate: application.affiliates ? {
          id: application.affiliates.id,
          name: application.affiliates.name,
          email: application.affiliates.email,
          affiliateCode: application.affiliates.affiliate_code
        } : null,
        name: application.name,
        email: application.email,
        phone: application.phone,
        providerType: application.provider_type,
        applicationFee: parseFloat(application.application_fee || '0.00'),
        status: application.status,
        notes: application.notes,
        created_at: application.created_at,
        updated_at: application.updated_at
      }
    });
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/affiliate-applications/[id]
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
    const { id } = resolvedParams;
    const body = await req.json();
    const { name, email, phone, providerType, status, notes } = body;

    // Check if application exists
    const { data: existing } = await supabaseAdmin
      .from('affiliate_applications')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (providerType !== undefined) {
      updateData.provider_type = providerType;
      // Recalculate fee if provider type changes
      updateData.application_fee = providerType === 'individual' ? 0.00 : 50.00;
    }
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const { data: application, error } = await supabaseAdmin
      .from('affiliate_applications')
      .update(updateData)
      .eq('id', id)
      .select('*, affiliates(id, name, email, affiliate_code)')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        _id: application.id,
        affiliateId: application.affiliate_id,
        affiliate: application.affiliates ? {
          id: application.affiliates.id,
          name: application.affiliates.name,
          email: application.affiliates.email,
          affiliateCode: application.affiliates.affiliate_code
        } : null,
        name: application.name,
        email: application.email,
        phone: application.phone,
        providerType: application.provider_type,
        applicationFee: parseFloat(application.application_fee || '0.00'),
        status: application.status,
        notes: application.notes,
        created_at: application.created_at,
        updated_at: application.updated_at
      }
    });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/affiliate-applications/[id] (soft delete)
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
    const { id } = resolvedParams;

    const { data: application, error } = await supabaseAdmin
      .from('affiliate_applications')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
