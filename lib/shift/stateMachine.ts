/**
 * Shift State Machine
 *
 * Определяет все возможные состояния смены и правила переходов между ними.
 * Это "контракт" системы - любые изменения статуса должны проходить через эту машину.
 */

export type ShiftStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export type TransitionContext = {
  actorId: string
  actorRole: 'client' | 'worker' | 'admin' | 'system'
  shift: {
    id: string
    status: ShiftStatus
    client_id: string
    start_time: Date
    assigned_workers: Array<{ id: string; checked_in: boolean }>
    total_amount: number
  }
  reason?: string
}

export type TransitionResult = {
  success: boolean
  newStatus?: ShiftStatus
  effects?: TransitionEffect[]
  error?: string
}

export type TransitionEffect =
  | { type: 'refund_payment'; amount: number; reason: string }
  | { type: 'hold_payment' }
  | { type: 'release_payment' }
  | { type: 'freeze_payment' }
  | { type: 'notify_users'; userIds: string[]; message: string }
  | { type: 'create_trust_event'; userId: string; eventType: string; severity: string }
  | { type: 'update_statistics'; userId: string; field: string; delta: number }
  | { type: 'lock_applications' }
  | { type: 'request_ratings' }

/**
 * Проверяет, возможен ли переход из текущего статуса в новый
 */
export function canTransition(
  from: ShiftStatus,
  to: ShiftStatus,
  context: TransitionContext
): boolean {
  const transitions = TRANSITION_RULES[from]
  if (!transitions || !transitions[to]) {
    return false
  }

  const rule = transitions[to]
  return rule.condition(context)
}

/**
 * Выполняет переход между статусами
 */
export function transition(
  to: ShiftStatus,
  context: TransitionContext
): TransitionResult {
  const from = context.shift.status

  if (!canTransition(from, to, context)) {
    return {
      success: false,
      error: `Transition from ${from} to ${to} is not allowed`
    }
  }

  const rule = TRANSITION_RULES[from]![to]!
  const effects = rule.effects(context)

  return {
    success: true,
    newStatus: to,
    effects
  }
}

/**
 * Правила переходов между статусами
 */
const TRANSITION_RULES: Record<
  ShiftStatus,
  Partial<Record<
    ShiftStatus,
    {
      condition: (ctx: TransitionContext) => boolean
      effects: (ctx: TransitionContext) => TransitionEffect[]
    }
  >>
