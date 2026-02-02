import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'


// POST /api/verifications - создать запрос верификации
export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { userId, type, provider = 'manual' } = await req.json()

  const { data, error } = await supabase
    .from('verifications')
    .insert([
      {
        user_id: userId,
        type,
        provider,
        status: 'pending'
      }
    ])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data[0])
}
