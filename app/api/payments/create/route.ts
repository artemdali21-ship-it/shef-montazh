import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shiftId, workerId, amount, description } = body

    if (!shiftId || !workerId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Integrate with ЮKassa payment gateway
    // For now, return mock response
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Mock payment URL - replace with actual ЮKassa integration
    const paymentUrl = `/job/${shiftId}?payment=success`

    console.log('[v0] Payment created:', {
      transactionId,
      shiftId,
      workerId,
      amount,
      description,
    })

    return NextResponse.json(
      {
        success: true,
        transactionId,
        paymentUrl,
        message: 'Payment initiated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Payment API error:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
