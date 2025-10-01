import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { logger, errorResponse, withErrorHandling } from '../../lib/logger';

// Enhanced wipe API handler with comprehensive error handling and logging
async function wipeHandler(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = logger.request('POST', '/api/wipe');

  try {
    // Parse request body with validation
    let requestBody: any;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      logger.error('Invalid JSON in wipe request body', {
        error: parseError,
        requestId,
        severity: 'medium'
      });
      return errorResponse.badRequest('Invalid JSON in request body', parseError, requestId);
    }

    const { secret } = requestBody;

    // Validate secret parameter
    if (!secret) {
      logger.warn('Wipe attempt without secret', {
        requestId,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      });
      return errorResponse.badRequest('Missing secret parameter', undefined, requestId);
    }

    // Security: Only allow authorized requests
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      logger.error('CRON_SECRET environment variable not configured', {
        error: new Error('Missing CRON_SECRET'),
        requestId,
        severity: 'critical'
      });
      return errorResponse.internalError('Server configuration error', undefined, requestId);
    }

    if (secret !== cronSecret) {
      logger.warn('Unauthorized wipe attempt with invalid secret', {
        requestId,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        severity: 'high'
      });
      return errorResponse.unauthorized('Invalid secret', requestId);
    }

    // Validate Supabase admin connection
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not available for wipe operation', {
        error: new Error('Supabase admin client initialization failed'),
        requestId,
        severity: 'critical'
      });
      return errorResponse.serviceUnavailable('Database service unavailable', requestId);
    }

    logger.info('Starting database wipe operation', { requestId });

    // Wipe internships table with detailed error handling
    let internshipsCount = 0;
    try {
      const { error: internshipsError, count } = await supabaseAdmin
        .from('internships')
        .delete()
        .not('id', 'is', null);

      if (internshipsError) {
        logger.error('Failed to wipe internships table', {
          error: internshipsError,
          requestId,
          severity: 'high'
        });
        return errorResponse.internalError('Failed to wipe internships', internshipsError, requestId);
      }

      internshipsCount = count || 0;
      logger.info('Internships table wiped', { requestId, deletedCount: internshipsCount });

    } catch (internshipsException) {
      logger.error('Exception during internships table wipe', {
        error: internshipsException,
        requestId,
        severity: 'high'
      });
      return errorResponse.internalError('Exception during internships wipe', internshipsException, requestId);
    }

    // Wipe scrape_logs table with detailed error handling
    let logsCount = 0;
    try {
      const { error: logsError, count } = await supabaseAdmin
        .from('scrape_logs')
        .delete()
        .not('id', 'is', null);

      if (logsError) {
        logger.error('Failed to wipe scrape_logs table', {
          error: logsError,
          requestId,
          severity: 'high'
        });
        return errorResponse.internalError('Failed to wipe scrape logs', logsError, requestId);
      }

      logsCount = count || 0;
      logger.info('Scrape logs table wiped', { requestId, deletedCount: logsCount });

    } catch (logsException) {
      logger.error('Exception during scrape_logs table wipe', {
        error: logsException,
        requestId,
        severity: 'high'
      });
      return errorResponse.internalError('Exception during scrape logs wipe', logsException, requestId);
    }

    const totalDuration = Date.now() - startTime;

    logger.info('Database wipe completed successfully', {
      requestId,
      duration: totalDuration,
      deletedInternships: internshipsCount,
      deletedLogs: logsCount
    });

    const response = {
      success: true,
      message: 'Database wiped successfully',
      deleted: {
        internships: internshipsCount,
        scrape_logs: logsCount
      },
      duration: totalDuration,
      requestId,
      timestamp: new Date().toISOString()
    };

    logger.response(requestId, 200, totalDuration, {
      deletedInternships: internshipsCount,
      deletedLogs: logsCount
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Critical wipe API error', {
      error,
      requestId,
      duration: Date.now() - startTime,
      severity: 'critical'
    });

    return errorResponse.internalError('An unexpected error occurred during wipe operation', error, requestId);
  }
}

// Export the wrapped handler
export const POST = withErrorHandling(wipeHandler, '/api/wipe');