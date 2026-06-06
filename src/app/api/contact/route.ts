import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/contact
// Public API - Submit a contact form (no authentication required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      subject,
      message
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide your name' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide a message' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data: contact, error: insertError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        status: 'new',
        created_at: now,
        updated_at: now,
      })
      .select('id, name, email')
      .single();

    if (insertError) {
      console.error('Insert contact error:', insertError);

      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            message:
              'Contact submissions are blocked by a database constraint. Run database/remove-contact-email-unique.sql in Supabase.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Failed to submit contact form. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully!',
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
      },
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
