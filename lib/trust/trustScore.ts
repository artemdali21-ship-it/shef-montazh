/**
 * Trust Score System
 *
 * Система репутации пользователей для защиты от мошенничества
 */

import { createServerClient } from '@/lib/supabase/server'

export type TrustEventType =
  // Client negative
  | 'unpaid_shift'
  | 'late_payment'
  | 'late_cancellation'
  | 'dispute_lost_client'
  | 'spam_content'
  // Client positive
  | 'paid_on_time'
  | 'completed_shift_client'
  | 'inn_verified'
  // Worker negative
  | 'no_show'
  | 'late_arrival'
  | 'early_leave'
  | 'dispute_lost_worker'
  | 'spam_messages'
  // Worker positive
  | 'completed_shift_worker'
  | 'positive_rating'
  | 'passport_verified'

export type TrustEventSeverity = 'low' | 'medium' | 'high'

export interface TrustEvent {
  id: string
  user_id: string
  event_type: TrustEventType
  severity: TrustEventSeverity
  impact: number
  shift_id?: string
  description?: string
  metadata?: Record<string, any>
  created_at: Date
}

/**
 * Impact values for different event types
 */
export const TRUST_EVENT_IMPACT: Record<TrustEventType, { impact: number; severity: TrustEventSeverity }> = {
  // Client negative
  unpaid_shift: { impact: -30, severity: 'high' },
  late_payment: { impact: -10, severity: 'medium' },
  late_cancellation: { impact: -20, severity: 'medium' }, // Can vary: -10 to -30
  dispute_lost_client: { impact: -20, severity: 'high' },
  spam_content: { impact: -15, severity: 'medium' },

  // Client positive
  paid_on_time: { impact: +5, severity: 'low' },
  completed_shift_client: { impact: +2, severity: 'low' },
  inn_verified: { impact: +20, severity: 'low' },

  // Worker negative
  no_show: { impact: -20, severity: 'high' },
  late_arrival: { impact: -5, severity: 'low' },
  early_leave: { impact: -10, severity: 'medium' },
  dispute_lost_worker: { impact: -15, severity: 'high' },
  spam_messages: { impact: -10, severity: 'medium' },

  // Worker positive
  completed_shift_worker: { impact: +2, severity: 'low' },
  positive_rating: { impact: +5, severity: 'low' },
  passport_verified: { impact: +10, severity: 'low' }
}

/**
 * Создать trust event
 */
export async function createTrustEvent(params: {
  userId: string
  eventType: TrustEventType
  shiftId?: string
  description?: string
  metadata?: Record<string, any>
  customImpact?: number // Переопределить стандартный impact
}): Promise<TrustEvent | null> {
  const supabase = await createServerClient()

  const { impact, severity } = TRUST_EVENT_IMPACT[params.eventType]
  const finalImpact = params.customImpact ?? impact

  const { data, error } = await supabase.rpc('create_trust_event', {
    p_user_id: params.userId,
    p_event_type: params.eventType,
    p_severity: severity,
    p_impact: finalImpact,
    p_shift_id: params.shiftId || null,
    p_description: params.description || null,
    p_metadata: params.metadata || {}
  })

  if (error) {
    console.error('Failed to create trust event:', error)
    return null
  }

  return data
}

/**
 * Получить текущий trust score пользователя
 */
export async function getTrustScore(userId: string): Promise<number> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.rpc('get_trust_score', {
    p_user_id: userId
  })

  if (error) {
    console.error('Failed to get trust score:', error)
    return 100 // Default
  }

  return data ?? 100
}

/**
 * Получить историю trust events пользователя
 */
export async function getTrustEventHistory(
  userId: string,
  limit = 20
): Promise<TrustEvent[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('trust_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to get trust event history:', error)
    return []
  }

  return data || []
}

/**
 * Проверить, заблокирован ли пользователь
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  const supabase = await createServerClient()

  // Получаем роль пользователя
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (!user) return false

  if (user.role === 'worker') {
    const { data } = await supabase
      .from('worker_profiles')
      .select('is_blocked')
      .eq('user_id', userId)
      .single()

    return data?.is_blocked || false
  } else if (user.role === 'client') {
    const { data } = await supabase
      .from('client_profiles')
      .select('is_blocked')
      .eq('user_id', userId)
      .single()

    return data?.is_blocked || false
  }

  return false
}

/**
 * Проверить, подозрительный ли пользователь
 */
export async function isUserSuspicious(userId: string): Promise<boolean> {
  const supabase = await createServerClient()

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (!user) return false

  if (user.role === 'worker') {
    const { data } = await supabase
      .from('worker_profiles')
      .select('is_suspicious')
      .eq('user_id', userId)
      .single()

    return data?.is_suspicious || false
  } else if (user.role === 'client') {
    const { data } = await supabase
      .from('client_profiles')
      .select('is_suspicious')
      .eq('user_id', userId)
      .single()

    return data?.is_suspicious || false
  }

  return false
}

