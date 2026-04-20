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
      serviceIds,
      serviceNames,
      subCategoryId,
      subCategoryName,
      subCategoryIds,
      subCategoryNames,
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

    const requestedServiceIds = Array.isArray(serviceIds)
      ? serviceIds.filter((id) => typeof id === 'string' && id.trim().length > 0)
      : serviceId && typeof serviceId === 'string'
        ? [serviceId]
        : [];

    const requestedServiceNames = Array.isArray(serviceNames)
      ? serviceNames.filter((name) => typeof name === 'string' && name.trim().length > 0)
      : [];

    const requestedSubCategoryIds = Array.isArray(subCategoryIds)
      ? subCategoryIds.filter((id) => typeof id === 'string' && id.trim().length > 0)
      : subCategoryId && typeof subCategoryId === 'string'
        ? [subCategoryId]
        : [];

    const requestedSubCategoryNames = Array.isArray(subCategoryNames)
      ? subCategoryNames.filter((name) => typeof name === 'string' && name.trim().length > 0)
      : subCategoryName && typeof subCategoryName === 'string' && subCategoryName.trim().length > 0
        ? [subCategoryName.trim()]
        : [];

    if (
      requestedServiceIds.length === 0 &&
      requestedServiceNames.length === 0 &&
      requestedSubCategoryIds.length === 0 &&
      requestedSubCategoryNames.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: 'Please select at least one subcategory' },
        { status: 400 }
      );
    }

    let foundServices: any[] = [];
    if (requestedServiceIds.length > 0) {
      const { data, error: servicesError } = await supabaseAdmin
        .from('services')
        .select('id, title, status')
        .in('id', requestedServiceIds)
        .is('deleted_at', null);

      if (servicesError || !data || data.length !== requestedServiceIds.length) {
        return NextResponse.json(
          { success: false, message: 'One or more selected services were not found' },
          { status: 404 }
        );
      }

      const inactiveService = data.find((service) => service.status !== 'active');
      if (inactiveService) {
        return NextResponse.json(
          { success: false, message: `Selected service is not available: ${inactiveService.title}` },
          { status: 400 }
        );
      }
      foundServices = data;
    }

    let foundSubCategories: any[] = [];
    if (requestedSubCategoryIds.length > 0) {
      const { data, error: subCategoriesError } = await supabaseAdmin
        .from('blog_categories')
        .select('id, name, deleted_at')
        .in('id', requestedSubCategoryIds);

      if (subCategoriesError || !data || data.length !== requestedSubCategoryIds.length) {
        return NextResponse.json(
          { success: false, message: 'One or more selected subcategories were not found' },
          { status: 404 }
        );
      }

      const deletedSubCategory = data.find((category) => category.deleted_at);
      if (deletedSubCategory) {
        return NextResponse.json(
          { success: false, message: `Selected subcategory is not available: ${deletedSubCategory.name}` },
          { status: 400 }
        );
      }

      foundSubCategories = data;
    }

    const serviceTitleById = new Map(foundServices.map((service) => [service.id, service.title]));
    const orderedSelectedServices = requestedServiceIds.map((id) => ({
      id,
      title: serviceTitleById.get(id) || 'Service'
    }));

    const subCategoryNameById = new Map(foundSubCategories.map((category) => [category.id, category.name]));
    const orderedSelectedSubCategories = requestedSubCategoryIds.map((id) => ({
      id,
      name: subCategoryNameById.get(id) || 'Subcategory'
    }));

    const legacyServiceName = orderedSelectedServices.map((service) => service.title).join(', ');
    const legacySubCategoryName =
      orderedSelectedSubCategories.map((category) => category.name).join(', ') ||
      requestedSubCategoryNames.join(', ');

    // Insert booking
    const { data: booking, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert({
        service_id: orderedSelectedServices[0]?.id || null,
        subcategory_id: orderedSelectedSubCategories[0]?.id || null,
        service_name:
          legacyServiceName ||
          (requestedServiceNames.length > 0 ? requestedServiceNames.join(', ').trim() : serviceName?.trim()) ||
          legacySubCategoryName ||
          subCategoryName?.trim() ||
          null,
        subcategory_name: legacySubCategoryName || subCategoryName?.trim() || null,
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

    const bookingServiceRows = orderedSelectedServices.map((service) => ({
      booking_id: booking.id,
      service_id: service.id,
      service_name: service.title
    }));

    if (bookingServiceRows.length > 0) {
      const { error: bookingServicesError } = await supabaseAdmin
        .from('booking_services')
        .insert(bookingServiceRows);

      if (bookingServicesError && bookingServicesError.code !== '42P01') {
        console.error('Insert booking_services error:', bookingServicesError);
      }
    }

    const bookingSubCategoryRows = orderedSelectedSubCategories.map((category) => ({
      booking_id: booking.id,
      subcategory_id: category.id,
      subcategory_name: category.name
    }));

    if (bookingSubCategoryRows.length > 0) {
      const { error: bookingSubCategoriesError } = await supabaseAdmin
        .from('booking_subcategories')
        .insert(bookingSubCategoryRows);

      if (bookingSubCategoriesError && bookingSubCategoriesError.code !== '42P01') {
        console.error('Insert booking_subcategories error:', bookingSubCategoriesError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking submitted successfully! We will contact you soon.',
      booking: {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        appointmentDate: booking.appointment_date,
        services: orderedSelectedServices,
        subCategories: orderedSelectedSubCategories
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
