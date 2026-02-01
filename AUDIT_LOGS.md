# Audit Logging System

## Overview

Система логирования всех действий на платформе. Отслеживает действия пользователей, изменения данных, платежи, споры и другие важные события для безопасности, аудита и аналитики.

## Files Created

### New Files:
- `supabase/migrations/019_audit_logs.sql` - таблица и индексы для логов
- `lib/audit-log.ts` - helper функции для создания логов
- `app/admin/logs/page.tsx` - страница просмотра логов для админов
- `components/admin/AuditLogTable.tsx` - таблица логов с фильтрацией

### Modified Files:
- `components/admin/AdminSidebar.tsx` - добавлен пункт меню "Логи действий"

## Database Schema

### Table: `audit_logs`

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes:
- `idx_audit_logs_user_id` - поиск по пользователю
- `idx_audit_logs_created_at` - сортировка по времени (DESC)
- `idx_audit_logs_action` - фильтрация по действию
- `idx_audit_logs_entity` - поиск по типу и ID объекта

### RLS Policies:
- **Admins can view** - только админы могут читать логи
- **System can insert** - любой может создавать логи (no auth required)

## Action Types

### User Actions:
- `user.created` - новый пользователь зарегистрирован
- `user.updated` - профиль пользователя обновлён
- `user.banned` - пользователь заблокирован
- `user.unbanned` - пользователь разблокирован
- `user.deleted` - пользователь удалён

### Shift Actions:
- `shift.created` - создана новая смена
- `shift.updated` - смена обновлена
- `shift.completed` - смена завершена
- `shift.cancelled` - смена отменена
- `shift.deleted` - смена удалена

### Worker Actions:
- `worker.assigned` - исполнитель назначен на смену
- `worker.removed` - исполнитель удалён со смены
- `worker.checked_in` - исполнитель отметился на начало
- `worker.checked_out` - исполнитель отметился на завершение

### Payment Actions:
- `payment.created` - создан платёж
- `payment.processed` - платёж обработан
- `payment.failed` - платёж не прошёл
- `payment.refunded` - возврат средств

### Rating Actions:
- `rating.created` - создан рейтинг
- `rating.updated` - рейтинг обновлён

### Dispute Actions:
- `dispute.created` - создан спор
- `dispute.updated` - спор обновлён
- `dispute.resolved` - спор разрешён

### Team Actions:
- `team.created` - создана бригада
- `team.updated` - бригада обновлена
- `team.deleted` - бригада удалена
- `team.member_added` - добавлен участник в бригаду
- `team.member_removed` - удалён участник из бригады

### Message Actions:
- `message.sent` - отправлено сообщение

### Admin Actions:
- `admin.access` - вход в админ-панель
- `admin.settings_changed` - изменены настройки системы

## Usage

### Basic Usage:

```typescript
import { createAuditLog, AuditActions } from '@/lib/audit-log'

// Simple log
await createAuditLog({
  userId: user.id,
  action: AuditActions.SHIFT_CREATED,
  entityType: 'shift',
  entityId: newShift.id
})
```

### With Metadata:

```typescript
await createAuditLog({
  userId: adminUser.id,
  action: AuditActions.USER_BANNED,
  entityType: 'user',
  entityId: bannedUser.id,
  metadata: {
    reason: 'Multiple policy violations',
    duration: '30 days',
    previous_bans: 2
  }
})
```

### In API Route:

```typescript
import { createAuditLogFromRequest } from '@/lib/audit-log'

export async function POST(request: Request) {
  // ... your logic ...

  await createAuditLogFromRequest({
    userId: currentUser.id,
    action: AuditActions.PAYMENT_PROCESSED,
    entityType: 'payment',
    entityId: payment.id,
    metadata: {
      amount: payment.amount,
      method: 'stripe'
    },
    request // Automatically extracts IP and User-Agent
  })

  return Response.json({ success: true })
}
```

### Query Logs:

```typescript
import { getAuditLogs } from '@/lib/audit-log'

// Get user's logs
const userLogs = await getAuditLogs({
  userId: user.id,
  limit: 50
})

// Get logs by action
const banLogs = await getAuditLogs({
  action: 'user.banned',
  limit: 100
})

// Get logs by entity type
const shiftLogs = await getAuditLogs({
  entityType: 'shift',
  limit: 100
})
```

## Admin UI Features

### 1. **Stats Cards**

3 метрики:
- **Всего записей** - общее количество логов в системе
- **За последние 24 часа** - количество действий за сутки
- **Активных пользователей** - уникальных пользователей за 24 часа

### 2. **Filter Bar**

Фильтрация по типу действия:
- Все действия
- Пользователи (user.*)
- Смены (shift.*)
- Платежи (payment.*)
- Рейтинги (rating.*)
- Споры (dispute.*)
- Бригады (team.*)

### 3. **Audit Log Table**

Колонки:
- **Время** - дата и время действия
- **Пользователь** - кто выполнил (с аватаром) или "System"
- **Действие** - тип действия с цветной меткой и иконкой
- **Объект** - тип и ID объекта
- **Детали** - кнопка для раскрытия метаданных

### 4. **Expandable Rows**

При клике на "Показать" отображается:
- **Метаданные** - JSON с дополнительной информацией
- **IP адрес** - откуда выполнено действие
- **User Agent** - браузер/устройство пользователя

### 5. **Color Coding**

Цвета действий:
- 🟢 **Зелёный** (created) - создание объектов
- 🔴 **Красный** (banned, deleted, failed) - критичные действия
- 🔵 **Синий** (resolved, completed, processed) - успешные завершения
- 🟡 **Жёлтый** (updated) - обновления
- ⚪ **Серый** - остальные действия

