/**
 * API Guards Middleware
 *
 * Единая система проверки разрешений на действия.
 * RLS покрывает "кто видит данные", но не "кто может инициировать действие".
 *
 * Проблема без API Guards:
 * - Проверки разбросаны по коду
 * - Где-то проверили trust_score, где-то забыли
 * - Нет единого места для правил
 *
 * Решение:
 * - Middleware на каждый endpoint
 * - canPerformAction() проверяет ВСЁ
 * - Блокировки, лимиты, trust_score в одном месте
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getTrustScore, isUserBlocked } from '@/lib/trust/trustScore'
import { getActivePolicies } from '@/lib/policy/enforcement'

export type Action =
  // Client actions
  | 'create_shift'
  | 'edit_shift'
  | 'cancel_shift'
  | 'accept_application'
  | 'rate_worker'
  // Worker actions
  | 'apply_to_shift'
  | 'check_in'
  | 'check_out'
  | 'rate_client'
  // Common actions
  | 'send_message'
  | 'create_dispute'
  | 'submit_evidence'
  | 'request_payout'

export interface ActionContext {
  userId: string
  action: Action
  resourceId?: string // shift_id, application_id, etc
  metadata?: Record<string, any>
}

export interface ActionResult {
  allowed: boolean
  reason?: string
  blockedBy?: 'user_blocked' | 'trust_score' | 'policy' | 'resource_state' | 'rate_limit'
  metadata?: Record<string, any>
}

/**
 * Главная функция проверки разрешений
 */
export async function canPerformAction(context: ActionContext): Promise<ActionResult> {
  const { userId, action, resourceId, metadata } = context
  const supabase = await createServerClient()

  // 0. Проверка demo пользователя (read-only)
  const { data: user } = await supabase
    .from('users')
    .select('is_demo')
    .eq('id', userId)
    .single()

  if (user?.is_demo) {
    return {
      allowed: false,
      reason: 'Это демо-режим. Зарегистрируйтесь чтобы создавать смены и откликаться.',
      blockedBy: 'user_blocked'
    }
  }

  // 1. Проверка блокировки пользователя
  const blocked = await isUserBlocked(userId)
  if (blocked) {
    return {
      allowed: false,
      reason: 'Ваш аккаунт заблокирован. Свяжитесь с поддержкой.',
      blockedBy: 'user_blocked'
    }
  }

  // 2. Проверка активных политик (ограничения)
  const policies = await getActivePolicies(userId)

  if (policies.restrictions) {
    const restriction = policies.restrictions
    if (isActionRestricted(action, restriction)) {
      return {
        allowed: false,
        reason: `Действие ограничено: ${restriction.reason}`,
        blockedBy: 'policy',
        metadata: { expires_at: restriction.expires_at }
      }
    }
  }

  // 3. Проверка Trust Score
  const trustScore = await getTrustScore(userId)
  const minTrustScore = getMinTrustScoreForAction(action)

  if (trustScore < minTrustScore) {
    return {
      allowed: false,
      reason: `Недостаточный trust score. Требуется: ${minTrustScore}, у вас: ${trustScore}`,
      blockedBy: 'trust_score',
      metadata: { current: trustScore, required: minTrustScore }
    }
  }

  // 4. Проверка специфичных правил для действия
  const actionCheck = await checkActionSpecificRules(context)
  if (!actionCheck.allowed) {
    return actionCheck
  }

  // 5. Проверка rate limit
  const rateLimitCheck = await checkRateLimit(userId, action)
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck
  }

  // Все проверки пройдены
  return { allowed: true }
}

/**
 * Проверить, ограничено ли действие политиками
 */
function isActionRestricted(action: Action, restriction: any): boolean {
  const actionRestrictions: Record<Action, string[]> = {
    // Client restrictions
    create_shift: ['limit', 'manual_review'],
    edit_shift: ['manual_review'],
    cancel_shift: ['manual_review'],
    accept_application: ['manual_review'],
    rate_worker: [],
    // Worker restrictions
    apply_to_shift: ['limit'],
    check_in: [],
    check_out: [],
    rate_client: [],
    // Common
    send_message: ['limit'],
    create_dispute: [],
    submit_evidence: [],
    request_payout: ['limit']
  }

  const relevantRestrictions = actionRestrictions[action] || []
  return relevantRestrictions.includes(restriction.type)
}

/**
 * Минимальный trust score для действия
 */
function getMinTrustScoreForAction(action: Action): number {
  const minScores: Record<Action, number> = {
    // Client actions
    create_shift: 50,           // Создать смену
    edit_shift: 40,
    cancel_shift: 40,
    accept_application: 50,
    rate_worker: 30,
    // Worker actions
    apply_to_shift: 30,         // Откликнуться
    check_in: 30,
    check_out: 30,
    rate_client: 30,
    // Common
    send_message: 40,           // Отправить сообщение
    create_dispute: 30,
    submit_evidence: 20,
    request_payout: 30
  }

  return minScores[action] || 50
}

/**
 * Проверка специфичных правил для действия
 */
