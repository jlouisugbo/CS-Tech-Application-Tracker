import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { logger, errorResponse, withErrorHandling } from '../../lib/logger';

// Enhanced scrape API route with comprehensive error handling and logging
async function scrapeHandler(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  let logId: string | null = null;
  const requestId = logger.request('GET', '/api/scrape');

  try {
    // Security: Only allow Vercel cron or authorized requests
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      logger.error('CRON_SECRET environment variable not configured', {
        error: new Error('Missing CRON_SECRET'),
        requestId,
        severity: 'critical'
      });
      return errorResponse.internalError('Server configuration error', undefined, requestId);
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized scrape attempt', {
        requestId,
        authHeader: authHeader ? 'present' : 'missing',
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      });
      return errorResponse.unauthorized('Invalid or missing authorization token', requestId);
    }

    logger.info('Starting scheduled scrape', { requestId });

    // Validate Supabase admin connection
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not available', {
        error: new Error('Supabase admin client initialization failed'),
        requestId,
        severity: 'critical'
      });
      return errorResponse.serviceUnavailable('Database service unavailable', requestId);
    }

    // Create initial log entry with error handling
    try {
      const { data: logEntry, error: logError } = await supabaseAdmin
        .from('scrape_logs')
        .insert({
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (logError) {
        logger.error('Failed to create scrape log entry', {
          error: logError,
          requestId,
          severity: 'medium'
        });
      } else if (logEntry) {
        logId = logEntry.id;
        logger.info('Created scrape log entry', { requestId, logId: logId || undefined });
      }
    } catch (logCreationError) {
      logger.error('Exception creating scrape log', {
        error: logCreationError,
        requestId,
        severity: 'medium'
      });
    }

    // Import and run the scraper logic with timeout handling
    try {
      const { runScraperAPI } = await import('../../lib/scraper-api');
      const result = await runScraperAPI();

      const duration = Math.round((Date.now() - startTime) / 1000);

      if (result.success) {
        logger.info('Scraper completed successfully', {
          requestId,
          duration,
          internshipsFound: result.internshipsFound,
          sources: result.sources?.length || 0
        });

        // Update log entry with success
        if (logId) {
          try {
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
          } catch (updateError) {
            logger.error('Failed to update scrape log with success', {
              error: updateError,
              requestId,
              logId: logId || undefined,
              severity: 'low'
            });
          }
        }

        const response = {
          success: true,
          message: 'Scraper completed successfully',
          internships: result.internshipsFound,
          updated: result.updated,
          duration: duration,
          requestId,
          timestamp: new Date().toISOString()
        };

        logger.response(requestId, 200, Date.now() - startTime, {
          internshipsFound: result.internshipsFound
        });

        return NextResponse.json(response);

      } else {
        logger.error('Scraper failed to complete', {
          error: new Error(result.error),
          requestId,
          duration,
          severity: 'high'
        });

        // Update log entry with error
        if (logId) {
          try {
            await supabaseAdmin
              .from('scrape_logs')
              .update({
                status: 'error',
                completed_at: new Date().toISOString(),
                error_message: result.error,
                duration_seconds: duration
              })
              .eq('id', logId);
          } catch (updateError) {
            logger.error('Failed to update scrape log with error', {
              error: updateError,
              requestId,
              logId: logId || undefined,
              severity: 'low'
            });
          }
        }

        return errorResponse.internalError('Scraper execution failed', new Error(result.error), requestId);
      }

    } catch (scraperError) {
      const duration = Math.round((Date.now() - startTime) / 1000);

      logger.error('Scraper execution exception', {
        error: scraperError,
        requestId,
        duration,
        severity: 'critical'
      });

      // Update log entry with error
      if (logId) {
        try {
          await supabaseAdmin
            .from('scrape_logs')
            .update({
              status: 'error',
              completed_at: new Date().toISOString(),
              error_message: scraperError instanceof Error ? scraperError.message : 'Scraper execution failed',
              duration_seconds: duration
            })
            .eq('id', logId);
        } catch (updateError) {
          logger.error('Failed to update scrape log after scraper exception', {
            error: updateError,
            requestId,
            logId: logId || undefined,
            severity: 'low'
          });
        }
      }

      return errorResponse.internalError('Scraper execution failed', scraperError, requestId);
    }

  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);

    logger.error('Critical scrape API error', {
      error,
      requestId,
      duration,
      severity: 'critical'
    });

    // Attempt to update log entry with error (best effort)
    if (supabaseAdmin && logId) {
      try {
        await supabaseAdmin
          .from('scrape_logs')
          .update({
            status: 'error',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Critical API error',
            duration_seconds: duration
          })
          .eq('id', logId);
      } catch (updateError) {
        logger.error('Failed to update scrape log after critical error', {
          error: updateError,
          requestId,
          logId: logId || undefined,
          severity: 'low'
        });
      }
    }

    return errorResponse.internalError('An unexpected error occurred', error, requestId);
  }
}

// Export the wrapped handler
export const GET = withErrorHandling(scrapeHandler, '/api/scrape');

// Also allow manual POST requests for testing
export async function POST(request: NextRequest) {
  return GET(request);
}