/**
 * Получить список подозрительных пользователей (для админки)
 */
export async function getSuspiciousUsers(): Promise<Array<{
  id: string
  email: string
  phone: string
  role: string
  trust_score: number
  is_suspicious: boolean
  negative_events_last_week: number
}>> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('suspicious_users')
    .select('*')
    .order('negative_events_last_week', { ascending: false })

  if (error) {
    console.error('Failed to get suspicious users:', error)
    return []
  }

  return data || []
}

/**
 * Сбросить suspicious флаг (после проверки админом)
 */
export async function clearSuspiciousFlag(userId: string): Promise<boolean> {
  const supabase = await createServerClient()

  const { error } = await supabase.rpc('clear_suspicious_flag', {
    p_user_id: userId
  })

  if (error) {
    console.error('Failed to clear suspicious flag:', error)
    return false
  }

  return true
}

/**
 * Разблокировать пользователя
 */
export async function unblockUser(userId: string): Promise<boolean> {
  const supabase = await createServerClient()

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (!user) return false

  let error

  if (user.role === 'worker') {
    const result = await supabase
      .from('worker_profiles')
      .update({ is_blocked: false })
      .eq('user_id', userId)
    error = result.error
  } else if (user.role === 'client') {
    const result = await supabase
      .from('client_profiles')
      .update({ is_blocked: false })
      .eq('user_id', userId)
    error = result.error
  }

  if (error) {
    console.error('Failed to unblock user:', error)
    return false
  }

  return true
}

/**
 * Trust Score Categories
 */
export function getTrustScoreCategory(score: number): {
  level: 'excellent' | 'good' | 'warning' | 'critical'
  label: string
  description: string
  color: string
} {
  if (score >= 80) {
    return {
      level: 'excellent',
      label: 'Отличная репутация',
      description: 'Полный доступ ко всем функциям',
      color: 'green'
    }
  } else if (score >= 50) {
    return {
      level: 'good',
      label: 'Хорошая репутация',
      description: 'Некоторые ограничения могут применяться',
      color: 'blue'
    }
  } else if (score >= 30) {
    return {
      level: 'warning',
      label: 'Низкая репутация',
      description: 'Строгие ограничения, модерация действий',
      color: 'orange'
    }
  } else {
    return {
      level: 'critical',
      label: 'Критически низкая',
      description: 'Аккаунт заблокирован',
      color: 'red'
    }
  }
}

/**
 * Проверить, может ли пользователь выполнить действие на основе trust score
 */
export async function canPerformAction(
  userId: string,
  action: 'post_shift' | 'apply_to_shift' | 'send_message' | 'request_payout'
): Promise<{ allowed: boolean; reason?: string }> {
  const score = await getTrustScore(userId)
  const blocked = await isUserBlocked(userId)

  if (blocked) {
    return {
      allowed: false,
      reason: 'Ваш аккаунт заблокирован. Свяжитесь с поддержкой.'
    }
  }

  switch (action) {
    case 'post_shift':
      if (score < 50) {
        return {
          allowed: false,
          reason: 'Низкая репутация. Для публикации смен требуется trust score >50.'
        }
      }
      break

    case 'apply_to_shift':
      if (score < 30) {
        return {
          allowed: false,
          reason: 'Низкая репутация. Для откликов требуется trust score >30.'
        }
      }
      break

    case 'send_message':
      if (score < 40) {
        return {
          allowed: false,
          reason: 'Низкая репутация. Отправка сообщений ограничена.'
        }
      }
      break

    case 'request_payout':
      if (score < 30) {
        return {
          allowed: false,
          reason: 'Низкая репутация. Выплаты временно приостановлены.'
        }
      }
      break
  }

  return { allowed: true }
}

/**
 * Получить рекомендации по улучшению trust score
 */
export function getTrustScoreRecommendations(score: number, role: 'worker' | 'client'): string[] {
  const recommendations: string[] = []

  if (score < 80) {
    if (role === 'client') {
      recommendations.push('Оплачивайте смены вовремя (в течение 24 часов)')
      recommendations.push('Избегайте поздних отмен смен')
      recommendations.push('Подтвердите ИНН компании для +20 баллов')
    } else {
      recommendations.push('Приходите на смены вовремя')
      recommendations.push('Завершайте смены полностью')
      recommendations.push('Получайте высокие оценки от заказчиков')
      recommendations.push('Подтвердите паспорт для +10 баллов')
    }
  }

  if (score < 50) {
    recommendations.push('⚠️ Свяжитесь с поддержкой для восстановления репутации')
  }

  return recommendations
}
