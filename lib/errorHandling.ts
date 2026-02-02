/**
 * Error Handling Utilities
 * Centralized error handling and logging
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR', 409)
    this.name = 'ConflictError'
  }
}

/**
 * Handle API errors in a consistent way
 */
export function handleApiError(error: any): { message: string; code: string; statusCode: number } {
  console.error('[API Error]:', error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }

  if (error.code === 'PGRST116') {
    return {
      message: 'Resource not found',
      code: 'NOT_FOUND',
      statusCode: 404
    }
  }

  if (error.code === '23505') {
    return {
      message: 'This record already exists',
      code: 'DUPLICATE',
      statusCode: 409
    }
  }

  if (error.code === '23503') {
    return {
      message: 'Related record not found',
      code: 'FOREIGN_KEY_VIOLATION',
      statusCode: 400
    }
  }

  return {
    message: error.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500
  }
}

/**
 * Log errors to database for monitoring
 */
export async function logError(error: any, context?: any) {
  try {
    const errorData = {
      message: error.message,
      code: error.code || 'UNKNOWN',
      stack: error.stack,
      context: JSON.stringify(context),
      timestamp: new Date().toISOString()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Log]:', errorData)
    }

    // TODO: Send to error tracking service (Sentry, etc.)
    // TODO: Store in database api_logs table

  } catch (loggingError) {
    console.error('[Error Logging Failed]:', loggingError)
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        const backoffDelay = delay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }
  }

  throw lastError
}

/**
 * Wrap async handler with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      await logError(error, { handler: handler.name, args })
      throw error
    }
  }) as T
}