async function checkActionSpecificRules(context: ActionContext): Promise<ActionResult> {
  const { userId, action, resourceId } = context
  const supabase = await createServerClient()

  switch (action) {
    case 'create_shift': {
      // Client может создать смену только если:
      // 1. Phone verified
      // 2. Нет неоплаченных долгов
      // 3. Не превышен лимит активных смен

      const { data: client } = await supabase
        .from('client_profiles')
        .select('phone_verified, unpaid_debts, completed_shifts')
        .eq('user_id', userId)
        .single()

      if (!client?.phone_verified) {
        return {
          allowed: false,
          reason: 'Подтвердите телефон перед созданием смен',
          blockedBy: 'resource_state'
        }
      }

      if (client.unpaid_debts > 0) {
        return {
          allowed: false,
          reason: 'У вас есть неоплаченные долги. Погасите их перед созданием новых смен.',
          blockedBy: 'resource_state'
        }
      }

      // Новые clients (< 3 смен) могут создать макс 3 активных смены
      if (client.completed_shifts < 3) {
        const { count } = await supabase
          .from('shifts')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', userId)
          .in('status', ['draft', 'open', 'in_progress'])

        if (count && count >= 3) {
          return {
            allowed: false,
            reason: 'Новые клиенты могут иметь максимум 3 активные смены одновременно',
            blockedBy: 'rate_limit'
          }
        }
      }

      return { allowed: true }
    }

    case 'apply_to_shift': {
      // Worker может откликнуться только если:
      // 1. Passport verified
      // 2. Phone verified
      // 3. Смена еще открыта
      // 4. Еще не откликался на эту смену

      const { data: worker } = await supabase
        .from('worker_profiles')
        .select('verification_status, phone_verified')
        .eq('user_id', userId)
        .single()

      if (!worker?.phone_verified) {
        return {
          allowed: false,
          reason: 'Подтвердите телефон перед откликами на смены',
          blockedBy: 'resource_state'
        }
      }

      if (worker.verification_status !== 'verified') {
        return {
          allowed: false,
          reason: 'Завершите верификацию документов перед откликами',
          blockedBy: 'resource_state'
        }
      }

      // Проверка статуса смены
      const { data: shift } = await supabase
        .from('shifts')
        .select('status, start_time')
        .eq('id', resourceId)
        .single()

      if (shift?.status !== 'open') {
        return {
          allowed: false,
          reason: 'Смена больше не принимает отклики',
          blockedBy: 'resource_state'
        }
      }

      // Проверка что смена начинается через >2 часа
      const hoursUntilStart = (new Date(shift.start_time).getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursUntilStart < 2) {
        return {
          allowed: false,
          reason: 'Нельзя откликаться на смены которые начинаются менее чем через 2 часа',
          blockedBy: 'resource_state'
        }
      }

      // Проверка дубликата
      const { count } = await supabase
        .from('shift_applications')
        .select('id', { count: 'exact', head: true })
        .eq('shift_id', resourceId)
        .eq('worker_id', userId)

      if (count && count > 0) {
        return {
          allowed: false,
          reason: 'Вы уже откликнулись на эту смену',
          blockedBy: 'resource_state'
        }
      }

      return { allowed: true }
    }

    case 'cancel_shift': {
      // Client может отменить смену только если:
      // 1. Он владелец
      // 2. До начала >2 часа
      // 3. Нет check-ins

      const { data: shift } = await supabase
        .from('shifts')
        .select(`
          client_id,
          start_time,
          status,
          shift_assignments(check_in_time)
        `)
        .eq('id', resourceId)
        .single()

      if (shift?.client_id !== userId) {
        return {
          allowed: false,
          reason: 'Вы не можете отменить чужую смену',
          blockedBy: 'resource_state'
        }
      }

      const hoursUntilStart = (new Date(shift.start_time).getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursUntilStart < 2) {
        return {
          allowed: false,
          reason: 'Нельзя отменить смену менее чем за 2 часа до начала. Свяжитесь с поддержкой.',
          blockedBy: 'resource_state'
        }
      }

      const hasCheckIns = shift.shift_assignments?.some((a: any) => a.check_in_time)
      if (hasCheckIns) {
        return {
          allowed: false,
          reason: 'Нельзя отменить смену после того как workers отметились',
          blockedBy: 'resource_state'
        }
      }

      return { allowed: true }
    }

    case 'send_message': {
      // User может отправить сообщение только если:
      // 1. Он участник смены (client или assigned worker)
      // 2. Смена активна (не cancelled)

      const { data: shift } = await supabase
        .from('shifts')
        .select(`
          client_id,
          status,
          shift_assignments!inner(worker_id)
        `)
        .eq('id', resourceId)
        .single()

      if (!shift) {
        return {
          allowed: false,
          reason: 'Смена не найдена',
          blockedBy: 'resource_state'
        }
      }

      const isClient = shift.client_id === userId
      const isWorker = shift.shift_assignments?.some((a: any) => a.worker_id === userId)

      if (!isClient && !isWorker) {
        return {
          allowed: false,
          reason: 'Вы не участник этой смены',
          blockedBy: 'resource_state'
        }
      }

      if (shift.status === 'cancelled') {
        return {
          allowed: false,
          reason: 'Нельзя отправлять сообщения в отмененную смену',
          blockedBy: 'resource_state'
        }
      }

      return { allowed: true }
    }

    default:
      // Для остальных действий используем только базовые проверки
      return { allowed: true }
  }
}

