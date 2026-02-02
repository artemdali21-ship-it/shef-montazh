import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateStatusTransition, ShiftStatus, getStatusLabel } from '@/lib/shiftStateMachine'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Update Shift Status
 *
 * PATCH /api/shifts/[id]/status
 * Body: { newStatus: ShiftStatus, reason?: string }
 *
 * Validates status transition and logs the change
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shiftId = params.id
    const { newStatus, reason } = await req.json()

    // Validate input
    if (!newStatus) {
      return NextResponse.json(
        { error: 'newStatus is required' },
        { status: 400 }
      )
    }

    if (!Object.values(ShiftStatus).includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status: ${newStatus}` },
        { status: 400 }
      )
    }

    // Get current shift
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('id, status, client_id')
      .eq('id', shiftId)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    const currentStatus = shift.status as ShiftStatus

    // Validate status transition
    const isValid = validateStatusTransition(currentStatus, newStatus)
    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid status transition',
          currentStatus,
          requestedStatus: newStatus,
          message: `Cannot transition from ${getStatusLabel(currentStatus)} to ${getStatusLabel(newStatus)}`
        },
        { status: 400 }
      )
    }

    // Update shift status
    const { error: updateError } = await supabase
      .from('shifts')
      .update({ status: newStatus })
      .eq('id', shiftId)

    if (updateError) {
      console.error('Error updating shift status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update shift status' },
        { status: 500 }
      )
    }

    // Log status change
    const { error: logError } = await supabase
      .from('shift_status_logs')
      .insert({
        shift_id: shiftId,
        from_status: currentStatus,
        to_status: newStatus,
        reason: reason || null,
        changed_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging status change:', logError)
      // Don't fail the request if logging fails
    }

    console.log(`[Shift Status] ${shiftId}: ${currentStatus} → ${newStatus}`)

    return NextResponse.json({
      success: true,
      shiftId,
      previousStatus: currentStatus,
      newStatus,
      statusLabel: getStatusLabel(newStatus as ShiftStatus)
    })

  } catch (error: any) {
    console.error('Error in shift status update:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get Shift Status History
 *
 * GET /api/shifts/[id]/status
 *
 * Returns status change history for a shift
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shiftId = params.id

    // Get shift to verify it exists
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('id, status')
      .eq('id', shiftId)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // Get status history
    const { data: history, error: historyError } = await supabase
      .from('shift_status_logs')
      .select('*')
      .eq('shift_id', shiftId)
      .order('changed_at', { ascending: false })

    if (historyError) {
      console.error('Error fetching status history:', historyError)
      return NextResponse.json(
        { error: 'Failed to fetch status history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      shiftId,
      currentStatus: shift.status,
      history: history || []
    })

  } catch (error: any) {
    console.error('Error fetching shift status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
