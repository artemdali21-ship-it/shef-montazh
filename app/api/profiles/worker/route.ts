import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }


    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get worker profile
    const { data: profile, error: profileError } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError

    return NextResponse.json({ user, profile })
  } catch (error: any) {
    console.error('Error fetching worker profile:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
