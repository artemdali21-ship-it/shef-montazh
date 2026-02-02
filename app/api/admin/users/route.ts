import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/users
 * Get all users
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (role) {
      query = query.eq('role', role)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Admin Users] GET error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
