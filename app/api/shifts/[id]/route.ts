import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // AWAIT params (Next.js 15+)
    const params = await context.params
    
    const { data: shift, error } = await supabase
      .from('shifts')
      .select(`
        *,
        client:client_id (
          id,
          full_name,
          rating,
          phone
        ),
        applications (
          id,
          status,
          message,
          created_at,
          worker:worker_id (
            id,
            full_name,
            rating,
            phone
          )
        ),
        shift_workers (
          id,
          status,
          check_in_time,
          worker:worker_id (
            id,
            full_name,
            rating
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ shift })
  } catch (error: any) {
    console.error('Error fetching shift:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
