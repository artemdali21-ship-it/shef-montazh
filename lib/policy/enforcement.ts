/**
 * Policy Enforcement Engine
 *
 * Единая система санкций и ограничений.
 * ВСЕ действия платформы (блокировка, trust_score, лимиты) проходят через эту систему.
 *
 * Проблема без Policy Engine:
 * - Санкции разбросаны по коду (где-то -20, где-то -30)
 * - Забыли заблокировать в одном месте
 * - Непонятно кто и за что наказан
 *
 * Решение:
 * - Одна функция applyPolicy(event)
 * - Все правила в одном месте
 * - Аудит всех действий
 */

import { createTrustEvent } from '@/lib/trust/trustScore'
import { createServerClient } from '@/lib/supabase/server'

export type PolicyViolation =
  // Client violations
  | 'unpaid_shift'           // Не оплатил смену >24h
  | 'late_payment'           // Опоздал с оплатой 24-48h
  | 'late_cancellation_high' // Отменил <2h
  | 'late_cancellation_med'  // Отменил 2-12h
  | 'late_cancellation_low'  // Отменил 12-24h
  | 'dispute_lost'           // Проиграл спор
  | 'spam_content'           // Спам в описании
  | 'fake_company'           // Фейковый ИНН
  // Worker violations
  | 'no_show'                // Не пришел на смену
  | 'late_arrival'           // Опоздал >30 мин
  | 'early_leave'            // Ушел раньше
  | 'spam_messages'          // Спам в чате
  | 'fake_documents'         // Поддельные документы

export type PolicyAction =
  | 'block'                  // Полная блокировка
  | 'limit'                  // Ограничение действий
  | 'require_prepayment'     // Обязательная предоплата
  | 'manual_review'          // Модерация всех действий
  | 'warning'                // Предупреждение (без санкций)

export interface PolicyEffect {
  action: PolicyAction
  duration?: number          // Длительность (ms) или permanent
  reason: string
  metadata?: Record<string, any>
}

export interface PolicyResult {
  violation: PolicyViolation
  trustScoreImpact: number
  effects: PolicyEffect[]
  applied: boolean
  error?: string
}

/**
 * Правила санкций (единый контракт)
 */
const POLICY_RULES: Record<PolicyViolation, {
  trustScoreImpact: number
  effects: PolicyEffect[]
  description: string
}> = {
  // ===== CLIENT VIOLATIONS =====
  unpaid_shift: {
    trustScoreImpact: -30,
    effects: [
      {
        action: 'block',
        reason: 'Неоплата смены',
        duration: undefined // permanent until debt paid
      },
      {
        action: 'require_prepayment',
        reason: 'Все будущие смены требуют предоплаты'
      }
    ],
    description: 'Client не оплатил смену в течение 24 часов'
  },

  late_payment: {
    trustScoreImpact: -10,
    effects: [
      {
        action: 'warning',
        reason: 'Опоздание с оплатой'
      }
    ],
    description: 'Client оплатил с опозданием (24-48h)'
  },

  late_cancellation_high: {
    trustScoreImpact: -30,
    effects: [
      {
        action: 'limit',
        duration: 7 * 24 * 60 * 60 * 1000, // 7 дней
        reason: 'Нельзя создавать смены 7 дней'
      },
      {
        action: 'require_prepayment',
        reason: 'Обязательная предоплата на 30 дней',
        duration: 30 * 24 * 60 * 60 * 1000
      }
    ],
    description: 'Client отменил смену <2 часов до начала'
  },

  late_cancellation_med: {
    trustScoreImpact: -20,
    effects: [
      {
        action: 'warning',
        reason: 'Поздняя отмена смены'
      }
    ],
    description: 'Client отменил смену 2-12 часов до начала'
  },

  late_cancellation_low: {
    trustScoreImpact: -10,
    effects: [
      {
        action: 'warning',
        reason: 'Отмена смены менее чем за 24 часа'
      }
    ],
    description: 'Client отменил смену 12-24 часа до начала'
  },

  dispute_lost: {
    trustScoreImpact: -20,
    effects: [
      {
        action: 'manual_review',
        duration: 30 * 24 * 60 * 60 * 1000, // 30 дней
        reason: 'Все смены проходят модерацию 30 дней'
      }
    ],
    description: 'Client проиграл спор (администратор решил в пользу worker)'
  },

  spam_content: {
    trustScoreImpact: -15,
    effects: [
      {
        action: 'manual_review',
        duration: 14 * 24 * 60 * 60 * 1000, // 14 дней
        reason: 'Модерация описаний смен 14 дней'
      }
    ],
    description: 'Обнаружен спам в описании смены (телефон, ссылки)'
  },

  fake_company: {
    trustScoreImpact: -50,
    effects: [
      {
        action: 'block',
        reason: 'Фейковый ИНН компании'
      }
    ],
    description: 'Указан несуществующий или чужой ИНН'
  },

  // ===== WORKER VIOLATIONS =====
  no_show: {
    trustScoreImpact: -20,
    effects: [
      {
        action: 'limit',
        duration: 7 * 24 * 60 * 60 * 1000, // 7 дней
        reason: 'Нельзя откликаться на смены 7 дней'
      }
    ],
    description: 'Worker не пришел на смену (no check-in)'
  },

  late_arrival: {
    trustScoreImpact: -5,
    effects: [
      {
        action: 'warning',
        reason: 'Опоздание на смену'
      }
    ],
    description: 'Worker опоздал >30 минут'
  },

  early_leave: {
    trustScoreImpact: -10,
    effects: [
      {
        action: 'warning',
        reason: 'Ранний уход со смены'
      }
    ],
    description: 'Worker ушел раньше без согласования'
  },

  spam_messages: {
    trustScoreImpact: -10,
    effects: [
      {
        action: 'limit',
        duration: 3 * 24 * 60 * 60 * 1000, // 3 дня
        reason: 'Ограничение на отправку сообщений 3 дня'
      }
    ],
    description: 'Спам в чате (телефоны, ссылки, дубликаты)'
  },

  fake_documents: {
    trustScoreImpact: -50,
    effects: [
      {
        action: 'block',
        reason: 'Поддельные документы'
      }
    ],
    description: 'Загружены поддельные или чужие документы'
  }
}

