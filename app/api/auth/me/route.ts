import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

/**
 * Get Current User Info
 *
 * Returns current authenticated user data including demo status.
 * Used by DemoBanner and other components to check user state.
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user details from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, telegram_id, username, first_name, last_name, role, is_demo, is_verified, is_blocked')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_demo: user.is_demo || false,
        is_verified: user.is_verified,
        is_blocked: user.is_blocked
      }
    })
  } catch (error) {
    console.error('Error getting user info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
