import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Helper: update endorsement stats
async function updateWorkerEndorsementStats(userId: string, supabase: any) {
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('weight')
    .eq('endorsed_user_id', userId)
    .eq('status', 'active')

  const count = endorsements?.length || 0
  const avgWeight = count > 0
    ? (endorsements || []).reduce((sum, e) => sum + e.weight, 0) / count
    : 0

  await supabase
    .from('worker_profiles')
    .update({
      endorsement_count: count,
      endorsement_weight: avgWeight,
      verification_level: count > 0 ? 1 : 0
    })
    .eq('user_id', userId)
}

// POST /api/endorsements - создать рекомендацию
export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { endorsedUserId, endorserUserId, role, weight = 1, reason } = await req.json()

  // Проверка: рекомендовать может только верифицированный шеф/admin
  const { data: endorser } = await supabase
    .from('users')
    .select('role')
    .eq('id', endorserUserId)
    .single()

  if (endorser?.role !== 'shef' && endorser?.role !== 'admin') {
    return NextResponse.json({ error: 'Only shefs can endorse' }, { status: 403 })
  }

  // Проверка лимита: макс 5 активных рекомендаций
  const { data: existing, count } = await supabase
    .from('endorsements')
    .select('id', { count: 'exact' })
    .eq('endorser_user_id', endorserUserId)
    .eq('status', 'active')

  if ((count || 0) >= 5) {
    return NextResponse.json({ error: 'Endorsement limit reached' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('endorsements')
    .insert([
      {
        endorsed_user_id: endorsedUserId,
        endorser_user_id: endorserUserId,
        endorser_role: role,
        weight,
        reason
      }
    ])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Обновляем endorsement_count
  await updateWorkerEndorsementStats(endorsedUserId, supabase)

  return NextResponse.json(data[0])
}
