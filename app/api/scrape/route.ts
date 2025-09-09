import { NextRequest, NextResponse } from 'next/server';

// This API route will be called every 30 minutes by Vercel Cron
export async function GET(request: NextRequest) {
  try {
    // Security: Only allow Vercel cron or authorized requests
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting scheduled scrape...');
    
    // Import and run the scraper logic
    const { runScraperAPI } = await import('../../lib/scraper-api');
    const result = await runScraperAPI();
    
    if (result.success) {
      console.log('✅ Scraper completed successfully');
      return NextResponse.json({
        success: true,
        message: 'Scraper completed successfully',
        internships: result.internshipsFound,
        updated: result.updated,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Scraper failed:', result.error);
      return NextResponse.json(
        { error: 'Scraper failed', details: result.error },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('💥 API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

// Also allow manual POST requests for testing
export async function POST(request: NextRequest) {
  return GET(request);
}