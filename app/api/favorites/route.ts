import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET - Get user's favorites
 * POST - Add to favorites
 */

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        favorited_user:users!favorites_favorited_user_id_fkey(
          id,
          full_name,
          rating,
          role
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Favorites] GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { user_id, favorited_user_id } = await req.json()

    if (!user_id || !favorited_user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('favorited_user_id', favorited_user_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 409 }
      )
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id, favorited_user_id })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('[Favorites] POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const favoritedUserId = searchParams.get('favoritedUserId')

    if (!userId || !favoritedUserId) {
      return NextResponse.json(
        { error: 'Missing userId or favoritedUserId' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('favorited_user_id', favoritedUserId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Favorites] DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
