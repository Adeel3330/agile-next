import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/bookings
// Public API - Submit a booking (no authentication required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceId,
      serviceName,
      name,
      email,
      phone,
      appointmentDate,
      appointmentTime,
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

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide your phone number' },
        { status: 400 }
      );
    }

    if (!appointmentDate || typeof appointmentDate !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please select an appointment date' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { success: false, message: 'Appointment date cannot be in the past' },
        { status: 400 }
      );
    }

    // Verify service exists if serviceId is provided
    if (serviceId) {
      const { data: service, error: serviceError } = await supabaseAdmin
        .from('services')
        .select('id, title, status')
        .eq('id', serviceId)
        .is('deleted_at', null)
        .maybeSingle();

      if (serviceError || !service) {
        return NextResponse.json(
          { success: false, message: 'Selected service not found' },
          { status: 404 }
        );
      }

      if (service.status !== 'active') {
        return NextResponse.json(
          { success: false, message: 'Selected service is not available' },
          { status: 400 }
        );
      }
    }

    // Insert booking
    const { data: booking, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert({
        service_id: serviceId || null,
        service_name: serviceName?.trim() || null,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        appointment_date: appointmentDate,
        appointment_time: appointmentTime?.trim() || null,
        message: message?.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert booking error:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to submit booking. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking submitted successfully! We will contact you soon.',
      booking: {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        appointmentDate: booking.appointment_date
      }
    });
  } catch (error) {
    console.error('Submit booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit booking' },
      { status: 500 }
    );
  }
}
