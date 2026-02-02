import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/affiliate-leads/export?affiliate_id=&converted=&start_date=&end_date=
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid or missing token.' },
        { status: 401 }
      );
    }

    const { affiliate_id, converted, start_date, end_date } = Object.fromEntries(
      req.nextUrl.searchParams
    );

    let query = supabaseAdmin
      .from('affiliate_leads')
      .select('*, affiliates(id, name, email, affiliate_code), affiliate_applications(id, name, email)')
      .is('deleted_at', null);

    if (affiliate_id && typeof affiliate_id === 'string' && affiliate_id.trim().length > 0) {
      query = query.eq('affiliate_id', affiliate_id.trim());
    }

    if (converted !== undefined) {
      query = query.eq('converted', converted === 'true' || converted === true);
    }

    if (start_date && typeof start_date === 'string') {
      query = query.gte('created_at', start_date);
    }

    if (end_date && typeof end_date === 'string') {
      query = query.lte('created_at', end_date);
    }

    query = query.order('created_at', { ascending: false });

    const { data: leads, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Date',
      'Affiliate Name',
      'Affiliate Code',
      'Lead Name',
      'Email',
      'Phone',
      'Source',
      'IP Address',
      'Converted',
      'Application ID',
      'Notes'
    ];

    const csvRows = (leads || []).map((lead: any) => [
      lead.id,
      new Date(lead.created_at).toLocaleDateString(),
      lead.affiliates?.name || 'N/A',
      lead.affiliates?.affiliate_code || 'N/A',
      lead.name || 'N/A',
      lead.email || 'N/A',
      lead.phone || 'N/A',
      lead.source || 'N/A',
      lead.ip_address || 'N/A',
      lead.converted ? 'Yes' : 'No',
      lead.application_id || 'N/A',
      (lead.notes || '').replace(/,/g, ';') // Replace commas in notes to avoid CSV issues
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="affiliate-leads-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export leads error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export leads' },
      { status: 500 }
    );
  }
}
