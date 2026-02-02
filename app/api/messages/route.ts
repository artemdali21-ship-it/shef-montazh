import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramNotification } from '@/lib/telegram'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Send message
export async function POST(req: NextRequest) {
  try {
    const { from_id, to_id, content } = await req.json()

    if (!from_id || !to_id || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({ from_id, to_id, content })
      .select()
      .single()

    if (error) throw error

    // Send notification
    const { data: fromUser } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', from_id)
      .single()

    await sendTelegramNotification({
      type: 'new_message',
      userId: to_id,
      title: '💬 Новое сообщение',
      body: `От: ${fromUser?.full_name}\n\n${content.slice(0, 100)}`,
      data: { fromUserId: from_id }
    })

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Get message history
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const otherUserId = searchParams.get('otherUserId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId || !otherUserId) {
      return NextResponse.json({ error: 'Missing userId or otherUserId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_id.eq.${userId},to_id.eq.${otherUserId}),and(from_id.eq.${otherUserId},to_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
