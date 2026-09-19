import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { initDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await initDB();
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Math.random().toString(36).substring(2, 15);

    await sql`
      INSERT INTO users (id, email, password, name)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${name || 'User'})
    `;

    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
