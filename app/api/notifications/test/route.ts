import { NextRequest, NextResponse } from 'next/server'
import { notify } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log('[Test] Sending test notification for user:', userId)

    // Send a test notification
    const result = await notify({
      userId,
      type: 'new_shift',
      title: 'Тестовое уведомление',
      message: 'Это тестовое уведомление для проверки работы системы',
      data: {
        shiftId: 'test-shift-id',
        shiftTitle: 'Тестовая смена'
      }
    })

    if (result.success) {
      return NextResponse.json(
        { message: 'Test notification sent successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send test notification', details: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Test] Notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
