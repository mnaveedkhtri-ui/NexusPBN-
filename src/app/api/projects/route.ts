import { NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ensure table exists (in a real production app, run migrations separately)
    try { await initDB(); } catch(e) {}
    
    const { rows } = await sql`SELECT * FROM projects ORDER BY createdAt DESC`;
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
