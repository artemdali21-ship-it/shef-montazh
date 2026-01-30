import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')


    let query = supabase
      .from('shifts')
      .select(`
        *,
        client:client_id (
          id,
          full_name,
          rating
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: shifts, error } = await query

    if (error) throw error

    return NextResponse.json({ shifts })
  } catch (error: any) {
    console.error('Error fetching shifts feed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
