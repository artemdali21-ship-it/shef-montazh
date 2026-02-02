import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const YUKASSA_API_URL = 'https://api.yookassa.ru/v3'
const YUKASSA_SHOP_ID = process.env.YUKASSA_SHOP_ID!
const YUKASSA_SECRET_KEY = process.env.YUKASSA_SECRET_KEY!

export interface CreatePaymentParams {
  amount: number
  description: string
  orderId: string
  userId: string
  metadata?: Record<string, any>
}

export interface YooKassaPaymentResponse {
  id: string
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  amount: {
    value: string
    currency: string
  }
  confirmation: {
    type: string
    confirmation_url: string
  }
  created_at: string
  metadata?: Record<string, any>
}

/**
 * Create YooKassa payment
 */
export async function createYooKassaPayment(params: CreatePaymentParams): Promise<YooKassaPaymentResponse> {
  const idempotenceKey = `${params.orderId}_${Date.now()}`

  const requestBody = {
    amount: {
      value: params.amount.toFixed(2),
      currency: 'RUB'
    },
    confirmation: {
      type: 'redirect',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`
    },
    capture: true,
    description: params.description,
    metadata: {
      order_id: params.orderId,
      user_id: params.userId,
      ...params.metadata
    }
  }

  const response = await fetch(`${YUKASSA_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      Authorization: `Basic ${Buffer.from(`${YUKASSA_SHOP_ID}:${YUKASSA_SECRET_KEY}`).toString('base64')}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`YooKassa error: ${error.description || 'Unknown error'}`)
  }

  const data = await response.json()
  return data
}

/**
 * Get payment status from YooKassa
 */
export async function getPaymentStatus(paymentId: string): Promise<YooKassaPaymentResponse> {
  const response = await fetch(`${YUKASSA_API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${YUKASSA_SHOP_ID}:${YUKASSA_SECRET_KEY}`).toString('base64')}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get payment status')
  }

  return await response.json()
}

/**
 * Refund payment
 */
export async function refundPayment(paymentId: string, amount: number, reason?: string): Promise<any> {
  const idempotenceKey = `refund_${paymentId}_${Date.now()}`

  const response = await fetch(`${YUKASSA_API_URL}/refunds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      Authorization: `Basic ${Buffer.from(`${YUKASSA_SHOP_ID}:${YUKASSA_SECRET_KEY}`).toString('base64')}`
    },
    body: JSON.stringify({
      payment_id: paymentId,
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      description: reason || 'Возврат средств'
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Refund error: ${error.description || 'Unknown error'}`)
  }

  return await response.json()
}

/**
 * Process YooKassa webhook
 */
export async function processYooKassaWebhook(event: any): Promise<void> {
  const { type, object } = event

  if (type === 'payment.succeeded') {
    const paymentId = object.id
    const metadata = object.metadata
    const shiftId = metadata?.shift_id

    if (!shiftId) {
      console.error('[YooKassa] No shift_id in payment metadata')
      return
    }

    // Update payment status in database
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_id: paymentId,
        paid_at: new Date().toISOString()
      })
      .eq('shift_id', shiftId)
      .eq('status', 'pending')

    if (error) {
      console.error('[YooKassa] Failed to update payment:', error)
      throw error
    }

    console.log(`[YooKassa] Payment ${paymentId} succeeded for shift ${shiftId}`)
  }

  if (type === 'payment.canceled') {
    const paymentId = object.id
    const metadata = object.metadata
    const shiftId = metadata?.shift_id

    if (shiftId) {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('shift_id', shiftId)
        .eq('payment_id', paymentId)

      console.log(`[YooKassa] Payment ${paymentId} canceled for shift ${shiftId}`)
    }
  }

  if (type === 'refund.succeeded') {
    const refundId = object.id
    const paymentId = object.payment_id

    await supabase
      .from('payments')
      .update({ status: 'refunded', refund_id: refundId })
      .eq('payment_id', paymentId)

    console.log(`[YooKassa] Refund ${refundId} succeeded for payment ${paymentId}`)
  }
}
