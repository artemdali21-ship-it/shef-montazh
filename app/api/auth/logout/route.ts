import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
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

    const supabase = createServerClient()

    // Get user to check how many roles they have
    const { data: user } = await supabase
      .from('users')
      .select('roles')
      .eq('telegram_id', telegramId)
      .maybeSingle()

    // Clear session (but don't reset onboarding - user keeps their profile)
    const { error } = await supabase
      .from('users')
      .update({
        session_token: null,
        session_expires_at: null,
        current_role: null, // Clear current role
      })
      .eq('telegram_id', telegramId)

    if (error) {
      console.error('[API] Error logging out:', error)
      return NextResponse.json<LogoutResponse>(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const userRoles = user?.roles || []
    const multipleRoles = userRoles.length > 1

    console.log('[API] Logout successful. User has', userRoles.length, 'role(s)')

    return NextResponse.json<LogoutResponse>({
      success: true,
      multipleRoles, // Signal to frontend whether to show role-picker
    })
  } catch (error) {
    console.error('[API] Error in logout:', error)
    return NextResponse.json<LogoutResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
