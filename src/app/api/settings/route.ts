import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const maskKey = (key: string | undefined) => {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••••••••••' + key.slice(-4);
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userEmail = session.user.email;

    const { rows } = await sql`SELECT * FROM api_keys WHERE user_email = ${userEmail} LIMIT 1`;
    
    if (rows.length > 0) {
      const keys = rows[0];
      return NextResponse.json({
        geminiKey: maskKey(keys.gemini_key),
        vercelToken: maskKey(keys.vercel_token),
        githubToken: maskKey(keys.github_token),
        cloudflareToken: maskKey(keys.cloudflare_token),
        cloudflareAccountId: maskKey(keys.cloudflare_account_id),
        pixabayKey: maskKey(keys.pixabay_key),
      });
    }

    return NextResponse.json({
      geminiKey: '', vercelToken: '', githubToken: '', cloudflareToken: '', cloudflareAccountId: '', pixabayKey: ''
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userEmail = session.user.email;

    // Ensure the pixabay_key column exists
    try {
      await sql`ALTER TABLE api_keys ADD COLUMN pixabay_key VARCHAR(255)`;
    } catch(e) { /* Column already exists */ }

    const body = await request.json();
    const { geminiKey, vercelToken, githubToken, cloudflareToken, cloudflareAccountId, pixabayKey } = body;

    // Fetch existing so we don't overwrite with masked string
    const { rows } = await sql`SELECT * FROM api_keys WHERE user_email = ${userEmail} LIMIT 1`;
    const existing = rows.length > 0 ? rows[0] : {};

    const finalGemini = (geminiKey && !geminiKey.includes('?')) ? geminiKey : existing.gemini_key || '';
    const finalVercel = (vercelToken && !vercelToken.includes('?')) ? vercelToken : existing.vercel_token || '';
    const finalGithub = (githubToken && !githubToken.includes('?')) ? githubToken : existing.github_token || '';
    const finalCloudflareToken = (cloudflareToken && !cloudflareToken.includes('?')) ? cloudflareToken : existing.cloudflare_token || '';
    const finalCloudflareAccountId = (cloudflareAccountId && !cloudflareAccountId.includes('?')) ? cloudflareAccountId : existing.cloudflare_account_id || '';
    const finalPixabay = (pixabayKey && !pixabayKey.includes('?')) ? pixabayKey : existing.pixabay_key || '';

    await sql`
      INSERT INTO api_keys (user_email, gemini_key, vercel_token, github_token, cloudflare_token, cloudflare_account_id, pixabay_key)
      VALUES (${userEmail}, ${finalGemini}, ${finalVercel}, ${finalGithub}, ${finalCloudflareToken}, ${finalCloudflareAccountId}, ${finalPixabay})
      ON CONFLICT (user_email)
      DO UPDATE SET 
        gemini_key = EXCLUDED.gemini_key,
        vercel_token = EXCLUDED.vercel_token,
        github_token = EXCLUDED.github_token,
        cloudflare_token = EXCLUDED.cloudflare_token,
        cloudflare_account_id = EXCLUDED.cloudflare_account_id,
        pixabay_key = EXCLUDED.pixabay_key;
    `;

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
