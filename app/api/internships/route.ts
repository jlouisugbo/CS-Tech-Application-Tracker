import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { logger, errorResponse, withErrorHandling } from '../../lib/logger';

// Enhanced internships API handler with comprehensive error handling and logging
async function internshipsHandler(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = logger.request('GET', '/api/internships');

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const includeClosed = searchParams.get('include_closed') === 'true';
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const citizenship = searchParams.get('citizenship');
  const sponsorship = searchParams.get('sponsorship');
  const freshmanFriendly = searchParams.get('freshman_friendly') === 'true';

  // Only apply pagination if explicitly requested
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const usePagination = pageParam !== null || limitParam !== null;
  const page = parseInt(pageParam || '1', 10);
  const limit = parseInt(limitParam || '50', 10);

  try {
    // Validate Supabase admin connection
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not available for internships fetch', {
        error: new Error('Supabase admin client initialization failed'),
        requestId,
        severity: 'critical'
      });
      return errorResponse.serviceUnavailable('Database service unavailable', requestId);
    }

    logger.info(`Fetching ${includeClosed ? 'all' : 'active'} internships with filters`, {
      requestId,
      metadata: { category, location, citizenship, sponsorship, freshmanFriendly, page, limit }
    });

    // Build query conditionally based on parameters
    let query = supabaseAdmin
      .from('internships')
      .select('*', { count: 'exact' });

    // Only filter by is_active if we're not including closed internships
    if (!includeClosed) {
      query = query.eq('is_active', true);
    }

    // Apply server-side filters
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (citizenship === 'true') {
      query = query.eq('requires_citizenship', true);
    }
    if (sponsorship === 'false') {
      query = query.eq('no_sponsorship', true);
    }
    if (freshmanFriendly) {
      query = query.eq('is_freshman_friendly', true);
    }
    // Note: Location filtering with arrays is complex server-side, keeping client-side for now

    // Apply ordering
    query = query.order('days_ago', { ascending: true });

    // Apply pagination only if requested
    let data, error, count;
    if (usePagination) {
      const offset = (page - 1) * limit;
      const result = await query.range(offset, offset + limit - 1);
      data = result.data;
      error = result.error;
      count = result.count;
    } else {
      // Fetch all results (with reasonable limit for safety)
      const result = await query.limit(5000);
      data = result.data;
      error = result.error;
      count = result.count;
    }

    const queryTime = Date.now() - startTime;

    if (error) {
      logger.error('Database query error during internships fetch', {
        error,
        requestId,
        severity: 'high',
        metadata: {
          queryTime,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      });

      return errorResponse.internalError('Failed to fetch internships', error, requestId);
    }

    // Performance monitoring
    logger.info('Internships query completed', {
      requestId,
      queryTime,
      resultCount: data?.length || 0,
      totalCount: count || 0
    });

    if (queryTime > 1000) {
      logger.warn('Slow query detected', {
        requestId,
        queryTime,
        severity: 'medium',
        message: 'Consider index optimization'
      });
    }

    // Validate data integrity
    if (!Array.isArray(data)) {
      logger.error('Invalid data format returned from database', {
        error: new Error('Expected array but got: ' + typeof data),
        requestId,
        severity: 'high'
      });
      return errorResponse.internalError('Invalid data format', new Error('Data integrity check failed'), requestId);
    }

    const totalCount = count || data.length;
    const response = {
      internships: data,
      meta: {
        total: totalCount,
        ...(usePagination && {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }),
        queryTime,
        cached: false,
        includeClosed,
        requestId,
        timestamp: new Date().toISOString()
      }
    };

    logger.response(requestId, 200, queryTime, {
      internshipsCount: data.length,
      totalCount: count || 0
    });

    return NextResponse.json(response);

  } catch (error) {
    const queryTime = Date.now() - startTime;

    logger.error('Critical internships API error', {
      error,
      requestId,
      severity: 'critical',
      metadata: {
        queryTime
      }
    });

    return errorResponse.internalError('An unexpected error occurred', error, requestId);
  }
}

// Export the wrapped handler
export const GET = withErrorHandling(internshipsHandler, '/api/internships');