import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { SwitchRoleResponse, UserRole } from '@/types/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, newRole } = body

    console.log('[API /auth/switch-role] Received:', { telegramId, newRole })

    if (!telegramId || !newRole) {
      console.error('[API /auth/switch-role] Missing required fields:', { telegramId, newRole })
      return NextResponse.json<SwitchRoleResponse>(
        { success: false, error: 'Telegram ID and new role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['worker', 'client', 'shef']
    if (!validRoles.includes(newRole)) {
      console.error('[API /auth/switch-role] Invalid role:', newRole)
      return NextResponse.json<SwitchRoleResponse>(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get current user
    console.log('[API /auth/switch-role] Fetching user with telegramId:', telegramId)
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('id, roles')
      .eq('telegram_id', telegramId)
      .single()

    if (getUserError || !user) {
      console.error('[API /auth/switch-role] User not found:', telegramId, getUserError)
      return NextResponse.json<SwitchRoleResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[API /auth/switch-role] Found user:', user.id, 'current roles:', user.roles)

    // Update role and reset onboarding for new role
    const updatedRoles = user.roles || []
    if (!updatedRoles.includes(newRole)) {
      updatedRoles.push(newRole)
    }

    console.log('[API /auth/switch-role] Updating user with role:', newRole, 'updatedRoles:', updatedRoles)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        current_role: newRole,
        role: newRole,
        roles: updatedRoles,
        has_completed_onboarding: false, // Reset onboarding for new role
        last_login_at: new Date().toISOString(),
      })
      .eq('telegram_id', telegramId)

    if (updateError) {
      console.error('[API /auth/switch-role] Error updating user:', updateError)
      return NextResponse.json<SwitchRoleResponse>(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    console.log('[API /auth/switch-role] ✅ User role updated successfully')

    // Create role-specific profile if doesn't exist
    if (newRole === 'worker') {
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!workerProfile) {
        console.log('[API /auth/switch-role] Creating worker profile for user:', user.id)
        await supabase.from('worker_profiles').insert({ user_id: user.id })
      }
    } else if (newRole === 'client') {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!clientProfile) {
        console.log('[API /auth/switch-role] Creating client profile for user:', user.id)
        await supabase.from('client_profiles').insert({ user_id: user.id })
      }
    }

    console.log('[API /auth/switch-role] ✅ COMPLETE - role switched to:', newRole)

    return NextResponse.json<SwitchRoleResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[API /auth/switch-role] Exception:', error)
    return NextResponse.json<SwitchRoleResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
