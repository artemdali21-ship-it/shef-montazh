import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { UserRole } from '@/types/session'

interface GetRolesResponse {
  success: boolean
  roles?: UserRole[]
  currentRole?: UserRole
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegramId')

    if (!telegramId) {
      return NextResponse.json<GetRolesResponse>(
        { success: false, error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get user with all roles
    const { data: user, error } = await supabase
      .from('users')
      .select('roles, current_role')
      .eq('telegram_id', parseInt(telegramId))
      .maybeSingle()

    if (error) {
      console.error('[API] Error fetching roles:', error)
      return NextResponse.json<GetRolesResponse>(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json<GetRolesResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const roles = user.roles || []
    const currentRole = user.current_role || (roles.length > 0 ? roles[0] : undefined)

    return NextResponse.json<GetRolesResponse>({
      success: true,
      roles: roles as UserRole[],
      currentRole: currentRole as UserRole,
    })
  } catch (error) {
    console.error('[API] Error in user roles:', error)
    return NextResponse.json<GetRolesResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
