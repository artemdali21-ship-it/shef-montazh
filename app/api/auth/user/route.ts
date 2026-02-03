import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegramId')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    console.log('[API] Getting user for Telegram ID:', telegramId)

    // Get user by telegram_id
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, telegram_id, roles, current_role, avatar_url')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (error || !user) {
      console.log('[API] User not found:', telegramId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[API] ✅ User found:', user.id)

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
    console.error('[API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
