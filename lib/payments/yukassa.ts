import { YooCheckout, ICreatePayment, IPayment } from '@a2seven/yoo-checkout'

// Initialize YooKassa client
const getCheckout = () => {
  const shopId = process.env.YUKASSA_SHOP_ID
  const secretKey = process.env.YUKASSA_SECRET_KEY

  if (!shopId || !secretKey) {
    throw new Error('YooKassa credentials not configured. Please set YUKASSA_SHOP_ID and YUKASSA_SECRET_KEY in .env.local')
  }

  return new YooCheckout({
    shopId,
    secretKey
  })
}

interface CreatePaymentParams {
  amount: number
  description: string
  orderId: string
  returnUrl: string
  metadata?: Record<string, any>
}

interface PaymentResult {
  id: string
  status: string
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
 * Create a new payment in YooKassa
 */
export async function createPayment({
  amount,
  description,
  orderId,
  returnUrl,
  metadata
}: CreatePaymentParams): Promise<PaymentResult> {
  try {
    const checkout = getCheckout()

    const payment: ICreatePayment = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      description,
      metadata: {
        order_id: orderId,
        ...metadata
      },
      capture: true // Auto-capture payment
    }

    const result = await checkout.createPayment(payment, orderId)

    return {
      id: result.id,
      status: result.status,
      amount: result.amount,
      confirmation: result.confirmation as any,
      created_at: result.created_at,
      metadata: result.metadata
    }
  } catch (error: any) {
    console.error('YooKassa payment creation error:', error)
    throw new Error(error.message || 'Failed to create payment')
  }
}

/**
 * Get payment information from YooKassa
 */
export async function getPaymentInfo(paymentId: string): Promise<IPayment> {
  try {
    const checkout = getCheckout()
    const payment = await checkout.getPayment(paymentId)
    return payment
  } catch (error: any) {
    console.error('YooKassa payment info error:', error)
    throw new Error(error.message || 'Failed to get payment info')
  }
}

/**
 * Capture a payment (if not auto-captured)
 */
export async function capturePayment(paymentId: string, amount?: number) {
  try {
    const checkout = getCheckout()

    const captureData: any = {}
    if (amount) {
      captureData.amount = {
        value: amount.toFixed(2),
        currency: 'RUB'
      }
    }

    const result = await checkout.capturePayment(paymentId, captureData)
    return result
  } catch (error: any) {
    console.error('YooKassa payment capture error:', error)
    throw new Error(error.message || 'Failed to capture payment')
  }
}

/**
 * Cancel a payment
 */
export async function cancelPayment(paymentId: string) {
  try {
    const checkout = getCheckout()
    const result = await checkout.cancelPayment(paymentId)
    return result
  } catch (error: any) {
    console.error('YooKassa payment cancellation error:', error)
    throw new Error(error.message || 'Failed to cancel payment')
  }
}

/**
 * Create a refund
 */
export async function createRefund(paymentId: string, amount: number, reason?: string) {
  try {
    const checkout = getCheckout()

    const refundData: any = {
      payment_id: paymentId,
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB'
      }
    }

    if (reason) {
      refundData.description = reason
    }

    const result = await checkout.createRefund(refundData)
    return result
  } catch (error: any) {
    console.error('YooKassa refund creation error:', error)
    throw new Error(error.message || 'Failed to create refund')
  }
}

/**
 * Get refund information
 */
export async function getRefundInfo(refundId: string) {
  try {
    const checkout = getCheckout()
    const refund = await checkout.getRefund(refundId)
    return refund
  } catch (error: any) {
    console.error('YooKassa refund info error:', error)
    throw new Error(error.message || 'Failed to get refund info')
  }
}

/**
 * Verify webhook notification signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  try {
    const crypto = require('crypto')
    const secretKey = process.env.YUKASSA_SECRET_KEY

    if (!secretKey) {
      throw new Error('YooKassa secret key not configured')
    }

    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(body)
      .digest('hex')

    return hash === signature
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}
