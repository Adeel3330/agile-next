import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { FaqPosition } from '@/types/faq';

// GET /api/admin/faqs?position=&page=&limit=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { position, page = '1', limit = '50' } = Object.fromEntries(req.nextUrl.searchParams);
    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string, 10) || 50, 1), 100);

    let query = supabaseAdmin
      .from('faqs')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (position && ['home', 'affiliate'].includes(position as string)) {
      query = query.eq('position', position);
    }

    query = query
      .order('position', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
      .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

    const { data: faqs, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch FAQs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      faqs: faqs || [],
      total: count || 0,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1,
    });
  } catch (error) {
    console.error('Admin FAQs list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/faqs - create one or multiple FAQs
// Body: { question, answer, position } or { faqs: [ { question, answer, position }, ... ] }
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
    const now = new Date().toISOString();

    // Bulk create: { faqs: [ { question, answer, position }, ... ] }
    if (body.faqs && Array.isArray(body.faqs) && body.faqs.length > 0) {
      const valid: { question: string; answer: string; position: FaqPosition; display_order: number; status: string }[] = [];
      for (let i = 0; i < body.faqs.length; i++) {
        const item = body.faqs[i];
        const q = typeof item.question === 'string' ? item.question.trim() : '';
        const a = typeof item.answer === 'string' ? item.answer.trim() : '';
        const pos = item.position === 'affiliate' ? 'affiliate' : 'home';
        if (q && a) {
          valid.push({
            question: q,
            answer: a,
            position: pos,
            display_order: typeof item.display_order === 'number' ? item.display_order : i,
            status: item.status === 'inactive' ? 'inactive' : 'active',
          });
        }
      }
      if (valid.length === 0) {
        return NextResponse.json(
          { success: false, message: 'At least one FAQ must have non-empty question and answer.' },
          { status: 400 }
        );
      }
      const rows = valid.map((v) => ({
        question: v.question,
        answer: v.answer,
        position: v.position,
        display_order: v.display_order,
        status: v.status,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      }));
      const { data: inserted, error } = await supabaseAdmin.from('faqs').insert(rows).select();
      if (error) {
        console.error('Supabase bulk insert error:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to create FAQs.', error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `${inserted?.length || 0} FAQ(s) created successfully`,
        faqs: inserted || [],
      }, { status: 201 });
    }

    // Single create: { question, answer, position }
    const { question, answer, position, display_order, status } = body;
    const q = typeof question === 'string' ? question.trim() : '';
    const a = typeof answer === 'string' ? answer.trim() : '';
    if (!q || !a) {
      return NextResponse.json(
        { success: false, message: 'Please provide question and answer.' },
        { status: 400 }
      );
    }
    const pos: FaqPosition = position === 'affiliate' ? 'affiliate' : 'home';

    const { data: faq, error } = await supabaseAdmin
      .from('faqs')
      .insert({
        question: q,
        answer: a,
        position: pos,
        display_order: typeof display_order === 'number' ? display_order : 0,
        status: status === 'inactive' ? 'inactive' : 'active',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create FAQ.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ created successfully',
      faq,
    }, { status: 201 });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create FAQ.' },
      { status: 500 }
    );
  }
}
