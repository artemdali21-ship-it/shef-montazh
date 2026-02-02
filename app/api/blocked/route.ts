import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET - Get user's blocked list
 * POST - Block a user
 * DELETE - Unblock a user
 */

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('blocked_users')
      .select(`
        *,
        blocked_user:users!blocked_users_blocked_user_id_fkey(
          id,
          full_name,
          role
        )
      `)
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Blocked] GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { blocker_id, blocked_user_id, reason } = await req.json()

    if (!blocker_id || !blocked_user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prevent self-blocking
    if (blocker_id === blocked_user_id) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      )
    }

    // Check if already blocked
    const { data: existing } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', blocker_id)
      .eq('blocked_user_id', blocked_user_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'User already blocked' },
        { status: 409 }
      )
    }

    // Block user
    const { data, error } = await supabase
      .from('blocked_users')
      .insert({ blocker_id, blocked_user_id, reason })
      .select()
      .single()

    if (error) throw error

    // Remove from favorites if favorited
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', blocker_id)
      .eq('favorited_user_id', blocked_user_id)

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('[Blocked] POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const blockerId = searchParams.get('blockerId')
    const blockedUserId = searchParams.get('blockedUserId')

    if (!blockerId || !blockedUserId) {
      return NextResponse.json(
        { error: 'Missing blockerId or blockedUserId' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_user_id', blockedUserId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Blocked] DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
