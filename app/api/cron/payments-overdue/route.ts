import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Проверка секретного токена
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const overdue24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Находим просроченные платежи
  const { data: overduePayments } = await supabase
    .from('payments')
    .select('id, client_id, worker_id, shift_id, amount, created_at')
    .eq('status', 'pending')
    .lt('created_at', overdue24h.toISOString())

  let blockedCount = 0

  for (const payment of overduePayments || []) {
    // Блокируем клиента
    const { data: client } = await supabase
      .from('client_profiles')
      .select('trust_score')
      .eq('user_id', payment.client_id)
      .single()

    await supabase
      .from('client_profiles')
      .update({
        trust_score: Math.max(0, (client?.trust_score || 100) - 30),
        status: 'restricted'
      })
      .eq('user_id', payment.client_id)

    // Логируем trust event
    await supabase.from('trust_events').insert([
      {
        user_id: payment.client_id,
        event_type: 'payment_overdue',
        shift_id: payment.shift_id,
        impact: -30
      }
    ])

    // Отправляем уведомление
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: payment.client_id,
        type: 'payment_overdue',
        shiftId: payment.shift_id,
        message: `Платёж просрочен на ${Math.floor((now.getTime() - new Date(payment.created_at).getTime()) / (1000 * 60 * 60))} часов`
      })
    })

    blockedCount++
  }

  // Логируем запуск крона
  await supabase.from('payment_cron_logs').insert([
    {
      overdue_found: overduePayments?.length || 0,
      clients_blocked: blockedCount
    }
  ])

  return NextResponse.json({
    success: true,
    overdueFound: overduePayments?.length || 0,
    blockedCount
  })
}
