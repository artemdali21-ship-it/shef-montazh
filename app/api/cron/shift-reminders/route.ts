import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramNotification } from '@/lib/telegram'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Cronjob: Send shift reminders 1 hour before start
 * Runs every 5 minutes via Vercel Cron
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Running shift reminders check...')

    // Find shifts starting in 55-65 minutes (to catch in 5-min cron window)
    const now = new Date()
    const windowStart = new Date(now.getTime() + 55 * 60 * 1000) // +55 min
    const windowEnd = new Date(now.getTime() + 65 * 60 * 1000)   // +65 min

    const today = now.toISOString().split('T')[0]

    // Get all shift assignments for shifts starting soon
    const { data: shiftAssignments, error } = await supabase
      .from('shift_assignments')
      .select(`
        id,
        worker_id,
        shift_id,
        shifts (
          id,
          title,
          date,
          start_time,
          end_time,
          location_address,
          pay_amount,
          category
        )
      `)
      .eq('shifts.date', today)
      .eq('status', 'assigned')

    if (error) {
      console.error('[Cron] Error fetching shift assignments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let sentCount = 0
    let errorCount = 0

    // Filter shifts by time window and send reminders
    for (const assignment of shiftAssignments || []) {
      const shift = assignment.shifts as any

      if (!shift || !shift.start_time) continue

      // Parse shift start time
      const [hours, minutes] = shift.start_time.split(':').map(Number)
      const shiftStartTime = new Date(now)
      shiftStartTime.setHours(hours, minutes, 0, 0)

      // Check if shift is in our window
      if (shiftStartTime >= windowStart && shiftStartTime <= windowEnd) {
        console.log(`[Cron] Sending reminder for shift ${shift.id} to worker ${assignment.worker_id}`)

        const result = await sendTelegramNotification({
          type: 'shift_starts_soon',
          userId: assignment.worker_id,
          title: '⏰ Смена через 1 час!',
          body: `Смена начинается в ${shift.start_time}

📍 ${shift.location_address}
🏷️ ${shift.category}
💰 ${shift.pay_amount?.toLocaleString('ru-RU') || '0'}₽

Не опаздывай! 🚀`,
          data: {
            shiftId: shift.id,
            startTime: shift.start_time,
          },
        })

        if (result.success) {
          sentCount++
        } else {
          errorCount++
          console.error(`[Cron] Failed to send reminder: ${result.error}`)
        }
      }
    }

    console.log(`[Cron] Shift reminders complete: ${sentCount} sent, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      remindersSent: sentCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Cron] Shift reminders error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
