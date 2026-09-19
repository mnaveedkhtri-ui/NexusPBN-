import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');

// Helper to mask keys for the frontend
const maskKey = (key: string | undefined) => {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••••••••••' + key.slice(-4);
};

export async function GET() {
  // Read current env file to ensure we have the latest
  let envContent = '';
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    // File doesn't exist
  }

  // Parse env
  const parsedEnv: any = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      parsedEnv[match[1].trim()] = match[2].trim();
    }
  });

  return NextResponse.json({
    geminiKey: maskKey(parsedEnv.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
    vercelToken: maskKey(parsedEnv.VERCEL_TOKEN || process.env.VERCEL_TOKEN),
    githubToken: maskKey(parsedEnv.GITHUB_TOKEN || process.env.GITHUB_TOKEN),
    cloudflareToken: maskKey(parsedEnv.CLOUDFLARE_TOKEN || process.env.CLOUDFLARE_TOKEN),
    cloudflareAccountId: maskKey(parsedEnv.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { geminiKey, vercelToken, githubToken, cloudflareToken, cloudflareAccountId } = body;

    let envContent = '';
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (err) {}

    const parsedEnv: any = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        parsedEnv[match[1].trim()] = match[2].trim();
      }
    });

    // Only update if the user provided a real new key (not the masked version)
    if (geminiKey && !geminiKey.includes('••••')) {
      parsedEnv.GEMINI_API_KEY = geminiKey;
      process.env.GEMINI_API_KEY = geminiKey;
    }
    if (vercelToken && !vercelToken.includes('••••')) {
      parsedEnv.VERCEL_TOKEN = vercelToken;
      process.env.VERCEL_TOKEN = vercelToken;
    }
    if (githubToken && !githubToken.includes('••••')) {
      parsedEnv.GITHUB_TOKEN = githubToken;
      process.env.GITHUB_TOKEN = githubToken;
    }
    if (cloudflareToken && !cloudflareToken.includes('••••')) {
      parsedEnv.CLOUDFLARE_TOKEN = cloudflareToken;
      process.env.CLOUDFLARE_TOKEN = cloudflareToken;
    }
    if (cloudflareAccountId && !cloudflareAccountId.includes('••••')) {
      parsedEnv.CLOUDFLARE_ACCOUNT_ID = cloudflareAccountId;
      process.env.CLOUDFLARE_ACCOUNT_ID = cloudflareAccountId;
    }

    // Write back to .env.local
    const newEnvContent = Object.keys(parsedEnv)
      .map(key => `${key}=${parsedEnv[key]}`)
      .join('\n');
    
    fs.writeFileSync(envPath, newEnvContent);

    return NextResponse.json({ success: true, message: "API Keys updated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
