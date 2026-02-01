# Audit Logging Integration Examples

Примеры интеграции системы логирования в различные части приложения.

## Server Actions

### Example 1: Ban User

```typescript
// app/actions/user-actions.ts
'use server'

import { createClient } from '@/lib/supabase-server'
import { createAuditLog, AuditActions } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'

export async function banUser({
  targetUserId,
  reason,
  duration
}: {
  targetUserId: string
  reason: string
  duration: string
}) {
  const supabase = createClient()

  // Get current admin user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Ban the user
  const { error } = await supabase
    .from('users')
    .update({ is_banned: true })
    .eq('id', targetUserId)

  if (error) throw error

  // Create audit log
  await createAuditLog({
    userId: user.id,
    action: AuditActions.USER_BANNED,
    entityType: 'user',
    entityId: targetUserId,
    metadata: {
      reason,
      duration,
      banned_by: user.email
    }
  })

  revalidatePath('/admin/users')
}
```

### Example 2: Create Shift

```typescript
// app/actions/shift-actions.ts
'use server'

import { createClient } from '@/lib/supabase-server'
import { createAuditLog, AuditActions } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'

export async function createShift(formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const shiftData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    price: Number(formData.get('price')),
    date: formData.get('date') as string,
    client_id: user.id
  }

  const { data: shift, error } = await supabase
    .from('shifts')
    .insert(shiftData)
    .select()
    .single()

  if (error) throw error

  // Log shift creation
  await createAuditLog({
    userId: user.id,
    action: AuditActions.SHIFT_CREATED,
    entityType: 'shift',
    entityId: shift.id,
    metadata: {
      title: shift.title,
      category: shift.category,
      price: shift.price,
      date: shift.date
    }
  })

  revalidatePath('/client/shifts')
  return shift
}
```

### Example 3: Assign Worker to Shift

```typescript
// app/actions/shift-worker-actions.ts
'use server'

import { createClient } from '@/lib/supabase-server'
import { createAuditLog, AuditActions } from '@/lib/audit-log'

export async function assignWorker({
  shiftId,
  workerId
}: {
  shiftId: string
  workerId: string
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Assign worker
  const { data: assignment, error } = await supabase
    .from('shift_workers')
    .insert({
      shift_id: shiftId,
      worker_id: workerId,
      status: 'assigned'
    })
    .select(`
      *,
      shift:shifts(title),
      worker:users(full_name)
    `)
    .single()

  if (error) throw error

  // Log assignment
  await createAuditLog({
    userId: user.id,
    action: AuditActions.WORKER_ASSIGNED,
    entityType: 'shift_worker',
    entityId: assignment.id,
    metadata: {
      shift_id: shiftId,
      shift_title: assignment.shift.title,
      worker_id: workerId,
      worker_name: assignment.worker.full_name,
      assigned_by: user.id
    }
  })

  return assignment
}
```

## API Routes

### Example 4: Payment Webhook

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAuditLogFromRequest, AuditActions } from '@/lib/audit-log'
import { createClient } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    const supabase = createClient()

    // Update payment status
    await supabase
      .from('payments')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    // Log payment success
    await createAuditLogFromRequest({
      userId: paymentIntent.metadata.user_id,
      action: AuditActions.PAYMENT_PROCESSED,
      entityType: 'payment',
      entityId: paymentIntent.id,
      metadata: {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_method: paymentIntent.payment_method,
        status: 'succeeded'
      },
      request: request as unknown as Request
    })
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    // Log payment failure
    await createAuditLogFromRequest({
      userId: paymentIntent.metadata.user_id,
      action: AuditActions.PAYMENT_FAILED,
      entityType: 'payment',
      entityId: paymentIntent.id,
      metadata: {
        amount: paymentIntent.amount,
        error: paymentIntent.last_payment_error?.message,
        status: 'failed'
      },
      request: request as unknown as Request
    })
  }

  return NextResponse.json({ received: true })
}
```

### Example 5: Admin Action API

```typescript
// app/api/admin/resolve-dispute/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAuditLogFromRequest, AuditActions } from '@/lib/audit-log'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { disputeId, resolution, winner } = await request.json()

  // Resolve dispute
  const { error } = await supabase
    .from('disputes')
    .update({
      status: 'resolved',
      resolution,
      winner,
      resolved_by: user.id,
      resolved_at: new Date().toISOString()
    })
    .eq('id', disputeId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log resolution
  await createAuditLogFromRequest({
    userId: user.id,
    action: AuditActions.DISPUTE_RESOLVED,
    entityType: 'dispute',
    entityId: disputeId,
    metadata: {
      resolution,
      winner,
      resolved_by_email: user.email
    },
    request: request as unknown as Request
  })

  return NextResponse.json({ success: true })
}
```

## Client Components with Server Actions

### Example 6: Rating Component

```typescript
// components/ratings/CreateRating.tsx
'use client'

