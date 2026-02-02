import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const YUKASSA_SHOP_ID = process.env.YUKASSA_SHOP_ID
const YUKASSA_SECRET = process.env.YUKASSA_SECRET_KEY

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { shiftId, clientId, workerId, amount } = await req.json()

  // Проверка: смена должна быть completed
  const { data: shift } = await supabase
    .from('shifts')
    .select('status')
    .eq('id', shiftId)
    .single()

  if (shift?.status !== 'completed') {
    return NextResponse.json({ error: 'Shift not completed' }, { status: 400 })
  }

  // Создаём платёж через ЮКасса API
  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${YUKASSA_SHOP_ID}:${YUKASSA_SECRET}`).toString('base64')}`
    },
    body: JSON.stringify({
      amount: {
        value: (amount / 100).toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/shifts/${shiftId}/payment-success`
      },
      description: `Оплата смены ${shiftId}`,
      metadata: {
        shift_id: shiftId,
        client_id: clientId,
        worker_id: workerId
      }
    })
  })

  const paymentData = await response.json()

  // Сохраняем в БД
  const { data: payment } = await supabase
    .from('payments')
    .insert([
      {
        shift_id: shiftId,
        client_id: clientId,
        worker_id: workerId,
        amount,
        status: 'pending',
        yukassa_payment_id: paymentData.id,
        platform_fee: 1200
      }
    ])
    .select()

  return NextResponse.json({
    paymentLink: paymentData.confirmation.confirmation_url,
    paymentId: paymentData.id
  })
}
