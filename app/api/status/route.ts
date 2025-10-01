import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { logger, errorResponse, withErrorHandling } from '../../lib/logger';

// Enhanced status API handler with comprehensive error handling and logging
async function statusHandler(): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = logger.request('GET', '/api/status');

  try {
    // Validate Supabase admin connection
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not available for status check', {
        error: new Error('Supabase admin client initialization failed'),
        requestId,
        severity: 'critical'
      });
      return errorResponse.serviceUnavailable('Database service unavailable', requestId);
    }

    logger.info('Fetching scrape status', { requestId });

    // Get the most recent scrape log with enhanced error handling
    const { data: recentLogs, error } = await supabaseAdmin
      .from('scrape_logs')
      .select('*')
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error) {
      logger.error('Failed to fetch scrape logs from database', {
        error,
        requestId,
        severity: 'medium'
      });

      // Return a degraded response instead of failing completely
      const response = {
        lastUpdated: null,
        status: 'unknown',
        internshipsFound: 0,
        nextUpdate: 'Unknown',
        error: 'Unable to fetch status from database',
        requestId,
        timestamp: new Date().toISOString()
      };

      logger.response(requestId, 200, Date.now() - startTime, { status: 'degraded' });
      return NextResponse.json(response);
    }

    // If no logs found, return default state
    if (!recentLogs || recentLogs.length === 0) {
      logger.info('No scrape logs found - first run scenario', { requestId });

      const response = {
        lastUpdated: null,
        status: 'never_run',
        internshipsFound: 0,
        nextUpdate: 'Unknown',
        requestId,
        timestamp: new Date().toISOString()
      };

      logger.response(requestId, 200, Date.now() - startTime, { status: 'never_run' });
      return NextResponse.json(response);
    }

    const recentLog = recentLogs[0];

    // Calculate next update time (30 minutes from last update)
    const lastUpdated = new Date(recentLog.completed_at);
    const nextUpdate = new Date(lastUpdated.getTime() + 30 * 60 * 1000);
    const now = new Date();
    const minutesUntilNext = Math.max(0, Math.floor((nextUpdate.getTime() - now.getTime()) / (1000 * 60)));
    const isRecent = (now.getTime() - lastUpdated.getTime()) < (35 * 60 * 1000); // Less than 35 minutes ago

    const response = {
      lastUpdated: recentLog.completed_at,
      status: recentLog.status,
      internshipsFound: recentLog.internships_found || 0,
      nextUpdate: minutesUntilNext > 0 ? `${minutesUntilNext} minutes` : 'Soon',
      isRecent,
      requestId,
      timestamp: new Date().toISOString()
    };

    logger.info('Status fetched successfully', {
      requestId,
      lastScrapeDuration: recentLog.duration_seconds,
      internshipsFound: recentLog.internships_found,
      isRecent
    });

    logger.response(requestId, 200, Date.now() - startTime, {
      internshipsFound: recentLog.internships_found,
      isRecent
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Critical status API error', {
      error,
      requestId,
      duration: Date.now() - startTime,
      severity: 'high'
    });

    return errorResponse.internalError('Failed to fetch status', error, requestId);
  }
}

// Export the wrapped handler
export const GET = withErrorHandling(statusHandler, '/api/status');