import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shift_id, worker_id, message } = body

    // Validate required fields
    if (!shift_id || !worker_id) {
      return NextResponse.json({ error: 'shift_id and worker_id required' }, { status: 400 })
    }


    // Check if application already exists
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('shift_id', shift_id)
      .eq('worker_id', worker_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Application already exists' }, { status: 409 })
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert([{
        shift_id,
        worker_id,
        message: message || '',
        status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ application }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
