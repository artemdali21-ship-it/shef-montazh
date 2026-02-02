import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import type { LogoutResponse } from '@/types/session'

export async function POST(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json<LogoutResponse>(
        { success: false, error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Clear session token
    const { error } = await supabase
      .from('users')
      .update({
        session_token: null,
        session_expires_at: null,
      })
      .eq('telegram_id', telegramId)

    if (error) {
      console.error('[API] Error logging out:', error)
      return NextResponse.json<LogoutResponse>(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json<LogoutResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[API] Error in logout:', error)
    return NextResponse.json<LogoutResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
