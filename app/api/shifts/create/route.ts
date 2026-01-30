import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_id,
      title,
      description,
      category,
      location_address,
      location_lat,
      location_lng,
      date,
      start_time,
      end_time,
      pay_amount,
      required_workers,
      required_rating,
      tools_required
    } = body

    // Validate required fields
    if (!client_id || !title || !category || !location_address || !date || !start_time || !end_time || !pay_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }


    const { data: shift, error } = await supabase
      .from('shifts')
      .insert([{
        client_id,
        title,
        description,
        category,
        location_address,
        location_lat,
        location_lng,
        date,
        start_time,
        end_time,
        pay_amount,
        required_workers: required_workers || 1,
        required_rating: required_rating || 0,
        tools_required: tools_required || [],
        status: 'open'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating shift:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
