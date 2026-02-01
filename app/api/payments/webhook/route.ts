import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/payments/yukassa'
import {
  processSuccessfulPayment,
  processCanceledPayment,
  processRefundedPayment,
  getPaymentByYukassaId
} from '@/lib/payments/processPayment'

/**
 * YooKassa Webhook Handler
 *
 * Receives and processes payment notifications from YooKassa
 * Events: payment.succeeded, payment.canceled, refund.succeeded
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body and signature
    const body = await request.text()
    const signature = request.headers.get('x-yookassa-signature')

    // Verify webhook signature for security
    if (!signature) {
      console.error('Webhook: Missing signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
      console.error('Webhook: Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook event
    const event = JSON.parse(body)
    console.log('Webhook received:', event.event, event.object.id)

    // Process different event types
    switch (event.event) {
      case 'payment.succeeded': {
        const payment = event.object
        const paymentId = payment.id
        const metadata = payment.metadata || {}
        const paymentMethod = payment.payment_method?.type

        console.log('Processing successful payment:', paymentId)

        // Check if payment exists in our database
        const { data: existingPayment } = await getPaymentByYukassaId(paymentId)
        if (!existingPayment) {
          console.error('Payment not found in database:', paymentId)
          return NextResponse.json(
            { error: 'Payment not found' },
            { status: 404 }
          )
        }

        // Process successful payment
        const result = await processSuccessfulPayment(
          paymentId,
          {
            shift_id: metadata.shift_id || existingPayment.shift_id,
            client_id: metadata.client_id || existingPayment.client_id,
            worker_id: metadata.worker_id || existingPayment.worker_id
          },
          paymentMethod
        )

        if (!result.success) {
          console.error('Failed to process payment:', result.error)
          return NextResponse.json(
            { error: result.message },
            { status: 500 }
          )
        }

        console.log('Payment processed successfully:', paymentId)
        break
      }

      case 'payment.canceled': {
        const payment = event.object
        const paymentId = payment.id

        console.log('Processing canceled payment:', paymentId)

        // Check if payment exists
        const { data: existingPayment } = await getPaymentByYukassaId(paymentId)
        if (!existingPayment) {
          console.error('Payment not found in database:', paymentId)
          return NextResponse.json(
            { error: 'Payment not found' },
            { status: 404 }
          )
        }

        // Process canceled payment
        const result = await processCanceledPayment(paymentId)

        if (!result.success) {
          console.error('Failed to process cancellation:', result.error)
          return NextResponse.json(
            { error: result.message },
            { status: 500 }
          )
        }

        console.log('Cancellation processed successfully:', paymentId)
        break
      }

      case 'refund.succeeded': {
        const refund = event.object
        const paymentId = refund.payment_id
        const refundId = refund.id

        console.log('Processing refund:', refundId, 'for payment:', paymentId)

        // Check if payment exists
        const { data: existingPayment } = await getPaymentByYukassaId(paymentId)
        if (!existingPayment) {
          console.error('Payment not found in database:', paymentId)
          return NextResponse.json(
            { error: 'Payment not found' },
            { status: 404 }
          )
        }

        // Process refund
        const result = await processRefundedPayment(paymentId, refundId)

        if (!result.success) {
          console.error('Failed to process refund:', result.error)
          return NextResponse.json(
            { error: result.message },
            { status: 500 }
          )
        }

        console.log('Refund processed successfully:', refundId)
        break
      }

      case 'payment.waiting_for_capture': {
        // Payment authorized, waiting for capture
        // Usually auto-captured, but can be handled here if needed
        console.log('Payment waiting for capture:', event.object.id)
        break
      }

      default: {
        console.log('Unhandled webhook event:', event.event)
      }
    }

    // Return success response to YooKassa
    return NextResponse.json({
      received: true,
      event: event.event,
      payment_id: event.object.id
    })
  } catch (error: any) {
    console.error('Webhook processing error:', error)

    // Return 500 to tell YooKassa to retry
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * Handle GET requests (for webhook verification)
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'YooKassa Webhook Handler',
    version: '1.0'
  })
}