import { useState } from 'react'
import { createRating } from '@/app/actions/rating-actions'
import { Star } from 'lucide-react'

export default function CreateRating({
  shiftId,
  workerId
}: {
  shiftId: string
  workerId: string
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    await createRating({ shiftId, workerId, rating, comment })
    // Success handling
  }

  return (
    <div>
      {/* Rating UI */}
      <button onClick={handleSubmit}>Отправить</button>
    </div>
  )
}
```

```typescript
// app/actions/rating-actions.ts
'use server'

import { createClient } from '@/lib/supabase-server'
import { createAuditLog, AuditActions } from '@/lib/audit-log'

export async function createRating({
  shiftId,
  workerId,
  rating,
  comment
}: {
  shiftId: string
  workerId: string
  rating: number
  comment: string
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: ratingData, error } = await supabase
    .from('worker_ratings')
    .insert({
      shift_id: shiftId,
      worker_id: workerId,
      client_id: user.id,
      rating,
      comment
    })
    .select()
    .single()

  if (error) throw error

  // Log rating creation
  await createAuditLog({
    userId: user.id,
    action: AuditActions.RATING_CREATED,
    entityType: 'rating',
    entityId: ratingData.id,
    metadata: {
      shift_id: shiftId,
      worker_id: workerId,
      rating,
      has_comment: !!comment
    }
  })

  return ratingData
}
```

## Database Triggers (Optional)

### Example 7: Auto-log User Changes

```sql
-- Automatically log important user changes
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log ban status changes
  IF (TG_OP = 'UPDATE' AND OLD.is_banned IS DISTINCT FROM NEW.is_banned) THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      NEW.id,
      CASE WHEN NEW.is_banned THEN 'user.banned' ELSE 'user.unbanned' END,
      'user',
      NEW.id,
      jsonb_build_object(
        'previous_state', OLD.is_banned,
        'new_state', NEW.is_banned,
        'auto_logged', true
      )
    );
  END IF;

  -- Log role changes
  IF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      NEW.id,
      'user.role_changed',
      'user',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'auto_logged', true
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER user_changes_audit
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_changes();
```

## Querying Logs

### Example 8: User Activity Report

```typescript
// lib/reports/user-activity.ts
import { createClient } from '@/lib/supabase-server'

export async function getUserActivityReport(userId: string, days: number = 30) {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  // Group by action type
  const actionCounts = logs?.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalActions: logs?.length || 0,
    actionBreakdown: actionCounts,
    recentLogs: logs?.slice(0, 10) || []
  }
}
```

### Example 9: Security Audit

```typescript
// lib/security/audit.ts
import { createClient } from '@/lib/supabase-server'

export async function findSuspiciousActivity() {
  const supabase = createClient()

  // Find multiple failed login attempts
  const { data: failedLogins } = await supabase
    .from('audit_logs')
    .select('user_id, ip_address, created_at')
    .eq('action', 'auth.login_failed')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour

  // Group by IP
  const ipCounts = failedLogins?.reduce((acc, log) => {
    if (!log.ip_address) return acc
    acc[log.ip_address] = (acc[log.ip_address] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Find IPs with > 5 failed attempts
  const suspiciousIPs = Object.entries(ipCounts || {})
    .filter(([_, count]) => count > 5)
    .map(([ip, count]) => ({ ip, attempts: count }))

  return suspiciousIPs
}
```

## Testing

### Example 10: Test Audit Logging

```typescript
// __tests__/audit-log.test.ts
import { createAuditLog, AuditActions, getAuditLogs } from '@/lib/audit-log'

describe('Audit Logging', () => {
  it('should create audit log', async () => {
    await createAuditLog({
      userId: 'test-user-id',
      action: AuditActions.USER_CREATED,
      entityType: 'user',
      entityId: 'new-user-id',
      metadata: { test: true }
    })

    const logs = await getAuditLogs({ userId: 'test-user-id' })
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0].action).toBe('user.created')
  })

  it('should not fail on error', async () => {
    // Should not throw even if database fails
    await expect(
      createAuditLog({
        userId: 'invalid',
        action: 'test.action',
        entityType: 'test'
      })
    ).resolves.not.toThrow()
  })
})
```

## Best Practices Summary

1. **Always log critical actions** - ban, delete, payment, access changes
2. **Include context** - add metadata for debugging
3. **Use constants** - use AuditActions enum for consistency
4. **Don't block** - logging should never fail the main operation
5. **Privacy first** - don't log sensitive data (passwords, tokens)
6. **Async when possible** - don't slow down user operations
7. **Query efficiently** - use indexes, limit results
8. **Archive old logs** - keep database performant
9. **Monitor patterns** - detect anomalies and suspicious activity
10. **Document actions** - maintain list of all action types
