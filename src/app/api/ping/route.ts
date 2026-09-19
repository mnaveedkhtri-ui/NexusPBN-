import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`Starting Ping Sequence for: ${url}`);

    // --- Google Indexing API ---
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // Replace literal '\n' characters with actual newlines for Vercel env var support
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    let googleStatus = 'skipped';
    if (clientEmail && privateKey) {
      try {
        const jwtClient = new google.auth.JWT(
          clientEmail,
          undefined,
          privateKey,
          ['https://www.googleapis.com/auth/indexing'],
          undefined
        );
        
        await jwtClient.authorize();
        
        const indexing = google.indexing({ version: 'v3', auth: jwtClient });
        
        await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: 'URL_UPDATED',
          }
        });
        
        console.log(`Google Indexing API successfully hit for ${url}`);
        googleStatus = 'success';
      } catch (err: any) {
        console.error("Google Indexing API Error:", err.message);
        googleStatus = `error: ${err.message}`;
      }
    } else {
      console.log("Skipping Google Indexing: GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY missing in .env");
    }

    // --- Bing & Yandex ---
    try {
      await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(url)}`, { method: 'GET' });
    } catch (e) {}

    try {
      await fetch(`https://blogs.yandex.ru/pings/?status=success&url=${encodeURIComponent(url)}`, { method: 'GET' });
    } catch (e) {}

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully broadcasted',
      googleStatus
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
