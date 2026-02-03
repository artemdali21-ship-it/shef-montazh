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
 * 3. This endpoint validates that user has an active role selected
 */
export async function GET() {
  try {
    const supabase = createServerClient()

    console.log('[API /auth/me] Checking authentication...')

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

    // Step 3: CRITICAL CHECK - After logout, current_role is set to null
    // This is the indicator that user has logged out
    if (!user.current_role) {
      console.log('[API /auth/me] ⚠️ current_role is NULL - user has logged out')
      // Sign out from Supabase Auth to ensure clean state
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'User has logged out' },
        { status: 401 }
      )
    }

    // Step 4: Verify user has roles assigned
    if (!user.roles || user.roles.length === 0) {
      console.log('[API /auth/me] ⚠️ User has no roles assigned')
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'No roles assigned' },
        { status: 403 }
      )
    }

    // Step 5: Verify current_role is in user's roles list
    if (!user.roles.includes(user.current_role)) {
      console.log('[API /auth/me] ⚠️ current_role not in user roles - invalid state')
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Invalid current_role' },
        { status: 403 }
      )
    }

    console.log('[API /auth/me] ✅ User authenticated with role:', user.current_role)

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

