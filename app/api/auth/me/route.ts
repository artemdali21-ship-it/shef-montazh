import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

/**
 * Get Current User Info with Multi-Role Support
 *
 * Returns current authenticated user data including all roles and active role.
 * Used by components to check user state and available roles.
 * 
 * CRITICAL: After logout, this should return 401 because:
 * 1. Supabase auth session is cleared
 * 2. User's current_role is set to null in database
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    // Step 1: Get current session from Supabase Auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.log('[API /auth/me] No active session - returning 401')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[API /auth/me] Active session found for user:', session.user.id)

    // Step 2: Get user details from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, telegram_id, full_name, phone, avatar_url, roles, current_role, is_demo, is_verified, is_blocked')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      console.log('[API /auth/me] User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[API /auth/me] User data retrieved:', {
      id: user.id,
      telegram_id: user.telegram_id,
      roles: user.roles,
      current_role: user.current_role,
    })

    // Step 3: CRITICAL CHECK - if user has no roles or current_role is null, they should be logged out
    // This ensures that after logout (when current_role is set to null), user cannot auto-login
    if (!user.roles || user.roles.length === 0) {
      console.log('[API /auth/me] ⚠️ User has no roles - treating as logged out')
      // Optionally sign them out completely
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'No roles assigned' },
        { status: 403 }
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
    console.error('[API /auth/me] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

