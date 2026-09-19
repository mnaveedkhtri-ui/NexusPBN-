import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`Starting Ping Sequence for: ${url}`);

    try {
      await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(url)}`, { method: 'GET' });
    } catch (e) {}

    try {
      await fetch(`https://blogs.yandex.ru/pings/?status=success&url=${encodeURIComponent(url)}`, { method: 'GET' });
    } catch (e) {}

    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully broadcasted' 
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
