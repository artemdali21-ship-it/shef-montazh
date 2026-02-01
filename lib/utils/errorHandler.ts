/**
 * Error handling utilities
 */

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'Произошла неизвестная ошибка'
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: unknown): string {
  const message = getErrorMessage(error)
  console.error('API Error:', error)

  // Map common error messages to user-friendly text
  if (message.includes('fetch')) {
    return 'Ошибка сети. Проверьте подключение к интернету.'
  }

  if (message.includes('401') || message.includes('unauthorized')) {
    return 'Необходимо войти в систему'
  }

  if (message.includes('403') || message.includes('forbidden')) {
    return 'У вас нет доступа к этому ресурсу'
  }

  if (message.includes('404') || message.includes('not found')) {
    return 'Запрашиваемый ресурс не найден'
  }

  if (message.includes('500') || message.includes('server error')) {
    return 'Ошибка сервера. Попробуйте позже.'
  }

  return message
}

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error: any): string {
  if (!error) return 'Произошла неизвестная ошибка'

  // Supabase specific errors
  if (error.code === 'PGRST116') {
    return 'Данные не найдены'
  }

  if (error.code === '23505') {
    return 'Такая запись уже существует'
  }

  if (error.code === '23503') {
    return 'Невозможно удалить: существуют связанные данные'
  }

  if (error.message) {
    return handleApiError(error.message)
  }

  return 'Ошибка базы данных'
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: string) {
  const message = getErrorMessage(error)
  const timestamp = new Date().toISOString()

  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}${message}`, error)

  // In production, send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error)
  }
}

/**
 * Async error wrapper
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<[T | null, Error | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    const err = error instanceof Error ? error : new Error(errorMessage || getErrorMessage(error))
    return [null, err]
  }
}

/**
 * Retry async function with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (i < maxRetries - 1) {
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => !data[field])

  return {
    valid: missing.length === 0,
    missing
  }
}
