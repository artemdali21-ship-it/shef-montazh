import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import type { UserByTelegramResponse } from '@/types/session'

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json(
        { exists: false, error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Query user by telegram_id
    const { data: user, error } = await supabase
      .from('users')
      .select('id, telegram_id, role, current_role, has_completed_onboarding')
      .eq('telegram_id', telegramId)
      .maybeSingle()

    if (error) {
      console.error('[API] Error fetching user by telegram ID:', error)
      return NextResponse.json(
        { exists: false, error: error.message },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json<UserByTelegramResponse>({
        exists: false,
      })
    }

    return NextResponse.json<UserByTelegramResponse>({
      exists: true,
      id: user.id,
      role: user.current_role || user.role,
      hasSeenOnboarding: user.has_completed_onboarding || false,
      telegramId: user.telegram_id,
    })
  } catch (error) {
    console.error('[API] Error in user-by-telegram:', error)
    return NextResponse.json(
      { exists: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
