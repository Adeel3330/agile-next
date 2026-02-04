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

    // Validation
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

    // Check if user already submitted a contact (one contact per email)
    const { data: existingContact, error: checkError } = await supabaseAdmin
      .from('contact_submissions')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .is('deleted_at', null)
      .maybeSingle();

    if (checkError) {
      console.error('Check existing contact error:', checkError);
      return NextResponse.json(
        { success: false, message: 'Failed to check existing contact' },
        { status: 500 }
      );
    }

    if (existingContact) {
      return NextResponse.json(
        { success: false, message: 'You have already submitted a contact form. Each user can only submit one contact at a time.' },
        { status: 400 }
      );
    }

    // Insert contact submission
    const { data: contact, error: insertError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert contact error:', insertError);
      
      // Check if it's a unique constraint violation (email already exists)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'You have already submitted a contact form. Each user can only submit one contact at a time.' },
          { status: 400 }
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
        email: contact.email
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
