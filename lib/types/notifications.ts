export type NotificationType =
  | 'new_shift'              // Новая смена в вашем районе
  | 'application_approved'   // Ваш отклик одобрен
  | 'shift_starting_soon'    // Смена начинается через 1 час
  | 'worker_checked_in'      // Исполнитель вышел на объект
  | 'payment_received'       // Вам начислено 47,500₽
  | 'shift_completed'        // Смена завершена, оцените работу
  | 'payment_overdue'        // Платёж просрочен
  | 'new_message'            // Новое сообщение

export interface NotificationPayload {
  type: NotificationType
  userId: string // кому отправить
  title: string
  body: string
  data?: Record<string, any> // доп данные
}

export interface NotificationSettings {
  new_shifts: boolean
  application_approved: boolean
  shift_reminders: boolean
  payments: boolean
  messages: boolean
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  new_shifts: true,
  application_approved: true,
  shift_reminders: true,
  payments: true,
  messages: true,
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  new_shift: 'Новые смены в районе',
  application_approved: 'Одобрение откликов',
  shift_starting_soon: 'Напоминания о сменах',
  worker_checked_in: 'Выход исполнителей',
  payment_received: 'Уведомления об оплате',
  shift_completed: 'Завершение смен',
  payment_overdue: 'Просроченные платежи',
  new_message: 'Новые сообщения',
}

// Mapping notification types to settings keys
export const NOTIFICATION_TYPE_TO_SETTING: Record<NotificationType, keyof NotificationSettings> = {
  new_shift: 'new_shifts',
  application_approved: 'application_approved',
  shift_starting_soon: 'shift_reminders',
  worker_checked_in: 'shift_reminders',
  payment_received: 'payments',
  shift_completed: 'shift_reminders',
  payment_overdue: 'payments',
  new_message: 'messages',
}
