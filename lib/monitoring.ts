import { createClient } from '@supabase/supabase-js'

/**
 * Log types for different operations
 */
export type LogType =
  | 'auth'
  | 'shift_created'
  | 'shift_updated'
  | 'application_created'
  | 'application_approved'
  | 'payment_created'
  | 'payment_completed'
  | 'error'
  | 'api_call'
  | 'webhook'

export interface LogEntry {
  type: LogType
  userId?: string
  action: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an event to the database
 */
export async function logEvent(entry: LogEntry): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('api_logs').insert({
      type: entry.type,
      user_id: entry.userId,
      action: entry.action,
      details: entry.details,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      timestamp: new Date().toISOString()
    })

    if (error) {
      console.error('[Monitoring] Failed to log event:', error)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${entry.type}] ${entry.action}`, entry.details)
    }
  } catch (error) {
    console.error('[Monitoring] Logging error:', error)
  }
}

/**
 * Log API call metrics
 */
export async function logApiCall(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  userId?: string,
  error?: string
): Promise<void> {
  await logEvent({
    type: 'api_call',
    userId,
    action: `${method} ${endpoint}`,
    details: {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
      error
    }
  })
}

/**
 * Log user authentication
 */
export async function logAuth(
  userId: string,
  action: 'login' | 'logout' | 'register',
  method: string,
  ipAddress?: string
): Promise<void> {
  await logEvent({
    type: 'auth',
    userId,
    action: `user_${action}`,
    details: { method },
    ipAddress
  })
}

/**
 * Log error events
 */
export async function logError(
  error: Error,
  context?: Record<string, any>,
  userId?: string
): Promise<void> {
  await logEvent({
    type: 'error',
    userId,
    action: 'error_occurred',
    details: {
      message: error.message,
      stack: error.stack,
      context
    }
  })
}

/**
 * Get monitoring stats
 */
export async function getMonitoringStats(timeRange: 'hour' | 'day' | 'week' = 'day') {
  const now = new Date()
  const startTime = new Date()

  switch (timeRange) {
    case 'hour':
      startTime.setHours(now.getHours() - 1)
      break
    case 'day':
      startTime.setDate(now.getDate() - 1)
      break
    case 'week':
      startTime.setDate(now.getDate() - 7)
      break
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get total API calls
    const { count: totalCalls } = await supabase
      .from('api_logs')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'api_call')
      .gte('timestamp', startTime.toISOString())

    // Get error count
    const { count: errorCount } = await supabase
      .from('api_logs')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'error')
      .gte('timestamp', startTime.toISOString())

    // Get authentication events
    const { count: authCount } = await supabase
      .from('api_logs')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'auth')
      .gte('timestamp', startTime.toISOString())

    // Get average API response time
    const { data: avgResponse } = await supabase
      .from('api_logs')
      .select('details')
      .eq('type', 'api_call')
      .gte('timestamp', startTime.toISOString())

    const totalDuration = avgResponse?.reduce(
      (sum, log) => sum + (log.details?.duration_ms || 0),
      0
    ) || 0

    const avgResponseTime = avgResponse?.length
      ? Math.round(totalDuration / avgResponse.length)
      : 0

    return {
      totalApiCalls: totalCalls || 0,
      totalErrors: errorCount || 0,
      authEvents: authCount || 0,
      avgResponseTime,
      errorRate: totalCalls ? ((errorCount || 0) / totalCalls) * 100 : 0,
      timeRange
    }
  } catch (error) {
    console.error('[Monitoring] Failed to get stats:', error)
    return {
      totalApiCalls: 0,
      totalErrors: 0,
      authEvents: 0,
      avgResponseTime: 0,
      errorRate: 0,
      timeRange
    }
  }
}

/**
 * Get recent logs
 */
export async function getRecentLogs(
  type?: LogType,
  limit: number = 50
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('api_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('[Monitoring] Failed to get logs:', error)
    return []
  }
}

/**
 * Middleware to track API performance
 */
export function withMonitoring<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now()
    let statusCode = 200
    let error: string | undefined

    try {
      const result = await handler(...args)
      return result
    } catch (err: any) {
      statusCode = err.statusCode || 500
      error = err.message
      throw err
    } finally {
      const duration = Date.now() - startTime
      await logApiCall(endpoint, 'POST', statusCode, duration, undefined, error)
    }
  }) as T
}
