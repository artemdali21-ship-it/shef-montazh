import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramIdParam = searchParams.get('telegramId')

    if (!telegramIdParam) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      )
    }

    // Parse telegram ID - it can be either number or string
    const telegramId = parseInt(telegramIdParam, 10)
    
    if (isNaN(telegramId)) {
      console.error('[API /auth/user] Invalid telegramId:', telegramIdParam)
      return NextResponse.json(
        { error: 'Invalid telegramId format' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    console.log('[API /auth/user] Getting user for Telegram ID:', telegramId)

    // Get user by telegram_id - try both as int and string
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, telegram_id, roles, current_role, avatar_url')
      .eq('telegram_id', telegramId)
      .single()

    if (error || !user) {
      console.log('[API /auth/user] User not found:', telegramId, 'error:', error?.message)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[API /auth/user] ✅ User found:', user.id, 'with roles:', user.roles)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        roles: user.roles || ['worker'],
        current_role: user.current_role || user.roles?.[0] || 'worker',
        avatar_url: user.avatar_url,
      },
    })
  } catch (error) {
    console.error('[API /auth/user] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
