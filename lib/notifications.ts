import { createClient } from '@/lib/supabase-client'
import { NotificationPayload, NotificationType, NOTIFICATION_TYPE_TO_SETTING } from '@/lib/types/notifications'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// Message templates with HTML formatting
export const notificationTemplates = {
  new_shift: (data: any) =>
    `🔔 <b>Новая смена</b>\n\n${data.category} требуется ${data.date}\n📍 ${data.location}\n💰 ${data.pay}₽`,

  application_approved: (data: any) =>
    `✅ <b>Отклик одобрен!</b>\n\n${data.shiftTitle}\n📅 ${data.date} в ${data.time}\n📍 ${data.location}`,

  shift_starting_soon: (data: any) =>
    `⏰ <b>Смена начинается скоро!</b>\n\n${data.shiftTitle}\n📅 Через ${data.minutesUntil} минут\n📍 ${data.location}`,

  worker_checked_in: (data: any) =>
    `✅ <b>Исполнитель на месте</b>\n\n${data.workerName} вышел на объект\n📍 ${data.location}\n🕐 ${data.time}`,

  payment_received: (data: any) =>
    `💰 <b>Оплата получена</b>\n\nВам начислено ${data.amount}₽\nЗа смену: ${data.shiftTitle}`,

  shift_completed: (data: any) =>
    `🎉 <b>Смена завершена</b>\n\n${data.shiftTitle}\n\nОцените работу ${data.ratingFor}`,

  payment_overdue: (data: any) =>
    `⚠️ <b>Платёж просрочен</b>\n\nСмена: ${data.shiftTitle}\nСумма: ${data.amount}₽\nПросрочка: ${data.daysOverdue} дней`,

  new_message: (data: any) =>
    `💬 <b>Новое сообщение</b>\n\nОт: ${data.fromName}\n\n${data.preview}`,
}

/**
 * Send notification via Telegram Bot API
 */
export async function sendTelegramNotification(
  telegramId: number,
  message: string,
  type: NotificationType
): Promise<{ success: boolean; error?: string }> {
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not configured')
    return { success: false, error: 'Bot token not configured' }
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Telegram API error:', result)
      return { success: false, error: result.description || 'Unknown error' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Main notification function with settings check and database logging
 */
export async function notify(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // 1. Get user's telegram_id and notification settings
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('telegram_id')
      .eq('id', payload.userId)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      return { success: false, error: 'User not found' }
    }

    if (!user.telegram_id) {
      console.warn('User has no telegram_id:', payload.userId)
      return { success: false, error: 'No Telegram ID' }
    }

    // 2. Check notification settings
    const { data: settings } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', payload.userId)
      .single()

    // If settings exist, check if this notification type is enabled
    if (settings) {
      const settingKey = NOTIFICATION_TYPE_TO_SETTING[payload.type]
      if (settings[settingKey] === false) {
        console.log('Notification disabled by user:', payload.type)
        return { success: false, error: 'Notification disabled' }
      }
    }

    // 3. Format message using template if data is provided
    let message = `<b>${payload.title}</b>\n\n${payload.body}`
    if (payload.data && notificationTemplates[payload.type]) {
      message = notificationTemplates[payload.type](payload.data)
    }

    // 4. Send via Telegram
    const result = await sendTelegramNotification(user.telegram_id, message, payload.type)

    // 5. Save to notifications table for history
    await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || null,
        is_read: false,
      })

    return result
  } catch (error) {
    console.error('Error in notify function:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Send notification to multiple users
 */
export async function notifyMany(payloads: NotificationPayload[]): Promise<void> {
  await Promise.all(payloads.map(payload => notify(payload)))
}

/**
 * Helper functions for common notification scenarios
 */
export const notificationHelpers = {
  newShift: (userId: string, shift: any) =>
    notify({
      type: 'new_shift',
      userId,
      title: 'Новая смена',
      body: `${shift.category} требуется ${shift.date}`,
      data: {
        category: shift.category,
        date: shift.date,
        location: shift.location_address,
        pay: shift.pay_amount,
      },
    }),

  applicationApproved: (userId: string, shift: any) =>
    notify({
      type: 'application_approved',
      userId,
      title: 'Отклик одобрен',
      body: `Вы назначены на смену ${shift.title}`,
      data: {
        shiftTitle: shift.title,
        date: shift.date,
        time: shift.start_time,
        location: shift.location_address,
      },
    }),

  shiftStartingSoon: (userId: string, shift: any, minutesUntil: number) =>
    notify({
      type: 'shift_starting_soon',
      userId,
      title: 'Смена начинается скоро',
      body: `Через ${minutesUntil} минут начинается смена`,
      data: {
        shiftTitle: shift.title,
        minutesUntil,
        location: shift.location_address,
      },
    }),

  workerCheckedIn: (userId: string, workerName: string, shift: any) =>
    notify({
      type: 'worker_checked_in',
      userId,
      title: 'Исполнитель на месте',
      body: `${workerName} вышел на объект`,
      data: {
        workerName,
        location: shift.location_address,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      },
    }),

  paymentReceived: (userId: string, amount: number, shiftTitle: string) =>
    notify({
      type: 'payment_received',
      userId,
      title: 'Оплата получена',
      body: `Вам начислено ${amount}₽`,
      data: {
        amount: amount.toLocaleString('ru-RU'),
        shiftTitle,
      },
    }),

  shiftCompleted: (userId: string, shift: any, ratingFor: string) =>
    notify({
      type: 'shift_completed',
      userId,
      title: 'Смена завершена',
      body: `Оцените работу ${ratingFor}`,
      data: {
        shiftTitle: shift.title,
        ratingFor,
      },
    }),

  paymentOverdue: (userId: string, shift: any, amount: number, daysOverdue: number) =>
    notify({
      type: 'payment_overdue',
      userId,
      title: 'Платёж просрочен',
      body: `Просрочка по смене ${shift.title}`,
      data: {
        shiftTitle: shift.title,
        amount: amount.toLocaleString('ru-RU'),
        daysOverdue,
      },
    }),

  newMessage: (userId: string, fromName: string, preview: string) =>
    notify({
      type: 'new_message',
      userId,
      title: 'Новое сообщение',
      body: `От ${fromName}`,
      data: {
        fromName,
        preview: preview.slice(0, 100),
      },
    }),
}
