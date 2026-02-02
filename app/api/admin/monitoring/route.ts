import { NextRequest, NextResponse } from 'next/server'
import { getMonitoringStats, getRecentLogs } from '@/lib/monitoring'

/**
 * GET /api/admin/monitoring
 * Get monitoring stats and recent logs
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const timeRange = (searchParams.get('timeRange') || 'day') as 'hour' | 'day' | 'week'
    const logType = searchParams.get('type') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get stats
    const stats = await getMonitoringStats(timeRange)

    // Get recent logs
    const logs = await getRecentLogs(logType as any, limit)

    return NextResponse.json({
      stats,
      logs,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[Admin Monitoring] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
