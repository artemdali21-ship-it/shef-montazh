import { NextRequest, NextResponse } from 'next/server'
import { sendTestNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    // In a real app, get user_id from authenticated session
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log('[v0] Sending test notification for user:', userId)

    const success = await sendTestNotification(userId)

    if (success) {
      return NextResponse.json(
        { message: 'Test notification sent successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[v0] Test notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