/**
 * Применить санкцию за нарушение
 */
export async function applyPolicy(params: {
  userId: string
  violation: PolicyViolation
  shiftId?: string
  metadata?: Record<string, any>
}): Promise<PolicyResult> {
  const { userId, violation, shiftId, metadata } = params

  const rule = POLICY_RULES[violation]
  if (!rule) {
    return {
      violation,
      trustScoreImpact: 0,
      effects: [],
      applied: false,
      error: 'Unknown violation type'
    }
  }

  const supabase = await createServerClient()

  try {
    // 1. Создать trust event (обновит trust_score автоматически)
    await createTrustEvent({
      userId,
      eventType: violation as any, // Нужно добавить в TrustEventType
      shiftId,
      description: rule.description,
      metadata: {
        ...metadata,
        policy_applied: true,
        effects: rule.effects.map(e => e.action)
      },
      customImpact: rule.trustScoreImpact
    })

    // 2. Применить эффекты
    for (const effect of rule.effects) {
      await applyEffect(userId, effect, violation)
    }

    // 3. Логировать применение политики
    await logPolicyEnforcement({
      user_id: userId,
      violation,
      trust_score_impact: rule.trustScoreImpact,
      effects: rule.effects,
      shift_id: shiftId,
      metadata
    })

    // 4. Уведомить пользователя
    await notifyUserAboutPolicy(userId, violation, rule)

    // 5. Уведомить админа (для серьезных нарушений)
    if (Math.abs(rule.trustScoreImpact) >= 20) {
      await notifyAdminAboutViolation(userId, violation, rule)
    }

    return {
      violation,
      trustScoreImpact: rule.trustScoreImpact,
      effects: rule.effects,
      applied: true
    }
  } catch (error) {
    console.error('Failed to apply policy:', error)
    return {
      violation,
      trustScoreImpact: 0,
      effects: [],
      applied: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Применить конкретный эффект
 */
async function applyEffect(
  userId: string,
  effect: PolicyEffect,
  violation: PolicyViolation
): Promise<void> {
  const supabase = await createServerClient()

  // Определяем роль пользователя
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (!user) return

  const profileTable = user.role === 'worker' ? 'worker_profiles' : 'client_profiles'
  const expiresAt = effect.duration ? new Date(Date.now() + effect.duration) : null

  switch (effect.action) {
    case 'block':
      // Полная блокировка
      await supabase
        .from(profileTable)
        .update({
          is_blocked: true,
          blocked_reason: effect.reason,
          blocked_at: new Date().toISOString(),
          blocked_until: expiresAt?.toISOString()
        })
        .eq('user_id', userId)
      break

    case 'limit':
      // Ограничение действий (сохраняем в metadata)
      await supabase
        .from(profileTable)
        .update({
          restrictions: {
            type: 'limit',
            reason: effect.reason,
            expires_at: expiresAt?.toISOString(),
            violation
          }
        })
        .eq('user_id', userId)
      break

    case 'require_prepayment':
      // Обязательная предоплата
      await supabase
        .from(profileTable)
        .update({
          requires_prepayment: true,
          prepayment_reason: effect.reason,
          prepayment_until: expiresAt?.toISOString()
        })
        .eq('user_id', userId)
      break

    case 'manual_review':
      // Модерация всех действий
      await supabase
        .from(profileTable)
        .update({
          requires_manual_review: true,
          manual_review_reason: effect.reason,
          manual_review_until: expiresAt?.toISOString()
        })
        .eq('user_id', userId)
      break

    case 'warning':
      // Просто записываем предупреждение (trust event уже создан)
      break
  }
}

/**
 * Логировать применение политики
 */
async function logPolicyEnforcement(params: {
  user_id: string
  violation: PolicyViolation
  trust_score_impact: number
  effects: PolicyEffect[]
  shift_id?: string
  metadata?: Record<string, any>
}): Promise<void> {
  const supabase = await createServerClient()

  await supabase.from('policy_enforcement_log').insert({
    user_id: params.user_id,
    violation: params.violation,
    trust_score_impact: params.trust_score_impact,
    effects: params.effects,
    shift_id: params.shift_id,
    metadata: params.metadata,
    created_at: new Date().toISOString()
  })
}

/**
 * Уведомить пользователя о санкции
 */
async function notifyUserAboutPolicy(
  userId: string,
  violation: PolicyViolation,
  rule: typeof POLICY_RULES[PolicyViolation]
): Promise<void> {
  const supabase = await createServerClient()

  const message = formatPolicyMessage(violation, rule)

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'policy_violation',
    title: 'Нарушение правил платформы',
    body: message,
    action_url: '/profile/violations',
    created_at: new Date().toISOString()
  })

  // TODO: Send Telegram notification
}

/**
 * Уведомить админа о серьезном нарушении
 */
async function notifyAdminAboutViolation(
  userId: string,
  violation: PolicyViolation,
  rule: typeof POLICY_RULES[PolicyViolation]
): Promise<void> {
  // TODO: Send to admin Telegram bot
  console.log(`[ADMIN ALERT] User ${userId} violated: ${violation}`)
}

/**
 * Форматировать сообщение о санкции
 */
function formatPolicyMessage(
  violation: PolicyViolation,
  rule: typeof POLICY_RULES[PolicyViolation]
): string {
  const effectsText = rule.effects
    .map(e => {
      switch (e.action) {
        case 'block':
          return '⛔ Ваш аккаунт заблокирован'
        case 'limit':
          return `⚠️ Ограничение действий на ${formatDuration(e.duration)}`
        case 'require_prepayment':
          return `💳 Обязательная предоплата на ${formatDuration(e.duration)}`
        case 'manual_review':
          return `👀 Модерация всех действий на ${formatDuration(e.duration)}`
        case 'warning':
          return '⚠️ Предупреждение'
        default:
          return ''
      }
    })
    .join('\n')

  return `
${rule.description}

Последствия:
${effectsText}

Trust Score: ${rule.trustScoreImpact > 0 ? '+' : ''}${rule.trustScoreImpact}

Как избежать санкций: см. Правила платформы
`.trim()
}

/**
 * Форматировать длительность
 */
function formatDuration(ms?: number): string {
  if (!ms) return 'постоянно'

  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  if (days > 0) return `${days} дн.`

  const hours = Math.floor(ms / (60 * 60 * 1000))
  return `${hours} ч.`
}

/**
 * Проверить, истек ли срок санкции
 */
export async function checkExpiredPolicies(): Promise<void> {
  const supabase = await createServerClient()

  const now = new Date().toISOString()

  // Разблокировать пользователей с истекшими блокировками
  await supabase
    .from('worker_profiles')
    .update({
      is_blocked: false,
      blocked_reason: null,
      blocked_until: null
    })
    .lte('blocked_until', now)
    .eq('is_blocked', true)

  await supabase
    .from('client_profiles')
    .update({
      is_blocked: false,
      blocked_reason: null,
      blocked_until: null
    })
    .lte('blocked_until', now)
    .eq('is_blocked', true)

  // Снять ограничения
  // TODO: Обнулить restrictions, requires_prepayment, requires_manual_review
}

/**
 * Получить активные санкции пользователя
 */
export async function getActivePolicies(userId: string): Promise<{
  blocked: boolean
  restrictions: any
  requiresPrepayment: boolean
  requiresManualReview: boolean
}> {
  const supabase = await createServerClient()

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (!user) {
    return {
      blocked: false,
      restrictions: null,
      requiresPrepayment: false,
      requiresManualReview: false
    }
  }

  const profileTable = user.role === 'worker' ? 'worker_profiles' : 'client_profiles'

  const { data: profile } = await supabase
    .from(profileTable)
    .select('is_blocked, restrictions, requires_prepayment, requires_manual_review')
    .eq('user_id', userId)
    .single()

  return {
    blocked: profile?.is_blocked || false,
    restrictions: profile?.restrictions || null,
    requiresPrepayment: profile?.requires_prepayment || false,
    requiresManualReview: profile?.requires_manual_review || false
  }
}
