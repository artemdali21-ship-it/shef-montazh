import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { createPayment as createYukassaPayment } from '@/lib/payments/yukassa'
import { createPayment as createPaymentRecord } from '@/lib/api/payments'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { shiftId, workerId, amount, description } = body

    // Validate required fields
    if (!shiftId || !workerId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: shiftId, workerId, amount' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get shift details to verify
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', shiftId)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // Verify user is the client for this shift
    if (shift.client_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to create payment for this shift' },
        { status: 403 }
      )
    }

    // Check if payment already exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('shift_id', shiftId)
      .single()

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this shift' },
        { status: 409 }
      )
    }

    // Create payment in YooKassa
    const orderId = `shift-${shiftId}-${Date.now()}`
    const returnUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL || 'http://localhost:3000'}/payments/success?shift_id=${shiftId}`

    const yukassaPayment = await createYukassaPayment({
      amount,
      description: description || `Оплата смены: ${shift.title}`,
      orderId,
      returnUrl,
      metadata: {
        shift_id: shiftId,
        client_id: user.id,
        worker_id: workerId
      }
    })

    // Save payment record to database
    const platformFee = 1200 // 1200 RUB platform fee
    const { data: payment, error: paymentError } = await createPaymentRecord({
      shift_id: shiftId,
      client_id: user.id,
      worker_id: workerId,
      amount,
      platform_fee: platformFee,
      payment_method: 'yukassa'
    })

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Update payment with YooKassa payment ID
    await supabase
      .from('payments')
      .update({ yukassa_payment_id: yukassaPayment.id })
      .eq('id', payment?.id)

    return NextResponse.json({
      success: true,
      paymentId: payment?.id,
      yukassaPaymentId: yukassaPayment.id,
      confirmationUrl: yukassaPayment.confirmation.confirmation_url,
      amount,
      platformFee,
      workerPayout: amount - platformFee
    })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}
