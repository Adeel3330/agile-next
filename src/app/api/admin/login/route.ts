import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Check for admin
    const { data: admin, error: fetchError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (fetchError || !admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpire: string | number = process.env.JWT_EXPIRE || '7d';
    // @ts-expect-error - jsonwebtoken v9 has strict typing for expiresIn, but accepts string values at runtime
    const token = jwt.sign(
      { id: admin.id },
      jwtSecret,
      { expiresIn: jwtExpire }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        created_at: admin.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during login' },
      { status: 500 }
    );
  }
}

