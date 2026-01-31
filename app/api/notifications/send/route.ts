import { NextRequest, NextResponse } from 'next/server'
import { notify } from '@/lib/notifications'
import { NotificationPayload } from '@/lib/types/notifications'

export async function POST(request: NextRequest) {
  try {
    const payload: NotificationPayload = await request.json()

    // Validate payload
    if (!payload.type || !payload.userId || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Missing required fields: type, userId, title, body' },
        { status: 400 }
      )
    }

    // Send notification
    const result = await notify(payload)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in /api/notifications/send:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
