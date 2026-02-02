import { createServerClient as createClient } from '@/lib/supabase-server'

/**
 * Action types for audit logging
 */
export const AuditActions = {
  // User actions
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_BANNED: 'user.banned',
  USER_UNBANNED: 'user.unbanned',
  USER_DELETED: 'user.deleted',

  // Shift actions
  SHIFT_CREATED: 'shift.created',
  SHIFT_UPDATED: 'shift.updated',
  SHIFT_COMPLETED: 'shift.completed',
  SHIFT_CANCELLED: 'shift.cancelled',
  SHIFT_DELETED: 'shift.deleted',

  // Worker actions
  WORKER_ASSIGNED: 'worker.assigned',
  WORKER_REMOVED: 'worker.removed',
  WORKER_CHECKED_IN: 'worker.checked_in',
  WORKER_CHECKED_OUT: 'worker.checked_out',

  // Payment actions
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_PROCESSED: 'payment.processed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Rating actions
  RATING_CREATED: 'rating.created',
  RATING_UPDATED: 'rating.updated',

  // Dispute actions
  DISPUTE_CREATED: 'dispute.created',
  DISPUTE_UPDATED: 'dispute.updated',
  DISPUTE_RESOLVED: 'dispute.resolved',

  // Team actions
  TEAM_CREATED: 'team.created',
  TEAM_UPDATED: 'team.updated',
  TEAM_DELETED: 'team.deleted',
  TEAM_MEMBER_ADDED: 'team.member_added',
  TEAM_MEMBER_REMOVED: 'team.member_removed',

  // Message actions
  MESSAGE_SENT: 'message.sent',

  // Admin actions
  ADMIN_ACCESS: 'admin.access',
  ADMIN_SETTINGS_CHANGED: 'admin.settings_changed'
} as const

export type AuditAction = typeof AuditActions[keyof typeof AuditActions]

interface CreateAuditLogParams {
  userId?: string
  action: AuditAction | string
  entityType?: string
  entityId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an audit log entry
 *
 * @example
 * await createAuditLog({
 *   userId: user.id,
 *   action: AuditActions.USER_BANNED,
 *   entityType: 'user',
 *   entityId: bannedUser.id,
 *   metadata: { reason: 'Multiple violations', duration: '30 days' }
 * })
 */
export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent
}: CreateAuditLogParams): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId || null,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      metadata: metadata || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null
    })

    if (error) {
      console.error('Audit log insert error:', error)
    }
  } catch (error) {
    console.error('Audit log error:', error)
    // Don't throw - logging failures shouldn't break the app
  }
}

/**
 * Create audit log from Request object (for API routes)
 */
export async function createAuditLogFromRequest({
  userId,
  action,
  entityType,
  entityId,
  metadata,
  request
}: CreateAuditLogParams & { request?: Request }): Promise<void> {
  const ipAddress = request?.headers.get('x-forwarded-for') ||
                    request?.headers.get('x-real-ip') ||
                    'unknown'

  const userAgent = request?.headers.get('user-agent') || 'unknown'

  await createAuditLog({
    userId,
    action,
    entityType,
    entityId,
    metadata,
    ipAddress,
    userAgent
  })
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs({
  userId,
  action,
  entityType,
  limit = 100
}: {
  userId?: string
  action?: string
  entityType?: string
  limit?: number
} = {}) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(id, full_name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Get audit logs error:', error)
    return []
  }
}
