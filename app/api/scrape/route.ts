import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

// This API route will be called every 30 minutes by Vercel Cron
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let logId: string | null = null;

  try {
    // Security: Only allow Vercel cron or authorized requests
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting scheduled scrape...');
    
    // Create initial log entry
    if (supabaseAdmin) {
      const { data: logEntry, error: logError } = await supabaseAdmin
        .from('scrape_logs')
        .insert({
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (!logError && logEntry) {
        logId = logEntry.id;
        console.log(`📝 Created scrape log entry: ${logId}`);
      }
    }
    
    // Import and run the scraper logic
    const { runScraperAPI } = await import('../../lib/scraper-api');
    const result = await runScraperAPI();
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    if (result.success) {
      console.log('✅ Scraper completed successfully');
      
      // Update log entry with success
      if (supabaseAdmin && logId) {
        await supabaseAdmin
          .from('scrape_logs')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
            internships_found: result.internshipsFound || 0,
            sources_scraped: result.sources || [],
            duration_seconds: duration
          })
          .eq('id', logId);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Scraper completed successfully',
        internships: result.internshipsFound,
        updated: result.updated,
        duration: duration,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Scraper failed:', result.error);
      
      // Update log entry with error
      if (supabaseAdmin && logId) {
        await supabaseAdmin
          .from('scrape_logs')
          .update({
            status: 'error',
            completed_at: new Date().toISOString(),
            error_message: result.error,
            duration_seconds: duration
          })
          .eq('id', logId);
      }
      
      return NextResponse.json(
        { error: 'Scraper failed', details: result.error },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('💥 API error:', error);
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    // Update log entry with error
    if (supabaseAdmin && logId) {
      await supabaseAdmin
        .from('scrape_logs')
        .update({
          status: 'error',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error',
          duration_seconds: duration
        })
        .eq('id', logId);
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also allow manual POST requests for testing
export async function POST(request: NextRequest) {
  return GET(request);
}