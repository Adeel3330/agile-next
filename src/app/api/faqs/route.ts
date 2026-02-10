import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/faqs?position=home|affiliate
// Public API - no auth
export async function GET(req: NextRequest) {
  try {
    const position = req.nextUrl.searchParams.get('position') || '';

    if (!position || !['home', 'affiliate'].includes(position)) {
      return NextResponse.json(
        { success: false, message: 'Please provide position=home or position=affiliate' },
        { status: 400 }
      );
    }

    const { data: faqs, error } = await supabaseAdmin
      .from('faqs')
      .select('id, question, answer, position, display_order')
      .eq('position', position)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

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
    });
  } catch (error) {
    console.error('FAQs list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
