import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function calculateTrustStatus(userId: string) {
  // Получаем trust events за последние 7 дней
  const { data: events } = await supabase
    .from('trust_events')
    .select('impact')
    .eq('user_id', userId)
    .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const trust_score = Math.max(
    0,
    Math.min(100, 100 + (events?.reduce((sum, e) => sum + e.impact, 0) || 0))
  )

  let status: 'ok' | 'warning' | 'restricted' | 'blocked'
  if (trust_score >= 70) status = 'ok'
  else if (trust_score >= 50) status = 'warning'
  else if (trust_score >= 20) status = 'restricted'
  else status = 'blocked'

  // Определяем таблицу профиля
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  const profile_table =
    user?.role === 'worker' ? 'worker_profiles' : 'client_profiles'

  // Обновляем в профиле
  await supabase
    .from(profile_table)
    .update({ trust_score, trust_status: status })
    .eq('user_id', userId)

  return { trust_score, status }
}
