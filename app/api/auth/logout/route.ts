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

    console.log('[API] 🔴 Logging out user with Telegram ID:', telegramId)

    // Очищаем текущую роль и сессию в БД
    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_role: null, // Очищаем текущую роль
        session_token: null,
        session_expires_at: null,
      })
      .eq('telegram_id', telegramId)

    if (updateError) {
      console.error('[API] Error updating user:', updateError)
      // Не возвращаем ошибку - logout должен быть успешен в любом случае
    }

    console.log('[API] ✅ Logout successful for user:', telegramId)

    return NextResponse.json<LogoutResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[API] Error in logout:', error)
    // Всегда возвращаем успех - CloudStorage очищена на клиенте
    return NextResponse.json<LogoutResponse>({
      success: true,
    })
  }
}
