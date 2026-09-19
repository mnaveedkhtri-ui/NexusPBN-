import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Auto-create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id VARCHAR(255) PRIMARY KEY,
        tone VARCHAR(255) NOT NULL,
        custom_prompt TEXT
      );
    `;

    const { rows } = await sql`SELECT * FROM ai_settings WHERE id = 'global' LIMIT 1`;
    
    if (rows.length > 0) {
      return NextResponse.json({
        tone: rows[0].tone,
        customPrompt: rows[0].custom_prompt
      });
    }

    return NextResponse.json({ tone: 'Authoritative & Professional', customPrompt: '' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tone, customPrompt } = await request.json();

    // Auto-create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id VARCHAR(255) PRIMARY KEY,
        tone VARCHAR(255) NOT NULL,
        custom_prompt TEXT
      );
    `;

    await sql`
      INSERT INTO ai_settings (id, tone, custom_prompt)
      VALUES ('global', ${tone}, ${customPrompt})
      ON CONFLICT (id) DO UPDATE 
      SET tone = EXCLUDED.tone, custom_prompt = EXCLUDED.custom_prompt;
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
