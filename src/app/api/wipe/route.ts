import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    await sql`DROP TABLE IF EXISTS projects`;
    await sql`DROP TABLE IF EXISTS ai_settings`;
    await sql`DROP TABLE IF EXISTS api_keys`;
    return NextResponse.json({ success: true, message: 'Tables dropped!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
