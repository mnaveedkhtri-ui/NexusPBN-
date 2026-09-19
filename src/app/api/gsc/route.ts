import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      return NextResponse.json({ error: 'GSC Credentials Missing' }, { status: 401 });
    }

    const jwtClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    await jwtClient.authorize();
    const searchconsole = google.searchconsole({ version: 'v1', auth: jwtClient });

    // Try to get sites
    const siteListRes = await searchconsole.sites.list();
    const sites = siteListRes.data.siteEntry || [];
    
    // Default 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // If no sites, just return dummy format so frontend doesn't crash
    if (sites.length === 0) {
      return NextResponse.json({
        totalClicks: 0,
        totalImpressions: 0,
        chartData: [
          { name: 'No Data', clicks: 0, impressions: 0 }
        ]
      });
    }

    // Pick the first verified site (usually the money site or domain property)
    const targetSite = sites[0].siteUrl;
    
    if (!targetSite) {
      throw new Error("No valid siteUrl found in Google Search Console");
    }

    const analyticsRes = await searchconsole.searchanalytics.query({
      siteUrl: targetSite,
      requestBody: {
        startDate: startStr,
        endDate: endStr,
        dimensions: ['date'],
      }
    });

    const rows = analyticsRes.data.rows || [];
    let totalClicks = 0;
    let totalImpressions = 0;
    const chartData = rows.map((r: any) => {
      totalClicks += r.clicks || 0;
      totalImpressions += r.impressions || 0;
      return {
        name: r.keys?.[0] || 'Unknown',
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
      };
    });

    return NextResponse.json({
      site: targetSite,
      totalClicks,
      totalImpressions,
      chartData
    });

  } catch (error: any) {
    console.error('GSC API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
