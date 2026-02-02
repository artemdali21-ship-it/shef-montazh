import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

/**
 * Get Current User Info with Multi-Role Support
 *
 * Returns current authenticated user data including all roles and active role.
 * Used by components to check user state and available roles.
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

    // Get user details from users table including roles
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, telegram_id, full_name, phone, avatar_url, roles, current_role, is_demo, is_verified, is_blocked')
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
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        roles: user.roles || [],
        current_role: user.current_role,
        is_demo: user.is_demo || false,
        is_verified: user.is_verified,
        is_blocked: user.is_blocked
      }
    })
  } catch (error) {
    console.error('[API] Error getting user info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
