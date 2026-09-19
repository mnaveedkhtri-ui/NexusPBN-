import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userEmail = session.user.email;

    const { rows } = await sql`SELECT * FROM ai_settings WHERE user_email = ${userEmail} LIMIT 1`;
    if (rows.length > 0) {
      return NextResponse.json({ tone: rows[0].tone, customPrompt: rows[0].custom_prompt });
    }
    return NextResponse.json({ tone: 'Authoritative & Professional', customPrompt: '' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userEmail = session.user.email;

    const { tone, customPrompt } = await request.json();

    await sql`
      INSERT INTO ai_settings (user_email, tone, custom_prompt)
      VALUES (${userEmail}, ${tone}, ${customPrompt})
      ON CONFLICT (user_email) DO UPDATE 
      SET tone = EXCLUDED.tone, custom_prompt = EXCLUDED.custom_prompt, updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
