import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Telegram Auto-Login Endpoint
 *
 * Authenticates user via Telegram ID without password
 */
export async function POST(req: NextRequest) {
  try {
    const { telegramId, telegramData } = await req.json()

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 })
    }

    // Check if user exists with this telegram_id
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('Database error:', userError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // If user exists, create session
    if (existingUser) {
      // Get or create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(existingUser.id)

      if (authError) {
        console.error('Auth error:', authError)
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        user: existingUser,
        isNewUser: false
      })
    }

    // If user doesn't exist, return info for registration
    return NextResponse.json({
      success: false,
      isNewUser: true,
      telegramData: {
        telegram_id: telegramId,
        first_name: telegramData?.first_name,
        last_name: telegramData?.last_name,
        username: telegramData?.username,
        photo_url: telegramData?.photo_url
      }
    })
  } catch (error: any) {
    console.error('Telegram auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
