import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramNotification } from '@/lib/telegram'


/**
 * Complete Shift + Rating
 *
 * POST /api/shifts/complete
 * Body: {
 *   shiftId: string,
 *   userId: string (who is completing),
 *   userRole: 'client' | 'worker',
 *   rating?: number (1-5),
 *   comment?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { shiftId, userId, userRole, rating, comment } = await req.json()

    if (!shiftId || !userId || !userRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (userRole !== 'client' && userRole !== 'worker') {
      return NextResponse.json(
        { error: 'Invalid userRole' },
        { status: 400 }
      )
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get shift details
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('*, shift_assignments(worker_id, users(full_name))')
      .eq('id', shiftId)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // Verify user is part of this shift
    const isClient = shift.client_id === userId
    const isWorker = shift.shift_assignments?.some((a: any) => a.worker_id === userId)

    if (!isClient && !isWorker) {
      return NextResponse.json(
        { error: 'You are not part of this shift' },
        { status: 403 }
      )
    }

    // Check who is completing
    const completionField = userRole === 'client' ? 'client_completed' : 'worker_completed'
    const otherCompletionField = userRole === 'client' ? 'worker_completed' : 'client_completed'

    // Update completion status
    const updateData: any = {
      [completionField]: true,
      [`${completionField}_at`]: new Date().toISOString()
    }

    const { data: updatedShift, error: updateError } = await supabase
      .from('shifts')
      .update(updateData)
      .eq('id', shiftId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating shift completion:', updateError)
      return NextResponse.json(
        { error: 'Failed to complete shift' },
        { status: 500 }
      )
    }

    // Save rating if provided
    if (rating) {
      const ratedUserId = userRole === 'client'
        ? shift.shift_assignments?.[0]?.worker_id
        : shift.client_id

      if (ratedUserId) {
        await supabase.from('ratings').insert({
          shift_id: shiftId,
          rater_id: userId,
          rated_user_id: ratedUserId,
          rating,
          comment: comment || null,
          created_at: new Date().toISOString()
        })

        // Recalculate average rating
        await recalculateUserRating(ratedUserId)
      }
    }

    // Check if both sides completed
    const bothCompleted = updatedShift[otherCompletionField] === true

    if (bothCompleted) {
      // Update status to completed
      await supabase
        .from('shifts')
        .update({ status: 'completed' })
        .eq('id', shiftId)

      // Generate digital act
      const act = await generateDigitalAct(shift)

      // Save act to documents
      await supabase.from('documents').insert({
        shift_id: shiftId,
        type: 'completion_act',
        content: act,
        created_at: new Date().toISOString(),
        signed_by: [shift.client_id, shift.shift_assignments?.[0]?.worker_id]
      })

      // Send notifications to both parties
      await sendTelegramNotification({
        type: 'shift_completed',
        userId: shift.client_id,
        title: '✅ Смена завершена',
        body: `Смена "${shift.title}" завершена.\n\nЦифровой акт сформирован.`,
        data: { shiftId }
      })

      const workerId = shift.shift_assignments?.[0]?.worker_id
      if (workerId) {
        await sendTelegramNotification({
          type: 'shift_completed',
          userId: workerId,
          title: '✅ Смена завершена',
          body: `Смена "${shift.title}" завершена.\n\nЦифровой акт сформирован.`,
          data: { shiftId }
        })
      }
    }

    return NextResponse.json({
      success: true,
      shiftId,
      userCompleted: true,
      bothCompleted,
      message: bothCompleted
        ? 'Обе стороны подтвердили завершение. Акт сформирован.'
        : 'Ожидаем подтверждения от другой стороны.'
    })

  } catch (error: any) {
    console.error('Error completing shift:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Recalculate user average rating
 */
async function recalculateUserRating(userId: string) {
  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('rated_user_id', userId)

  if (ratings && ratings.length > 0) {
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

    await supabase
      .from('users')
      .update({ rating: avgRating })
      .eq('id', userId)
  }
}

/**
 * Generate digital completion act
 */
async function generateDigitalAct(shift: any): Promise<string> {
  const worker = shift.shift_assignments?.[0]?.users
  const date = new Date().toLocaleDateString('ru-RU')
  const time = new Date().toLocaleTimeString('ru-RU')

  return `
ЦИФРОВОЙ АКТ ВЫПОЛНЕННЫХ РАБОТ

Дата: ${date}
Время: ${time}

Смена: ${shift.title}
Категория: ${shift.category}
Дата работы: ${shift.date}
Время: ${shift.start_time} - ${shift.end_time}

Место: ${shift.location_address}

Заказчик: [Данные заказчика]
Исполнитель: ${worker?.full_name || 'Неизвестно'}

Стоимость работ: ${shift.pay_amount?.toLocaleString('ru-RU')} ₽

Работы выполнены в полном объеме.
Стороны претензий друг к другу не имеют.

Электронные подписи:
Заказчик: ${shift.client_id} (${shift.client_completed_at})
Исполнитель: ${shift.shift_assignments?.[0]?.worker_id} (${shift.worker_completed_at})

Документ сформирован автоматически в системе ШЕФ-МОНТАЖ
  `.trim()
}