> = {
  // DRAFT
  draft: {
    open: {
      condition: (ctx) => {
        // Только владелец (client) может опубликовать
        return (
          ctx.actorRole === 'client' &&
          ctx.actorId === ctx.shift.client_id &&
          // Смена должна начинаться минимум через 2 часа
          ctx.shift.start_time.getTime() > Date.now() + 2 * 60 * 60 * 1000
        )
      },
      effects: (ctx) => [
        { type: 'hold_payment' },
        {
          type: 'notify_users',
          userIds: [], // TODO: matched workers
          message: 'New shift available'
        }
      ]
    },
    cancelled: {
      condition: (ctx) => {
        // Владелец может отменить черновик без ограничений
        return ctx.actorRole === 'client' && ctx.actorId === ctx.shift.client_id
      },
      effects: () => []
    }
  },

  // OPEN
  open: {
    in_progress: {
      condition: (ctx) => {
        // Автоматический переход когда хотя бы 1 worker checked in
        return (
          ctx.actorRole === 'system' &&
          ctx.shift.assigned_workers.some(w => w.checked_in)
        )
      },
      effects: (ctx) => [
        { type: 'lock_applications' },
        {
          type: 'notify_users',
          userIds: [ctx.shift.client_id],
          message: 'Shift has started'
        }
      ]
    },
    cancelled: {
      condition: (ctx) => {
        const hoursUntilStart = (ctx.shift.start_time.getTime() - Date.now()) / (1000 * 60 * 60)

        // Админ может отменить всегда
        if (ctx.actorRole === 'admin') {
          return true
        }

        // Client может отменить только если:
        // 1. Он владелец
        // 2. До начала больше 2 часов
        // 3. Нет check-ins
        return (
          ctx.actorRole === 'client' &&
          ctx.actorId === ctx.shift.client_id &&
          hoursUntilStart >= 2 &&
          ctx.shift.assigned_workers.every(w => !w.checked_in)
        )
      },
      effects: (ctx) => {
        const hoursUntilStart = (ctx.shift.start_time.getTime() - Date.now()) / (1000 * 60 * 60)
        const effects: TransitionEffect[] = []

        // Рассчитываем возврат по политике отмен
        let refundPercent = 1.0
        let createTrustEvent = false

        if (hoursUntilStart < 2) {
          refundPercent = 0.5
          createTrustEvent = true
        } else if (hoursUntilStart < 12) {
          refundPercent = 0.7
          createTrustEvent = true
        } else if (hoursUntilStart < 24) {
          refundPercent = 0.9
        }

        effects.push({
          type: 'refund_payment',
          amount: ctx.shift.total_amount * refundPercent,
          reason: ctx.reason || 'client_cancellation'
        })

        if (createTrustEvent) {
          effects.push({
            type: 'create_trust_event',
            userId: ctx.shift.client_id,
            eventType: 'late_cancellation',
            severity: hoursUntilStart < 2 ? 'high' : 'medium'
          })
        }

        // Уведомляем всех assigned workers
        effects.push({
          type: 'notify_users',
          userIds: ctx.shift.assigned_workers.map(w => w.id),
          message: 'Shift cancelled by client'
        })

        return effects
      }
    }
  },

  // IN_PROGRESS
  in_progress: {
    completed: {
      condition: (ctx) => {
        // Автоматически когда все workers checked out
        // ИЛИ client вручную закрывает
        return (
          ctx.actorRole === 'system' ||
          (ctx.actorRole === 'client' && ctx.actorId === ctx.shift.client_id)
        )
      },
      effects: (ctx) => [
        { type: 'release_payment' },
        { type: 'request_ratings' },
        {
          type: 'update_statistics',
          userId: ctx.shift.client_id,
          field: 'total_shifts_completed',
          delta: 1
        },
        ...ctx.shift.assigned_workers.map(w => ({
          type: 'update_statistics' as const,
          userId: w.id,
          field: 'total_shifts_completed',
          delta: 1
        }))
      ]
    },
    disputed: {
      condition: (ctx) => {
        // Client или worker может открыть спор в течение 24ч после начала
        const hoursSinceStart = (Date.now() - ctx.shift.start_time.getTime()) / (1000 * 60 * 60)

        return (
          hoursSinceStart <= 24 &&
          (ctx.actorRole === 'client' || ctx.actorRole === 'worker')
        )
      },
      effects: (ctx) => [
        { type: 'freeze_payment' },
        {
          type: 'notify_users',
          userIds: ['admin'], // TODO: admin user ids
          message: `Dispute opened for shift ${ctx.shift.id}`
        }
      ]
    }
  },

  // COMPLETED
  completed: {
    disputed: {
      condition: (ctx) => {
        // Можно переоткрыть в течение 48ч
        return ctx.actorRole === 'client' || ctx.actorRole === 'worker'
      },
      effects: (ctx) => [
        { type: 'freeze_payment' },
        {
          type: 'notify_users',
          userIds: ['admin'],
          message: `Dispute reopened for shift ${ctx.shift.id}`
        }
      ]
    }
  },

  // CANCELLED (final state, no transitions)
  cancelled: {},

  // DISPUTED
  disputed: {
    completed: {
      condition: (ctx) => {
        // Только admin может резолвить в completed
        return ctx.actorRole === 'admin'
      },
      effects: (ctx) => [
        { type: 'release_payment' },
        {
          type: 'notify_users',
          userIds: [ctx.shift.client_id, ...ctx.shift.assigned_workers.map(w => w.id)],
          message: 'Dispute resolved in favor of workers'
        }
      ]
    },
    cancelled: {
      condition: (ctx) => {
        // Только admin может резолвить в cancelled (возврат)
        return ctx.actorRole === 'admin'
      },
      effects: (ctx) => [
        {
          type: 'refund_payment',
          amount: ctx.shift.total_amount,
          reason: 'dispute_resolved_client_favor'
        },
        {
          type: 'notify_users',
          userIds: [ctx.shift.client_id, ...ctx.shift.assigned_workers.map(w => w.id)],
          message: 'Dispute resolved in favor of client'
        }
      ]
    }
  }
}

/**
 * Получить список доступных переходов для текущего статуса
 */
export function getAvailableTransitions(
  status: ShiftStatus,
  context: TransitionContext
): ShiftStatus[] {
  const transitions = TRANSITION_RULES[status]
  if (!transitions) return []

  return Object.keys(transitions).filter(to =>
    canTransition(status, to as ShiftStatus, context)
  ) as ShiftStatus[]
}

/**
 * Проверить, является ли статус финальным (нельзя изменить)
 */
export function isFinalStatus(status: ShiftStatus): boolean {
  return status === 'cancelled' || status === 'completed'
}

/**
 * Получить человекочитаемое описание статуса
 */
export function getStatusLabel(status: ShiftStatus): string {
  const labels: Record<ShiftStatus, string> = {
    draft: 'Черновик',
    open: 'Открыта',
    in_progress: 'В процессе',
    completed: 'Завершена',
    cancelled: 'Отменена',
    disputed: 'Спор'
  }
  return labels[status]
}

/**
 * Получить цвет статуса для UI
 */
export function getStatusColor(status: ShiftStatus): string {
  const colors: Record<ShiftStatus, string> = {
    draft: 'gray',
    open: 'blue',
    in_progress: 'yellow',
    completed: 'green',
    cancelled: 'red',
    disputed: 'orange'
  }
  return colors[status]
}
