import { createClient } from '@/lib/supabase-client'

interface PaymentProcessResult {
  success: boolean
  message: string
  error?: any
}

/**
 * Process successful payment
 */
export async function processSuccessfulPayment(
  yukassaPaymentId: string,
  metadata: {
    shift_id: string
    client_id: string
    worker_id: string
  },
  paymentMethod?: string
): Promise<PaymentProcessResult> {
  const supabase = await createClient()

  try {
    // Update payment status to succeeded
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        payment_method: paymentMethod || 'bank_card',
        paid_at: new Date().toISOString()
      })
      .eq('yukassa_payment_id', yukassaPaymentId)
      .select()
      .single()

    if (paymentError) {
      console.error('Error updating payment:', paymentError)
      return {
        success: false,
        message: 'Failed to update payment',
        error: paymentError
      }
    }

    // Update shift status to completed (payment received)
    const { error: shiftError } = await supabase
      .from('shifts')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', metadata.shift_id)

    if (shiftError) {
      console.error('Error updating shift:', shiftError)
    }

    // Send notification to worker
    await sendPaymentNotification({
      userId: metadata.worker_id,
      type: 'payment_received',
      amount: payment?.amount || 0,
      platformFee: payment?.platform_fee || 0,
      shiftId: metadata.shift_id
    })

    // Send notification to client
    await sendPaymentNotification({
      userId: metadata.client_id,
      type: 'payment_confirmed',
      amount: payment?.amount || 0,
      shiftId: metadata.shift_id
    })

    return {
      success: true,
      message: 'Payment processed successfully'
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return {
      success: false,
      message: 'Error processing payment',
      error
    }
  }
}

/**
 * Process canceled payment
 */
export async function processCanceledPayment(
  yukassaPaymentId: string
): Promise<PaymentProcessResult> {
  const supabase = await createClient()

  try {
    // Update payment status to canceled
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'canceled'
      })
      .eq('yukassa_payment_id', yukassaPaymentId)
      .select()
      .single()

    if (paymentError) {
      console.error('Error updating payment:', paymentError)
      return {
        success: false,
        message: 'Failed to update payment',
        error: paymentError
      }
    }

    // Get payment metadata
    const metadata = payment?.metadata as any

    // Send notification to client
    if (metadata?.client_id) {
      await sendPaymentNotification({
        userId: metadata.client_id,
        type: 'payment_canceled',
        amount: payment?.amount || 0,
        shiftId: metadata?.shift_id
      })
    }

    return {
      success: true,
      message: 'Payment cancellation processed'
    }
  } catch (error) {
    console.error('Error processing canceled payment:', error)
    return {
      success: false,
      message: 'Error processing cancellation',
      error
    }
  }
}

/**
 * Process refunded payment
 */
export async function processRefundedPayment(
  yukassaPaymentId: string,
  refundId: string
): Promise<PaymentProcessResult> {
  const supabase = await createClient()

  try {
    // Update payment status to refunded
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        yukassa_refund_id: refundId,
        refunded_at: new Date().toISOString()
      })
      .eq('yukassa_payment_id', yukassaPaymentId)
      .select()
      .single()

    if (paymentError) {
      console.error('Error updating payment:', paymentError)
      return {
        success: false,
        message: 'Failed to update payment',
        error: paymentError
      }
    }

    // Get payment metadata
    const metadata = payment?.metadata as any

    // Send notifications
    if (metadata?.client_id) {
      await sendPaymentNotification({
        userId: metadata.client_id,
        type: 'payment_refunded',
        amount: payment?.amount || 0,
        shiftId: metadata?.shift_id
      })
    }

    if (metadata?.worker_id) {
      await sendPaymentNotification({
        userId: metadata.worker_id,
        type: 'payment_refunded',
        amount: payment?.amount || 0,
        shiftId: metadata?.shift_id
      })
    }

    return {
      success: true,
      message: 'Refund processed successfully'
    }
  } catch (error) {
    console.error('Error processing refund:', error)
    return {
      success: false,
      message: 'Error processing refund',
      error
    }
  }
}

/**
 * Send payment notification to user
 */
async function sendPaymentNotification(params: {
  userId: string
  type: 'payment_received' | 'payment_confirmed' | 'payment_canceled' | 'payment_refunded'
  amount: number
  platformFee?: number
  shiftId?: string
}) {
  const supabase = await createClient()

  try {
    let title = ''
    let message = ''

    switch (params.type) {
      case 'payment_received':
        const workerPayout = params.amount - (params.platformFee || 0)
        title = 'Оплата получена! 💰'
        message = `Вам начислено ${workerPayout.toLocaleString('ru-RU')} ₽`
        break

      case 'payment_confirmed':
        title = 'Оплата подтверждена ✅'
        message = `Оплата ${params.amount.toLocaleString('ru-RU')} ₽ успешно проведена`
        break

      case 'payment_canceled':
        title = 'Оплата отменена ❌'
        message = `Оплата ${params.amount.toLocaleString('ru-RU')} ₽ была отменена`
        break

      case 'payment_refunded':
        title = 'Возврат средств 💳'
        message = `Возвращено ${params.amount.toLocaleString('ru-RU')} ₽`
        break
    }

    // Create notification in database
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        title,
        message,
        type: 'payment',
        data: {
          shift_id: params.shiftId,
          amount: params.amount
        }
      })

    if (error) {
      console.error('Error creating notification:', error)
    }

    // TODO: Send push notification via Telegram bot
    // TODO: Send email notification

    return { success: true }
  } catch (error) {
    console.error('Error sending notification:', error)
    return { success: false, error }
  }
}

/**
 * Get payment by YooKassa payment ID
 */
export async function getPaymentByYukassaId(yukassaPaymentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('yukassa_payment_id', yukassaPaymentId)
    .single()

  return { data, error }
}
