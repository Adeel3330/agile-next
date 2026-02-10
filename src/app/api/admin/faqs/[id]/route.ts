import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { FaqPosition } from '@/types/faq';

// GET /api/admin/faqs/[id]
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
    const { id } = await params;
    const { data: faq, error } = await supabaseAdmin
      .from('faqs')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !faq) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, faq });
  } catch (error) {
    console.error('Get FAQ error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch FAQ' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/faqs/[id]
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
    const { id } = await params;
    const body = await req.json();
    const { question, answer, position, display_order, status } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof question === 'string') updates.question = question.trim();
    if (typeof answer === 'string') updates.answer = answer.trim();
    if (position === 'affiliate' || position === 'home') updates.position = position as FaqPosition;
    if (typeof display_order === 'number') updates.display_order = display_order;
    if (status === 'inactive' || status === 'active') updates.status = status;

    const { data: faq, error } = await supabaseAdmin
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !faq) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found or update failed' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'FAQ updated successfully', faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/faqs/[id] (soft delete)
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
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('faqs')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
