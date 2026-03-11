import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createUserSession } from '@/lib/user-auth';
import { sql } from '@/lib/db/client';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Received registration request'); // Debug log
    const body = await request.json();
    const { email, password, name, phone } = registerSchema.parse(body);

    console.log('Register attempt:', { email, name, phone }); // Debug log

    // Check if user already exists
    const existingUser = await sql
      `SELECT id FROM users WHERE email = ${email}`
    ;
    console.log("11111", existingUser)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully'); // Debug log

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, name, phone) VALUES (${email}, ${passwordHash}, ${name}, ${phone}) RETURNING id, email, name, phone
    `;

    console.log('User created:', result[0]); // Debug log

    const user = result[0];

    // Create session
    await createUserSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}