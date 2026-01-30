/**
 * Seed Admin Script
 * Run this script to create an initial admin user in Supabase
 * 
 * Usage:
 *   npx ts-node scripts/seed-admin.ts
 * 
 * Or with custom credentials:
 *   NAME="Super Admin" EMAIL="admin@company.com" PASSWORD="secure123" npx ts-node scripts/seed-admin.ts
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');

// Try to load .env.local if it exists
if (fs.existsSync(envPath)) {
  const envResult = dotenv.config({ path: envPath });
  if (envResult.error) {
    console.warn('⚠️  Warning: Error loading .env.local file:');
    console.warn(`   ${envResult.error.message}`);
    console.warn('   Attempting to use environment variables from process.env...\n');
  }
} else {
  console.warn('⚠️  Warning: .env.local file not found at:');
  console.warn(`   ${envPath}`);
  console.warn('   Attempting to use environment variables from process.env...\n');
}

// Supabase configuration
const supabaseUrl = 'https://pdzmuqpmqiljyovxaurf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkem11cXBtcWlsanlvdnhhdXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY5MjY2NywiZXhwIjoyMDg1MjY4NjY3fQ.5xYGteU2LhEVBivlzTjZK-MjTme6_nKV7YROP16Q7fA';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('\n📋 Required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Please add these to your .env.local file:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('\n📝 You can find these values in your Supabase project settings:');
  console.error('   - Project URL: Settings > API > Project URL');
  console.error('   - Service Role Key: Settings > API > service_role key (secret)');
  process.exit(1);
}

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get admin data from environment or use defaults
const adminData = {
  name: process.env.NAME || 'Admin',
  email: process.env.EMAIL || 'admin@example.com',
  password: process.env.PASSWORD || 'admin123'
};

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seed...');
    console.log(`📧 Email: ${adminData.email}`);
    
    // Check if admin already exists
    console.log('🔍 Checking if admin already exists...');
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('id, name, email, created_at')
      .eq('email', adminData.email.toLowerCase().trim())
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if admin doesn't exist
      throw checkError;
    }
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with this email');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Created: ${existingAdmin.created_at}`);
      console.log('\n💡 To update, use the /api/admin/create endpoint or modify directly in database');
      process.exit(0);
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin
    console.log('👤 Creating admin in Supabase...');
    const { data: admin, error: insertError } = await supabase
      .from('admins')
      .insert({
        name: adminData.name.trim(),
        email: adminData.email.toLowerCase().trim(),
        password: hashedPassword,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    if (!admin) {
      throw new Error('Failed to create admin - no data returned');
    }

    console.log('✅ Admin created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created: ${admin.created_at}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    
    console.log('\n💡 Important: Change the password after first login!');
    console.log('   Use: PUT /api/admin/profile with new password');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding admin:', error);
    if (error.message) {
      console.error(`   Message: ${error.message}`);
    }
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.details) {
      console.error(`   Details: ${error.details}`);
    }
    process.exit(1);
  }
}

// Run the seed
seedAdmin();