### 6. **Icons**

Иконки для быстрой идентификации:
- ✨ created
- 🚫 banned
- ✅ unbanned
- 🗑️ deleted
- ✔️ completed
- 🤝 resolved
- 👤 assigned
- 💳 payment
- 💬 message
- 📝 default

## Integration Examples

### 1. User Ban:

```typescript
// In ban user API route
export async function POST(request: Request) {
  const { targetUserId, reason, duration } = await request.json()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Ban logic
  await supabase
    .from('users')
    .update({ is_banned: true })
    .eq('id', targetUserId)

  // Create audit log
  await createAuditLogFromRequest({
    userId: user?.id,
    action: AuditActions.USER_BANNED,
    entityType: 'user',
    entityId: targetUserId,
    metadata: { reason, duration },
    request
  })

  return Response.json({ success: true })
}
```

### 2. Shift Creation:

```typescript
// In create shift action
export async function createShift(data: ShiftData, userId: string) {
  const { data: shift, error } = await supabase
    .from('shifts')
    .insert({
      title: data.title,
      client_id: userId,
      ...data
    })
    .select()
    .single()

  if (shift) {
    await createAuditLog({
      userId,
      action: AuditActions.SHIFT_CREATED,
      entityType: 'shift',
      entityId: shift.id,
      metadata: {
        title: shift.title,
        category: shift.category,
        price: shift.price
      }
    })
  }

  return shift
}
```

### 3. Payment Processing:

```typescript
// In payment webhook
export async function POST(request: Request) {
  const event = await stripe.webhooks.constructEvent(...)

  if (event.type === 'payment_intent.succeeded') {
    const payment = event.data.object

    await createAuditLogFromRequest({
      userId: payment.metadata.userId,
      action: AuditActions.PAYMENT_PROCESSED,
      entityType: 'payment',
      entityId: payment.id,
      metadata: {
        amount: payment.amount,
        currency: payment.currency,
        payment_method: payment.payment_method
      },
      request
    })
  }
}
```

### 4. Dispute Resolution:

```typescript
// In resolve dispute action
export async function resolveDispute(disputeId: string, resolution: string, adminId: string) {
  await supabase
    .from('disputes')
    .update({
      status: 'resolved',
      resolution,
      resolved_at: new Date().toISOString()
    })
    .eq('id', disputeId)

  await createAuditLog({
    userId: adminId,
    action: AuditActions.DISPUTE_RESOLVED,
    entityType: 'dispute',
    entityId: disputeId,
    metadata: {
      resolution,
      resolved_by: adminId
    }
  })
}
```

## Database Functions

### get_recent_logs_count(hours):
```sql
SELECT get_recent_logs_count(24); -- Last 24 hours
```

### get_logs_by_action(action_filter):
```sql
SELECT * FROM get_logs_by_action('user'); -- All user.* actions
```

## Performance Considerations

- **Indexes** - created on user_id, created_at, action for fast queries
- **Limit** - admin UI shows last 100 logs (adjustable)
- **Partitioning** - consider partitioning by date for very large datasets
- **Archiving** - consider archiving old logs (>1 year) to cold storage
- **JSONB** - metadata stored as JSONB for flexible querying

## Security

- **RLS Enabled** - only admins can read logs
- **No Deletion** - logs are immutable (no DELETE policy)
- **No Auth on Insert** - allows system events to be logged
- **Sensitive Data** - avoid logging passwords, tokens, or PII in metadata
- **IP Logging** - IP addresses stored for security audit

## Testing Checklist

- [ ] Create audit log manually
- [ ] View logs in admin panel
- [ ] Filter logs by action type
- [ ] Expand row to see metadata
- [ ] Verify IP address captured
- [ ] Verify user agent captured
- [ ] Test with system action (no user_id)
- [ ] Test with custom metadata
- [ ] Test query functions
- [ ] Verify only admins can access
- [ ] Check performance with 1000+ logs
- [ ] Verify indexes are used

## Best Practices

1. **Always Log Critical Actions**: ban, delete, payment, access control changes
2. **Include Context**: add relevant metadata for debugging
3. **Don't Block**: logging should never fail the main operation
4. **Consistent Naming**: use AuditActions constants
5. **Privacy**: don't log sensitive user data
6. **Async**: consider making logs async for better performance
7. **Retention**: define data retention policy

## Future Enhancements

1. **Real-time Dashboard** - live log stream with WebSockets
2. **Advanced Filters** - date range, multiple actions, entity search
3. **Export** - download logs as CSV/JSON
4. **Alerts** - notify on suspicious patterns
5. **Analytics** - visualize trends and patterns
6. **Retention Policy** - auto-archive old logs
7. **Full-text Search** - search in metadata
8. **User Activity Timeline** - per-user activity view
9. **Geo-location** - map IP to location
10. **Anomaly Detection** - ML-based suspicious activity detection

## Related Features

- Admin dashboard (`/admin`)
- User management (`/admin/users`)
- Disputes (`/admin/disputes`)
- Finance reporting (`/admin/finance`)

## Dependencies

- **supabase** - for database operations
- **lucide-react** - for icons

## Notes

- Logs are **immutable** - cannot be edited or deleted
- System actions have `user_id = NULL`
- `ON DELETE SET NULL` - logs persist even if user deleted
- Metadata stored as JSONB for flexible structure
- IP addresses stored as INET type for efficient storage
- Created_at automatically set by database
- Errors in logging don't break the app (silent failure)
