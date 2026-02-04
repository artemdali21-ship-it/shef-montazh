import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { LogoutResponse } from '@/types/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const telegramIdParam = body.telegramId

    if (!telegramIdParam) {
      return NextResponse.json<LogoutResponse>(
        { success: false, error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    // Parse telegram ID as number
    const telegramId = parseInt(String(telegramIdParam), 10)
    if (isNaN(telegramId)) {
      console.error('[API Logout] Invalid telegramId:', telegramIdParam)
      return NextResponse.json<LogoutResponse>(
        { success: false, error: 'Invalid telegramId format' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    console.log('[API /auth/logout] 🔴 Starting logout for Telegram ID:', telegramId)

    // Step 1: Get user by telegram_id
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single()

    if (getUserError || !user) {
      console.log('[API /auth/logout] User not found:', telegramId, 'error:', getUserError?.message)
      // Still return success - logout should always succeed
      return NextResponse.json<LogoutResponse>({
        success: true,
      })
    }

    console.log('[API /auth/logout] Found user:', user.id)

    // Step 2: Clear current_role and session in database
    console.log('[API /auth/logout] Clearing current_role and session tokens...')
    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_role: null, // Очищаем текущую роль - это критично!
        session_token: null,
        session_expires_at: null,
      })
      .eq('telegram_id', telegramId) // Use telegram_id for consistency

    if (updateError) {
      console.error('[API /auth/logout] ⚠️ Error updating user:', updateError)
      // Continue anyway - we still want logout to succeed
    } else {
      console.log('[API /auth/logout] ✅ User updated (current_role set to NULL)')
    }

    // Step 3: CRITICAL - Sign out from Supabase Auth on server side
    console.log('[API /auth/logout] Signing out from Supabase Auth...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('[API /auth/logout] ⚠️ SignOut error:', signOutError)
    } else {
      console.log('[API /auth/logout] ✅ Signed out from Supabase Auth')
    }

    console.log('[API /auth/logout] ✅ LOGOUT COMPLETE for user:', user.id, 'telegramId:', telegramId)

    return NextResponse.json<LogoutResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[API /auth/logout] 🔴 Exception:', error)
    // Always return success - user side has cleared storage anyway
    return NextResponse.json<LogoutResponse>({
      success: true,
    })
  }
}
