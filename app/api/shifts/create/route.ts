import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendTelegramNotification } from '@/lib/telegram'

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

    // Send notifications to matching workers
    try {
      const { data: workers } = await supabase
        .from('worker_profiles')
        .select('user_id, categories')
        .contains('categories', [category])

      if (workers && workers.length > 0) {
        console.log(`[Shift Created] Sending notifications to ${workers.length} matching workers`)

        for (const worker of workers) {
          await sendTelegramNotification({
            type: 'new_shift',
            userId: worker.user_id,
            title: '🔔 Новая смена!',
            body: `Требуется ${category}

📍 ${location_address}
⏰ ${start_time} - ${end_time}
💰 ${pay_amount.toLocaleString('ru-RU')}₽

Нажми, чтобы откликнуться!`,
            data: {
              shiftId: shift.id,
              category,
              date,
            },
          })
        }
      }
    } catch (notifError) {
      console.error('Error sending shift notifications:', notifError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating shift:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
