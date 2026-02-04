import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * @route   POST /api/admin/create
 * @desc    Create a new admin user (for seeding/initial setup only)
 * @access  Public (should be restricted in production - see notes below)
 * 
 * @note In production, this endpoint should be:
 * - Disabled completely, OR
 * - Protected by a secret key in environment variables, OR
 * - Removed after initial seeding
 */

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide name, email, and password' },
        { status: 400 }
      );
    }

    // Check password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
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

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error || !admin) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, message: 'Server error creating admin' },
        { status: 500 }
      );
    }

    // Return success response (without password)
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        created_at: admin.created_at
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error creating admin' },
      { status: 500 }
    );
  }
}

