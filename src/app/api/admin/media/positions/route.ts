import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/media/positions - Get distinct positions
export async function GET(req: NextRequest) {
    try {
        const auth = await verifyToken(req);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: 'Access denied. Invalid or missing token.' },
                { status: 401 }
            );
        }

        // Query to get distinct positions from media table
        const { data, error } = await supabaseAdmin
            .from('media')
            .select('position')
            .is('deleted_at', null);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch positions' },
                { status: 500 }
            );
        }

        // Extract unique positions and sort them
        const uniquePositions = [...new Set(data.map((item: any) => item.position))].sort();

        return NextResponse.json({
            success: true,
            positions: uniquePositions
        });
    } catch (error) {
        console.error('Fetch positions error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch positions' },
            { status: 500 }
        );
    }
}
