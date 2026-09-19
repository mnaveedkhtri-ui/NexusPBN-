import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('secret') !== 'delete_all_projects_123') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await sql`DELETE FROM projects`;
    return NextResponse.json({ success: true, message: 'All projects deleted from database' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
