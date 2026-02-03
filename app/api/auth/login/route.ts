import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { UserRole } from '@/types/session'

export async function POST(request: NextRequest) {
  try {
    const { telegramId, role } = await request.json()

    if (!telegramId || !role) {
      return NextResponse.json(
        { success: false, error: 'Telegram ID and role are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    console.log('[API] Logging in user:', { telegramId, role })

    // Get user by telegram_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, roles, current_role')
      .eq('telegram_id', telegramId)
      .single()

    if (userError || !user) {
      console.error('[API] User not found:', userError)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has this role
    if (!user.roles || !user.roles.includes(role)) {
      console.error('[API] User does not have this role')
      return NextResponse.json(
        { success: false, error: 'User does not have this role' },
        { status: 403 }
      )
    }

    // Update current_role in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ current_role: role })
      .eq('id', user.id)

    if (updateError) {
      console.error('[API] Error updating current_role:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update role' },
        { status: 500 }
      )
    }

    console.log('[API] ✅ Login successful for user:', telegramId)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegramId,
        role,
      }
    })
  } catch (error) {
    console.error('[API] Error in login:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
