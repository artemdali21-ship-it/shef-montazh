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

    console.log('[API Logout] 🔴 Starting logout for Telegram ID:', telegramId)

    // Step 1: Get user by telegram_id
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single()

    if (getUserError || !user) {
      console.log('[API Logout] User not found:', telegramId)
      // Still return success - logout should always succeed
      return NextResponse.json<LogoutResponse>({
        success: true,
      })
    }

    console.log('[API Logout] Found user:', user.id)

    // Step 2: Clear current_role and session in database
    console.log('[API Logout] Clearing current_role and session tokens...')
    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_role: null, // Очищаем текущую роль
        session_token: null,
        session_expires_at: null,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[API Logout] ⚠️ Error updating user:', updateError)
      // Continue anyway - we still want logout to succeed
    } else {
      console.log('[API Logout] ✅ User updated (current_role cleared)')
    }

    // Step 3: CRITICAL - Sign out from Supabase Auth on server side
    console.log('[API Logout] Signing out from Supabase Auth...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('[API Logout] ⚠️ SignOut error:', signOutError)
    } else {
      console.log('[API Logout] ✅ Signed out from Supabase Auth')
    }

    console.log('[API Logout] ✅ LOGOUT COMPLETE for user:', user.id)

    return NextResponse.json<LogoutResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[API Logout] 🔴 Error in logout:', error)
    // Always return success - user side has cleared storage anyway
    return NextResponse.json<LogoutResponse>({
      success: true,
    })
  }
}
