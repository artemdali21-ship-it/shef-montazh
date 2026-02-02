import { createClient } from '@supabase/supabase-js'

export const useTelegram = () => {
  if (typeof window === 'undefined') return null;
  
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return null;

  // Ensure WebApp is ready
  if (!tg.isReady) {
    console.log('[useTelegram] WebApp not ready yet, calling ready()');
    tg.ready();
  }

  // Wait for initData to be available
  if (!tg.initDataUnsafe?.user) {
    console.warn('[useTelegram] initDataUnsafe.user not yet available');
    // This might happen if called before Telegram finishes initialization
    // The caller should retry or wait
  }

  tg.expand();
  tg.setHeaderColor('#8B8B8B');
  tg.setBackgroundColor('#8B8B8B');

  return {
    user: tg.initDataUnsafe?.user,
    close: () => tg.close(),
    haptic: (style: string) => tg.HapticFeedback?.impactOccurred(style)
  };
};

// Server-side Telegram Bot Integration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

export type NotificationType =
  | 'new_shift'
  | 'shift_accepted'
  | 'shift_rejected'
  | 'shift_starts_soon'
  | 'shift_completed'
  | 'payment_received'
  | 'payment_required'
  | 'payment_overdue'
  | 'worker_checked_in'
  | 'worker_no_show'
  | 'worker_late'
  | 'rating_updated'
  | 'user_blocked'
  | 'new_message'
  | 'team_assigned'

interface NotificationPayload {
  type: NotificationType
  userId: string
  title: string
  body: string
  data?: Record<string, any>
  actionUrl?: string
}

/**
 * Отправить уведомление в Telegram
 */
export async function sendTelegramNotification(
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string; messageId?: number }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Получить telegram_id пользователя из БД
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('id', payload.userId)
      .single()

    if (userError || !user?.telegram_id) {
      console.error('User telegram_id not found:', userError)
      return {
        success: false,
        error: 'User telegram_id not found'
      }
    }

    // 2. Проверить, включены ли уведомления этого типа
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('notification_settings')
      .eq('user_id', payload.userId)
      .single()

    if (prefs?.notification_settings?.[payload.type] === false) {
      console.log(`Notifications disabled for ${payload.type}`)
      return {
        success: false,
        error: 'Notifications disabled for this type'
      }
    }

    // 3. Составить сообщение
    const message = formatTelegramMessage(payload)

    // 4. Отправить в Telegram
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user.telegram_id,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error('Telegram API error:', result)
      return {
        success: false,
        error: result.description
      }
    }

    // 5. Логировать отправку
    await supabase.from('notifications').insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      is_read: false,
      created_at: new Date().toISOString(),
    })

    return {
      success: true,
      messageId: result.result.message_id
    }
  } catch (error) {
    console.error('sendTelegramNotification error:', error)
    return {
      success: false,
      error: String(error)
    }
  }
}

/**
 * Форматировать сообщение для Telegram
 */
function formatTelegramMessage(payload: NotificationPayload): string {
  const emojis: Record<NotificationType, string> = {
    new_shift: '🔔',
    shift_accepted: '✅',
    shift_rejected: '❌',
    shift_starts_soon: '⏰',
    shift_completed: '✅',
    payment_received: '💰',
    payment_required: '💳',
    payment_overdue: '🔴',
    worker_checked_in: '✅',
    worker_no_show: '❌',
    worker_late: '⚠️',
    rating_updated: '⭐',
    user_blocked: '🚫',
    new_message: '💬',
    team_assigned: '👥',
  }

  const emoji = emojis[payload.type]

  return `${emoji} <b>${payload.title}</b>\n\n${payload.body}`
}

/**
 * Отправить сообщение с кнопками
 */
export async function sendTelegramNotificationWithButtons(
  userId: string,
  title: string,
  body: string,
  buttons: Array<{ text: string; url: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: user } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('id', userId)
      .single()

    if (!user?.telegram_id) {
      return { success: false, error: 'User telegram_id not found' }
    }

    const inlineKeyboard = buttons.map((btn) => [
      { text: btn.text, url: btn.url },
    ])

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user.telegram_id,
        text: `<b>${title}</b>\n\n${body}`,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: inlineKeyboard },
      }),
    })

    const result = await response.json()
    return { success: result.ok, error: result.description }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
