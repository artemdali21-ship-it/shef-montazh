import { createClient } from '@supabase/supabase-js'

// Notification types enum
export enum NotificationType {
  // Shifts
  NEW_SHIFT_AVAILABLE = 'new_shift_available',
  APPLICATION_APPROVED = 'application_approved',
  NEW_APPLICATION = 'new_application',
  SHIFT_REMINDER = 'shift_reminder',
  WORKER_CHECKED_IN = 'worker_checked_in',

  // Payments
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_OVERDUE = 'payment_overdue',

  // Communication
  NEW_MESSAGE = 'new_message',
  RATING_RECEIVED = 'rating_received',

  // System
  SYSTEM_UPDATE = 'system_update',
}

interface NotificationData {
  shiftTitle?: string
  location?: string
  price?: number
  date?: string
  time?: string
  clientName?: string
  workerName?: string
  rating?: number
  amount?: number
  days?: number
  messageName?: string
  messagePreview?: string
  checkInTime?: string
  address?: string
  [key: string]: any
}

// Initialize Supabase client
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[v0] Missing Supabase credentials')
    return null
  }

  return createClient(url, key)
}

// Send Telegram message via Bot API
async function sendToTelegram(
  chatId: number | string,
  message: string
): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN

    if (!token) {
      console.error('[v0] TELEGRAM_BOT_TOKEN not set')
      return false
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    )

    const result = await response.json()

    if (!result.ok) {
      console.error('[v0] Telegram API error:', result.description)
      return false
    }

    console.log('[v0] Telegram message sent successfully')
    return true
  } catch (error) {
    console.error('[v0] Failed to send Telegram message:', error)
    return false
  }
}

// Build notification message based on type
function buildNotificationMessage(
  type: NotificationType,
  data: NotificationData
): string {
  switch (type) {
    case NotificationType.NEW_SHIFT_AVAILABLE:
      return `🆕 <b>Новая смена в вашем районе!</b>

<b>${data.shiftTitle}</b>
📍 ${data.location}
💰 <b>${data.price?.toLocaleString('ru-RU')} ₽</b>
🕐 ${data.date}, ${data.time}`

    case NotificationType.APPLICATION_APPROVED:
      return `✅ <b>Ваш отклик одобрен!</b>

<b>Смена:</b> ${data.shiftTitle}
<b>Заказчик:</b> ${data.clientName}
<b>Начало:</b> ${data.date}, ${data.time}`

    case NotificationType.NEW_APPLICATION:
      return `👤 <b>Новый отклик на вашу смену</b>

<b>Смена:</b> ${data.shiftTitle}
<b>Исполнитель:</b> ${data.workerName}
<b>Рейтинг:</b> ${data.rating}⭐`

    case NotificationType.SHIFT_REMINDER:
      return `⏰ <b>Напоминание о смене через 1 час</b>

<b>${data.shiftTitle}</b>
📍 ${data.address}
⏱️ Начинается в ${data.time}

<i>Не забудьте сделать check-in!</i>`

    case NotificationType.WORKER_CHECKED_IN:
      return `✓ <b>${data.workerName} вышел на объект</b>

<b>Смена:</b> ${data.shiftTitle}
⏱️ <b>Время check-in:</b> ${data.checkInTime}`

    case NotificationType.PAYMENT_RECEIVED:
      return `💰 <b>Оплата получена!</b>

<b>Смена:</b> ${data.shiftTitle}
<b>Сумма:</b> ${data.amount?.toLocaleString('ru-RU')} ₽

Спасибо за работу! 👏`

    case NotificationType.PAYMENT_OVERDUE:
      return `⚠️ <b>Оплата просрочена</b>

<b>Смена:</b> ${data.shiftTitle}
<b>Просрочка:</b> ${data.days} дней

Пожалуйста, свяжитесь с заказчиком`

    case NotificationType.NEW_MESSAGE:
      return `💬 <b>Новое сообщение от ${data.messageName}</b>

${data.messagePreview}...`

    case NotificationType.RATING_RECEIVED:
      return `⭐ <b>Вас оценили!</b>

<b>${data.messageName}</b> поставил <b>${data.rating}/5</b>
<i>"${data.messagePreview}"</i>`

    case NotificationType.SYSTEM_UPDATE:
      return `📢 <b>Важное обновление</b>

${data.messagePreview}`

    default:
      return 'Уведомление'
  }
}

// Main function to send notification
export async function sendTelegramNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.error('[v0] Supabase client not initialized')
      return false
    }

    console.log('[v0] Sending notification:', type, 'to user:', userId)

    // Fetch user's telegram_id and notification settings
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('id', userId)
      .single()

    if (userError || !userData?.telegram_id) {
      console.error('[v0] User not found or no telegram_id:', userError)
      return false
    }

    // Check if user has this notification enabled
    const { data: settings, error: settingsError } = await supabase
      .from('user_notification_settings')
      .select(type)
      .eq('user_id', userId)
      .single()

    if (!settingsError && settings && !settings[type]) {
      console.log('[v0] Notification type disabled for user:', type)
      return false
    }

    // Build message
    const message = buildNotificationMessage(type, data)

    // Send to Telegram
    const success = await sendToTelegram(userData.telegram_id, message)

    if (success) {
      // Log notification to database
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        data,
        sent_at: new Date().toISOString(),
        is_read: false,
      })
    }

    return success
  } catch (error) {
    console.error('[v0] Error sending notification:', error)
    return false
  }
}

// Send test notification
export async function sendTestNotification(userId: string): Promise<boolean> {
  return sendTelegramNotification(userId, NotificationType.SYSTEM_UPDATE, {
    messagePreview: '✅ Тестовое уведомление успешно отправлено! Система уведомлений работает.',
  })
}

// Batch send notifications
export async function sendBatchNotifications(
  userIds: string[],
  type: NotificationType,
  data: NotificationData
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const userId of userIds) {
    const result = await sendTelegramNotification(userId, type, data)
    if (result) {
      success++
    } else {
      failed++
    }
    // Rate limiting: respect Telegram API limits (30 msg/sec)
    await new Promise((resolve) => setTimeout(resolve, 34))
  }

  console.log(`[v0] Batch notifications: ${success} sent, ${failed} failed`)
  return { success, failed }
}

// Send notification with retry logic
export async function sendTelegramNotificationWithRetry(
  userId: string,
  type: NotificationType,
  data: NotificationData,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendTelegramNotification(userId, type, data)
      if (result) {
        return true
      }
    } catch (error) {
      console.error(`[v0] Retry attempt ${attempt} failed:`, error)
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        )
      }
    }
  }

  console.error(`[v0] All ${maxRetries} retry attempts failed`)
  return false
}
