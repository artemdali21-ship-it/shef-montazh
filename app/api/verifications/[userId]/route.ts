import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'


// Helper: get admin ID from request
async function getAdminId(): Promise<string> {
  // TODO: implement proper admin auth check
  return 'admin-user-id'
}

// Helper: update user verification level
async function updateUserVerificationLevel(userId: string, supabase: any) {
  const { data: verifications } = await supabase
    .from('verifications')
    .select('type, status')
    .eq('user_id', userId)
    .eq('status', 'verified')

  let level = 0
  if ((verifications || []).length > 0) level = 1
  if ((verifications || []).filter(v => v.type === 'company_inn').length > 0) level = 2

  await supabase
    .from('worker_profiles')
    .update({ verification_level: level, verification_status: 'verified' })
    .eq('user_id', userId)
}

// GET /api/verifications/[userId] - получить верификации пользователя
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', params.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// PATCH /api/verifications/[userId] - админ одобряет верификацию
export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { verificationId, approved } = await req.json()

  const { data, error } = await supabase
    .from('verifications')
    .update({
      status: approved ? 'verified' : 'rejected',
      verified_at: approved ? new Date().toISOString() : null,
      verified_by: approved ? (await getAdminId()) : null
    })
    .eq('id', verificationId)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Обновляем verification_level в профиле
  if (approved) {
    await updateUserVerificationLevel(params.userId, supabase)
  }

  return NextResponse.json(data[0])
}
