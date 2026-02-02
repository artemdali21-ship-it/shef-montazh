import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { SwitchRoleResponse, UserRole } from '@/types/session'

export async function POST(request: NextRequest) {
  try {
    const { telegramId, newRole } = await request.json()

    if (!telegramId || !newRole) {
      return NextResponse.json<SwitchRoleResponse>(
        { success: false, error: 'Telegram ID and new role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['worker', 'client', 'shef']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json<SwitchRoleResponse>(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get current user
    const { data: user } = await supabase
      .from('users')
      .select('id, roles')
      .eq('telegram_id', telegramId)
      .single()

    if (!user) {
      return NextResponse.json<SwitchRoleResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update role and reset onboarding for new role
    const updatedRoles = user.roles || []
    if (!updatedRoles.includes(newRole)) {
      updatedRoles.push(newRole)
    }

    const { error } = await supabase
      .from('users')
      .update({
        current_role: newRole,
        role: newRole,
        roles: updatedRoles,
        has_completed_onboarding: false, // Reset onboarding for new role
        last_login_at: new Date().toISOString(),
      })
      .eq('telegram_id', telegramId)

    if (error) {
      console.error('[API] Error switching role:', error)
      return NextResponse.json<SwitchRoleResponse>(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Create role-specific profile if doesn't exist
    if (newRole === 'worker') {
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!workerProfile) {
        await supabase.from('worker_profiles').insert({ user_id: user.id })
      }
    } else if (newRole === 'client') {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!clientProfile) {
        await supabase.from('client_profiles').insert({ user_id: user.id })
      }
    }

    return NextResponse.json<SwitchRoleResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[API] Error in switch-role:', error)
    return NextResponse.json<SwitchRoleResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
