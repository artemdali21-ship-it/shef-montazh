import { NextRequest, NextResponse } from 'next/server'
import {
  sendTelegramNotification,
  NotificationType,
} from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const { userId, type, data } = await request.json()

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and notification type required' },
        { status: 400 }
      )
    }

    // Validate notification type
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      )
    }

    console.log('[v0] Sending notification:', type, 'for user:', userId)

    const success = await sendTelegramNotification(userId, type, data || {})

    if (success) {
      return NextResponse.json(
        { message: 'Notification sent successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[v0] Notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
