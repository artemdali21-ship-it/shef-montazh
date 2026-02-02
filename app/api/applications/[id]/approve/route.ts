import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createClient } from '@/lib/supabase-server'
import { sendTelegramNotification } from '@/lib/telegram'

/**
 * Approve Application
 *
 * Client одобряет заявку worker на смену.
 *
 * POST /api/applications/[id]/approve
 * Body: { approved: boolean }
 *
 * Actions:
 * - Обновляет статус application
 * - Добавляет worker в approved_workers смены
 * - Отправляет уведомление worker
 * - Обновляет статус смены если набран full roster
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const applicationId = params.id

    // Get current user (должен быть client)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse body
    const body = await request.json()
    const { approved } = body

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'approved field is required (boolean)' },
        { status: 400 }
      )
    }

    // Get application with shift details
    const { data: application, error: appError } = await supabase
      .from('shift_applications')
      .select(`
        *,
        shifts (
          id,
          client_id,
          title,
          required_workers,
          approved_workers,
          status
        )
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify user is the shift owner
    const shift = application.shifts as any
    if (shift.client_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not the owner of this shift' },
        { status: 403 }
      )
    }

    // Check if shift is still open
    if (shift.status !== 'open') {
      return NextResponse.json(
        { error: 'Shift is no longer accepting applications' },
        { status: 400 }
      )
    }

    if (approved) {
      // APPROVE APPLICATION

      // Check if worker is already approved
      const approvedWorkers = shift.approved_workers || []
      if (approvedWorkers.includes(application.worker_id)) {
        return NextResponse.json(
          { error: 'Worker is already approved for this shift' },
          { status: 400 }
        )
      }

      // Check if shift has available spots
      const requiredWorkers = shift.required_workers || 1
      if (approvedWorkers.length >= requiredWorkers) {
        return NextResponse.json(
          { error: 'Shift has reached maximum workers' },
          { status: 400 }
        )
      }

      // Update application status
      const { error: updateError } = await supabase
        .from('shift_applications')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Error updating application:', updateError)
        return NextResponse.json(
          { error: 'Failed to approve application' },
          { status: 500 }
        )
      }

      // Add worker to approved_workers array
      const updatedApprovedWorkers = [...approvedWorkers, application.worker_id]

      // Determine if shift should be marked as full
      const newShiftStatus = updatedApprovedWorkers.length >= requiredWorkers
        ? 'in_progress'
        : 'open'

      const { error: shiftUpdateError } = await supabase
        .from('shifts')
        .update({
          approved_workers: updatedApprovedWorkers,
          status: newShiftStatus
        })
        .eq('id', shift.id)

      if (shiftUpdateError) {
        console.error('Error updating shift:', shiftUpdateError)
        // Application is approved but shift not updated - not critical
      }

      // Send notification to worker
      try {
        const { data: shiftDetails } = await supabase
          .from('shifts')
          .select('title, date, start_time, end_time, location_address, pay_amount')
          .eq('id', shift.id)
          .single()

        if (shiftDetails) {
          await sendTelegramNotification({
            type: 'shift_accepted',
            userId: application.worker_id,
            title: '✅ Твой отклик одобрен!',
            body: `Поздравляем! Ты назначен на смену.

📍 ${shiftDetails.location_address}
⏰ ${shiftDetails.start_time} - ${shiftDetails.end_time}
💰 ${shiftDetails.pay_amount?.toLocaleString('ru-RU') || '0'}₽

Не забудь подтвердить выход за 30 мин до начала!`,
            data: {
              shiftId: shift.id,
              shiftTitle: shiftDetails.title,
            },
          })
        }
      } catch (notifError) {
        console.error('Error sending approval notification:', notifError)
      }

      // Log event
      await supabase.from('action_audit_log').insert({
        user_id: user.id,
        action: 'approve_application',
        resource_id: applicationId,
        metadata: {
          shift_id: shift.id,
          worker_id: application.worker_id
        }
      })

      return NextResponse.json({
        success: true,
        applicationId,
        status: 'approved',
        shiftStatus: newShiftStatus,
        approvedWorkers: updatedApprovedWorkers.length,
        requiredWorkers
      })

    } else {
      // REJECT APPLICATION

      const { error: updateError } = await supabase
        .from('shift_applications')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Error rejecting application:', updateError)
        return NextResponse.json(
          { error: 'Failed to reject application' },
          { status: 500 }
        )
      }

      // Send notification to worker
      try {
        await sendTelegramNotification({
          type: 'shift_rejected',
          userId: application.worker_id,
          title: '❌ Отклик отклонён',
          body: `К сожалению, твой отклик на смену "${shift.title}" не был принят.

Не расстраивайся! Продолжай откликаться на другие смены.`,
          data: {
            shiftId: shift.id,
            shiftTitle: shift.title,
          },
        })
      } catch (notifError) {
        console.error('Error sending rejection notification:', notifError)
      }

      // Log event
      await supabase.from('action_audit_log').insert({
        user_id: user.id,
        action: 'reject_application',
        resource_id: applicationId,
        metadata: {
          shift_id: shift.id,
          worker_id: application.worker_id
        }
      })

      return NextResponse.json({
        success: true,
        applicationId,
        status: 'rejected'
      })
    }

  } catch (error) {
    console.error('Error in approve application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
