import * as Sentry from '@sentry/nextjs'

/**
 * Capture an exception with Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error:', error)

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    })
  }
}

/**
 * Capture a message with Sentry
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  console.log(`[${level}] ${message}`, context)

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, {
      level: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
      extra: context,
    })
  }
}

/**
 * Set user context for Sentry
 */
export function setUser(user: {
  id: string
  email?: string
  username?: string
}) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(user)
  }
}

/**
 * Clear user context
 */
export function clearUser() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(null)
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    })
  }
}

/**
 * Track performance
 */
export function startTransaction(name: string, op: string) {
  if (process.env.NODE_ENV === 'production') {
    return Sentry.startTransaction({
      name,
      op,
    })
  }
  return null
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureException(error as Error, {
        ...context,
        functionName: fn.name,
        arguments: args,
      })
      throw error
    }
  }) as T
}
