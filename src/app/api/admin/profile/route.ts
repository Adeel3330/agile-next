import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * @route   GET /api/admin/profile
 * @desc    Get current admin profile
 * @access  Private (requires JWT token)
 */
export async function GET(req: NextRequest) {
  try {
    // Get token from header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: string };

    // Get admin from token
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, name, email, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        created_at: admin.created_at
      }
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, message: 'Token expired' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Access denied. Invalid token.' },
      { status: 401 }
    );
  }
}

/**
 * @route   PUT /api/admin/profile
 * @desc    Update current admin profile
 * @access  Private (requires JWT token)
 */
export async function PUT(req: NextRequest) {
  try {
    // Get token from header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: string };

    // Get update data from request body
    const { name, email } = await req.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Please provide name and email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another admin
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .neq('id', decoded.id)
      .single();
    
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Email is already in use' },
        { status: 409 }
      );
    }

    // Update admin
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .update({
        name: name.trim(),
        email: email.toLowerCase().trim()
      })
      .eq('id', decoded.id)
      .select()
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        created_at: admin.created_at
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, message: 'Token expired' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Access denied. Invalid token.' },
      { status: 401 }
    );
  }
}

