import { NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = session.user.email;

    try { await initDB(); } catch(e) {}
    
    const { rows } = await sql`SELECT * FROM projects WHERE user_email = ${userEmail} ORDER BY createdAt DESC`;
    
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