/**
 * Проверка rate limit
 */
async function checkRateLimit(userId: string, action: Action): Promise<ActionResult> {
  const supabase = await createServerClient()

  // Rate limits по действиям
  const rateLimits: Record<Action, { window: number; maxCount: number }> = {
    // Client
    create_shift: { window: 24 * 60 * 60 * 1000, maxCount: 10 }, // 10 смен за 24ч
    edit_shift: { window: 60 * 60 * 1000, maxCount: 5 },         // 5 правок за час
    cancel_shift: { window: 24 * 60 * 60 * 1000, maxCount: 3 },  // 3 отмены за 24ч
    accept_application: { window: 60 * 60 * 1000, maxCount: 20 }, // 20 одобрений за час
    rate_worker: { window: 60 * 60 * 1000, maxCount: 10 },
    // Worker
    apply_to_shift: { window: 24 * 60 * 60 * 1000, maxCount: 20 }, // 20 откликов за 24ч (новый worker)
    check_in: { window: 60 * 60 * 1000, maxCount: 5 },
    check_out: { window: 60 * 60 * 1000, maxCount: 5 },
    rate_client: { window: 60 * 60 * 1000, maxCount: 10 },
    // Common
    send_message: { window: 60 * 60 * 1000, maxCount: 50 },      // 50 сообщений за час
    create_dispute: { window: 24 * 60 * 60 * 1000, maxCount: 3 },
    submit_evidence: { window: 60 * 60 * 1000, maxCount: 10 },
    request_payout: { window: 24 * 60 * 60 * 1000, maxCount: 5 }
  }

  const limit = rateLimits[action]
  if (!limit) return { allowed: true }

  // Для experienced пользователей (>10 завершенных смен) - лимиты выше
  const { data: profile } = await supabase
    .from('worker_profiles')
    .select('completed_shifts')
    .eq('user_id', userId)
    .single()

  let adjustedMaxCount = limit.maxCount
  if (profile && profile.completed_shifts > 10) {
    adjustedMaxCount = limit.maxCount * 2 // Удвоенный лимит для опытных
  }

  // Проверяем количество действий в окне
  const windowStart = new Date(Date.now() - limit.window).toISOString()

  // Используем таблицу audit_log (нужно создать)
  const { count } = await supabase
    .from('action_audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', windowStart)

  if (count && count >= adjustedMaxCount) {
    const windowHours = limit.window / (60 * 60 * 1000)
    return {
      allowed: false,
      reason: `Превышен лимит: ${adjustedMaxCount} ${action} за ${windowHours} ч. Попробуйте позже.`,
      blockedBy: 'rate_limit',
      metadata: { count, maxCount: adjustedMaxCount, windowHours }
    }
  }

  return { allowed: true }
}

/**
 * Middleware для Next.js API routes
 */
export function withActionGuard(action: Action) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest, userId: string) => Promise<Response>
  ): Promise<Response> => {
    const supabase = await createServerClient()

    // Получаем userId из auth
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Извлекаем resourceId из URL или body
    const resourceId = extractResourceId(req, action)

    // Проверяем разрешение
    const result = await canPerformAction({
      userId: user.id,
      action,
      resourceId
    })

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: result.reason,
          blocked_by: result.blockedBy,
          metadata: result.metadata
        },
        { status: 403 }
      )
    }

    // Логируем действие
    await logAction(user.id, action, resourceId)

    // Выполняем handler
    return handler(req, user.id)
  }
}

/**
 * Извлечь resourceId из request
 */
function extractResourceId(req: NextRequest, action: Action): string | undefined {
  const url = new URL(req.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)

  // Для большинства действий resourceId = последний сегмент URL
  // Например: /api/shifts/[id]/apply → [id]
  return pathSegments[pathSegments.length - 2] || undefined
}

/**
 * Логировать действие в audit log
 */
async function logAction(userId: string, action: Action, resourceId?: string): Promise<void> {
  const supabase = await createServerClient()

  await supabase.from('action_audit_log').insert({
    user_id: userId,
    action,
    resource_id: resourceId,
    created_at: new Date().toISOString()
  })
}

/**
 * Использование в API routes
 *
 * Example:
 *
 * // app/api/shifts/[id]/apply/route.ts
 * export const POST = withActionGuard('apply_to_shift')(
 *   async (req, userId) => {
 *     const shiftId = extractShiftId(req)
 *
 *     // Здесь уже гарантируется что:
 *     // - User не заблокирован
 *     // - Trust score достаточен
 *     // - Смена открыта
 *     // - Не превышен rate limit
 *
 *     await createApplication(shiftId, userId)
 *
 *     return Response.json({ success: true })
 *   }
 * )
 */
