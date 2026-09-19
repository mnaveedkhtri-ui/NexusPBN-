import { NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    try { await initDB(); } catch(e) {}
    
    const { rows } = await sql`SELECT * FROM projects ORDER BY createdAt DESC`;
    
    // Map postgres lowercase columns to our frontend camelCase names
    const mappedRows = rows.map(r => ({
      id: r.id,
      domain: r.domain,
      moneyUrl: r.moneyurl || r.moneyUrl,
      anchorText: r.anchortext || r.anchorText,
      vercelUrl: r.vercelurl || r.vercelUrl,
      githubRepo: r.githubrepo || r.githubRepo,
      status: r.status,
      createdAt: r.createdat || r.createdAt
    }));

    return NextResponse.json(mappedRows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
