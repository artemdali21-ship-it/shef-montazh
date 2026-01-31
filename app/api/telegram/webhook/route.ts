import { NextRequest, NextResponse } from 'next/server'
import { sendMessageWithWebApp } from '@/lib/telegram/bot'

/**
 * Telegram Webhook Handler
 * Receives updates from Telegram Bot API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log incoming update for debugging
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2))

    // Handle /start command
    if (body.message?.text?.startsWith('/start')) {
      const chatId = body.message.chat.id
      const firstName = body.message.from.first_name || 'друг'
      const username = body.message.from.username

      // Log user info
      console.log(`/start command from: ${firstName} (@${username}), chat_id: ${chatId}`)

      const welcomeText = `Привет, ${firstName}! 👋

🎯 Добро пожаловать в **Шеф-Монтаж** — платформу для поиска работы и специалистов в событийной индустрии.

✅ Гарантированные смены
✅ Прозрачные выплаты
✅ Система рейтингов
✅ Быстрый подбор команды

Нажми кнопку ниже, чтобы открыть платформу! 👇`

      const webAppUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://v0-chef-montazh.vercel.app'

      const result = await sendMessageWithWebApp(
        chatId,
        welcomeText,
        '🚀 Открыть платформу',
        webAppUrl
      )

      if (!result.ok) {
        console.error('Failed to send welcome message:', result)
        return NextResponse.json(
          { error: 'Failed to send message' },
          { status: 500 }
        )
      }

      console.log('Welcome message sent successfully')
    }

    // Handle other message types (for future expansion)
    if (body.message?.text && !body.message.text.startsWith('/')) {
      console.log('Regular message received:', body.message.text)
      // Can add auto-reply or other logic here
    }

    // Handle callback queries (inline button clicks)
    if (body.callback_query) {
      console.log('Callback query received:', body.callback_query.data)
      // Can handle inline button clicks here
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET handler for webhook verification
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Telegram webhook endpoint',
    message: 'Use POST to send updates from Telegram'
  })
}
