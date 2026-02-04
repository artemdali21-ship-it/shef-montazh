import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { RegisterResponse, UserRole } from '@/types/session'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { telegramId, role, fullName, phone } = await request.json()

    if (!telegramId || !role) {
      return NextResponse.json<RegisterResponse>(
        { success: false, error: 'Telegram ID and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['worker', 'client', 'shef']
    if (!validRoles.includes(role)) {
      return NextResponse.json<RegisterResponse>(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, roles, current_role')
      .eq('telegram_id', telegramId)
      .maybeSingle()

    if (existingUser) {
      // User exists - check if they already have this role
      const userRoles = existingUser.roles || []

      if (userRoles.includes(role)) {
        return NextResponse.json<RegisterResponse>(
          { success: false, error: 'Вы уже зарегистрированы в этой роли' },
          { status: 409 }
        )
      }

      // Add new role to existing user
      const updatedRoles = [...userRoles, role]

      const { error: updateError } = await supabase
        .from('users')
        .update({
          current_role: role,
          roles: updatedRoles,
          has_completed_onboarding: true, // User already saw InitialOnboarding
          last_login_at: new Date().toISOString(),
        })
        .eq('telegram_id', telegramId)

      if (updateError) {
        console.error('[API] Error adding role:', updateError)
        return NextResponse.json<RegisterResponse>(
          { success: false, error: updateError.message },
          { status: 500 }
        )
      }

      // Create role-specific profile if needed
      if (role === 'worker') {
        const { data: workerProfile } = await supabase
          .from('worker_profiles')
          .select('user_id')
          .eq('user_id', existingUser.id)
          .maybeSingle()

        if (!workerProfile) {
          await supabase.from('worker_profiles').insert({ user_id: existingUser.id })
        }
      } else if (role === 'client') {
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('user_id')
          .eq('user_id', existingUser.id)
          .maybeSingle()

        if (!clientProfile) {
          await supabase.from('client_profiles').insert({ user_id: existingUser.id })
        }
      }

      return NextResponse.json<RegisterResponse>({
        success: true,
        user: {
          id: existingUser.id,
          telegram_id: telegramId,
          role: role as UserRole,
          has_completed_onboarding: true,
        },
      })
    }

    // Generate session token using built-in crypto
    const sessionToken = crypto.randomUUID()
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        telegram_id: telegramId,
        role: role,
        current_role: role,
        roles: [role],
        user_type: role,
        full_name: fullName || 'User',
        phone: phone || '', // Empty string instead of null to satisfy NOT NULL constraint
        email: `${telegramId}@telegram.user`,
        has_completed_onboarding: true, // User already saw InitialOnboarding
        profile_completed: false,
        last_login_at: new Date().toISOString(),
        session_token: sessionToken,
        session_expires_at: sessionExpiresAt.toISOString(),
        rating: 0,
        total_shifts: 0,
        successful_shifts: 0,
        is_verified: false,
        gosuslugi_verified: false,
      })
      .select('id, telegram_id, role, has_completed_onboarding')
      .single()

    if (createError) {
      console.error('[API] Error creating user:', createError)
      return NextResponse.json<RegisterResponse>(
        { success: false, error: createError.message },
        { status: 500 }
      )
    }

    // Create role-specific profile
    if (role === 'worker') {
      await supabase.from('worker_profiles').insert({ user_id: newUser.id })
    } else if (role === 'client') {
      await supabase.from('client_profiles').insert({ user_id: newUser.id })
    }

    return NextResponse.json<RegisterResponse>({
      success: true,
      user: {
        id: newUser.id,
        telegram_id: newUser.telegram_id,
        role: newUser.role as UserRole,
        has_completed_onboarding: newUser.has_completed_onboarding,
      },
    })
  } catch (error) {
    console.error('[API] Error in register:', error)
    return NextResponse.json<RegisterResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
