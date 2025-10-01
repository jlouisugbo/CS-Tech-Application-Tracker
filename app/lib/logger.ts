import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Generate unique request ID for tracking
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Enhanced logging interface with context
interface LogContext {
  requestId?: string;
  route?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  userId?: string;
  queryTime?: number;
  resultCount?: number;
  totalCount?: number;
  internshipsFound?: number;
  internshipsCount?: number;
  deletedCount?: number;
  deletedInternships?: number;
  deletedLogs?: number;
  logId?: string;
  sources?: number;
  isRecent?: boolean;
  lastScrapeDuration?: number;
  status?: string;
  message?: string;
  authHeader?: string;
  userAgent?: string;
  ip?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface ErrorContext extends LogContext {
  error: Error | unknown;
  stack?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Production-ready logger with structured output
export const logger = {
  info: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'info',
      timestamp,
      message,
      ...context
    };

    if (isProduction) {
      // In production, always log to console for Vercel logs
      console.log(JSON.stringify(logEntry));
    } else {
      // Development: pretty print
      console.log(`[INFO] ${timestamp} - ${message}`, context || '');
    }
  },

  warn: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'warn',
      timestamp,
      message,
      ...context
    };

    if (isProduction) {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.warn(`[WARN] ${timestamp} - ${message}`, context || '');
    }
  },

  error: (message: string, errorContext: ErrorContext) => {
    const timestamp = new Date().toISOString();
    const errorMessage = errorContext.error instanceof Error
      ? errorContext.error.message
      : String(errorContext.error);
    const stack = errorContext.error instanceof Error
      ? errorContext.error.stack
      : undefined;

    const logEntry = {
      level: 'error',
      timestamp,
      message,
      errorMessage,
      stack,
      severity: errorContext.severity || 'medium',
      ...errorContext
    };

    if (isProduction) {
      console.error(JSON.stringify(logEntry));
    } else {
      console.error(`[ERROR] ${timestamp} - ${message}`);
      console.error('Error details:', errorContext.error);
      if (stack) console.error('Stack trace:', stack);
    }
  },

  request: (method: string, route: string, context: LogContext = {}) => {
    const requestId = context.requestId || generateRequestId();
    logger.info(`${method} ${route} - Request started`, {
      ...context,
      requestId,
      method,
      route
    });
    return requestId;
  },

  response: (requestId: string, statusCode: number, duration: number, context?: LogContext) => {
    logger.info(`Request completed`, {
      ...context,
      requestId,
      statusCode,
      duration
    });
  }
};

// Error response utilities for consistent API responses
export const errorResponse = {
  badRequest: (message: string, details?: any, requestId?: string) => {
    return NextResponse.json({
      error: message,
      details: isDev ? details : undefined,
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 400 });
  },

  unauthorized: (message: string = 'Unauthorized', requestId?: string) => {
    return NextResponse.json({
      error: message,
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 401 });
  },

  forbidden: (message: string = 'Forbidden', requestId?: string) => {
    return NextResponse.json({
      error: message,
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 403 });
  },

  notFound: (message: string = 'Not found', requestId?: string) => {
    return NextResponse.json({
      error: message,
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 404 });
  },

  rateLimit: (message: string = 'Rate limit exceeded', requestId?: string) => {
    return NextResponse.json({
      error: message,
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 429 });
  },

  internalError: (message: string = 'Internal server error', error?: Error | unknown, requestId?: string) => {
    // Log the actual error for debugging
    if (error) {
      logger.error('Internal server error occurred', {
        error,
        requestId,
        severity: 'high'
      });
    }

    return NextResponse.json({
      error: message,
      details: isDev && error instanceof Error ? error.message : undefined,
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  },

  serviceUnavailable: (message: string = 'Service unavailable', requestId?: string) => {
    return NextResponse.json({
      error: message,
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
};

// API wrapper utility for consistent error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  route: string
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    try {
      logger.request('API', route, { requestId });
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      // Try to extract status code from response
      const statusCode = (response as any).status || 200;
      logger.response(requestId, statusCode, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('API handler error', {
        error,
        requestId,
        route,
        duration,
        severity: 'high'
      });

      return errorResponse.internalError('An unexpected error occurred', error, requestId);
    }
  };
}