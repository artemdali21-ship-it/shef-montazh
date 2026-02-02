import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramNotification } from '@/lib/telegram'


/**
 * Worker Check-in
 *
 * POST /api/shifts/checkin
 * Body: {
 *   shiftId: string,
 *   workerId: string,
 *   latitude: number,
 *   longitude: number,
 *   photoUrl: string
 * }
 *
 * Records worker check-in with geolocation and photo
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { shiftId, workerId, latitude, longitude, photoUrl } = await req.json()

    // Validate required fields
    if (!shiftId || !workerId || !latitude || !longitude || !photoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: shiftId, workerId, latitude, longitude, photoUrl' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of range' },
        { status: 400 }
      )
    }

    // Get shift details
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('id, title, date, start_time, location_address, client_id, status')
      .eq('id', shiftId)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // Check if shift is today
    const today = new Date().toISOString().split('T')[0]
    if (shift.date !== today) {
      return NextResponse.json(
        { error: 'Can only check-in on shift date' },
        { status: 400 }
      )
    }

    // Check if worker is assigned to this shift
    const { data: assignment, error: assignmentError } = await supabase
      .from('shift_assignments')
      .select('id, status, check_in_time')
      .eq('shift_id', shiftId)
      .eq('worker_id', workerId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Worker not assigned to this shift' },
        { status: 403 }
      )
    }

    // Check if already checked in
    if (assignment.check_in_time) {
      return NextResponse.json(
        { error: 'Already checked in' },
        { status: 400 }
      )
    }

    // Check time window (30 min before start time)
    const now = new Date()
    const [hours, minutes] = shift.start_time.split(':').map(Number)
    const shiftStart = new Date()
    shiftStart.setHours(hours, minutes, 0, 0)

    const timeDiff = (shiftStart.getTime() - now.getTime()) / (1000 * 60) // minutes

    if (timeDiff > 30) {
      return NextResponse.json(
        { error: `Check-in available 30 minutes before shift start. Time until check-in: ${Math.floor(timeDiff)} minutes` },
        { status: 400 }
      )
    }

    if (timeDiff < -60) {
      return NextResponse.json(
        { error: 'Check-in window closed (more than 1 hour after start)' },
        { status: 400 }
      )
    }

    const checkInTime = new Date().toISOString()

    // Update shift_assignment with check-in data
    const { error: updateError } = await supabase
      .from('shift_assignments')
      .update({
        check_in_time: checkInTime,
        check_in_latitude: latitude,
        check_in_longitude: longitude,
        check_in_photo_url: photoUrl,
        status: 'checked_in'
      })
      .eq('id', assignment.id)

    if (updateError) {
      console.error('Error updating check-in:', updateError)
      return NextResponse.json(
        { error: 'Failed to record check-in' },
        { status: 500 }
      )
    }

    // Update shift status to checking_in
    await supabase
      .from('shifts')
      .update({ status: 'checking_in' })
      .eq('id', shiftId)

    // Log status change
    await supabase
      .from('shift_status_logs')
      .insert({
        shift_id: shiftId,
        from_status: shift.status,
        to_status: 'checking_in',
        reason: `Worker ${workerId} checked in`,
        changed_at: checkInTime
      })

    // Send notification to client
    try {
      const { data: worker } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', workerId)
        .single()

      await sendTelegramNotification({
        type: 'worker_checked_in',
        userId: shift.client_id,
        title: '✅ Исполнитель на месте',
        body: `${worker?.full_name || 'Исполнитель'} вышел на объект

📍 ${shift.location_address}
🕐 ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
        data: {
          shiftId,
          workerId,
          workerName: worker?.full_name,
        },
      })
    } catch (notifError) {
      console.error('Error sending check-in notification:', notifError)
    }

    console.log(`[Check-in] Worker ${workerId} checked in for shift ${shiftId}`)

    return NextResponse.json({
      success: true,
      checkInTime,
      shiftId,
      workerId,
      message: 'Check-in successful'
    })

  } catch (error: any) {
    console.error('Error in check-in:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
