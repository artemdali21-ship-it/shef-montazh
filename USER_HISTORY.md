# User History Timeline

## Overview

Детальная история взаимодействий пользователя на платформе. Timeline показывает все действия пользователя в хронологическом порядке: регистрацию, смены, рейтинги, платежи, споры и действия из audit logs.

## Files Created

### New Files:
- `app/admin/users/[id]/history/page.tsx` - страница истории пользователя
- `components/admin/UserTimeline.tsx` - компонент timeline с фильтрацией

### Modified Files:
- `components/admin/UserTable.tsx` - добавлена кнопка "История пользователя" (Clock icon)

## Features

### 1. **User Info Card**

Карточка с информацией о пользователе:
- Аватар или инициалы
- Полное имя и email
- Роль (worker/client/shef/admin)
- Дата регистрации

### 2. **Stats Cards**

4 метрики:
- **Всего событий** - общее количество событий в истории
- **Смены** - завершено/всего смен
- **Средний рейтинг** - средняя оценка от клиентов
- **Оценок получено** - количество полученных рейтингов

### 3. **Filter Bar**

Фильтрация по типу событий:
- **Все события** - показать всё
- **Пользователь** - регистрация, обновления профиля
- **Смены** - назначения, завершения
- **Рейтинги** - полученные и данные оценки
- **Платежи** - все транзакции
- **Споры** - созданные и разрешённые споры
- **Действия** - события из audit logs

### 4. **Timeline Events**

Каждое событие содержит:
- **Иконка** - цветная иконка типа события
- **Заголовок** - название события
- **Дата и время** - когда произошло
- **Описание** - детали события
- **Метаданные** - раскрывающийся JSON с дополнительной информацией

### 5. **Event Types**

**Регистрация**:
- Иконка: Shield (blue)
- "Пользователь зарегистрировался"

**Смены**:
- Иконка: Calendar
- Цвета: green (completed), red (cancelled), orange (other)
- Показывает название смены и статус

**Рейтинги полученные**:
- Иконка: Star (yellow)
- От кого получен, оценка, комментарий

**Рейтинги данные**:
- Иконка: Star (purple)
- Кому дан, оценка

**Платежи**:
- Иконка: DollarSign
- Цвета: green (paid), red (failed), yellow (pending)
- Сумма и статус

**Споры**:
- Иконка: AlertTriangle
- Цвета: blue (resolved), red (active)
- Причина и статус

**Audit Logs**:
- Различные иконки в зависимости от действия
- Цвета: green (created), red (deleted/banned), blue (completed), yellow (updated)

## Data Fetching

### Parallel Queries:

```typescript
const [
  userResult,
  shiftsResult,
  ratingsReceivedResult,
  ratingsGivenResult,
  paymentsResult,
  disputesResult,
  logsResult
] = await Promise.all([
  // User profile
  supabase.from('users').select('*').eq('id', userId).single(),

  // Shifts as worker
  supabase.from('shift_workers')
    .select('*, shift:shifts(*)')
    .eq('worker_id', userId),

  // Ratings received
  supabase.from('worker_ratings')
    .select('*, from_user:client_id(*)')
    .eq('worker_id', userId),

  // Ratings given
  supabase.from('worker_ratings')
    .select('*, to_user:worker_id(*)')
    .eq('client_id', userId),

  // Payments
  supabase.from('payments')
    .select('*')
    .eq('worker_id', userId),

  // Disputes
  supabase.from('disputes')
    .select('*')
    .or(`created_by.eq.${userId},against_user.eq.${userId}`),

  // Audit logs (last 50)
  supabase.from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .limit(50)
])
```

### Stats Calculation:

```typescript
const totalShifts = shifts.length
const completedShifts = shifts.filter(s => s.status === 'completed').length
const totalRatings = ratingsReceived.length
const avgRating = totalRatings > 0
  ? ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / totalRatings
  : 0
```

## Event Combination

All events are combined and sorted chronologically:

```typescript
const events = [
  {
    type: 'user.created',
    date: user.created_at,
    icon: Shield,
    color: 'blue-400',
    bgColor: 'blue-500/20',
    title: 'Регистрация',
    description: 'Пользователь зарегистрировался',
    metadata: { email: user.email }
  },
  ...shifts.map(s => ({ ... })),
  ...ratingsReceived.map(r => ({ ... })),
  ...ratingsGiven.map(r => ({ ... })),
  ...payments.map(p => ({ ... })),
  ...disputes.map(d => ({ ... })),
  ...logs.map(log => ({ ... }))
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
```

## UI Components

### Timeline Item Structure:

```
┌─────────────────────────────────┐
│ [Icon]  Заголовок      14:30    │
│   │     Описание                │
│   │     [Подробнее ▼]           │
│   │                             │
│   │   { metadata json }         │
└─────────────────────────────────┘
```

### Visual Elements:
- **Icon Circle** - colored background with white icon
- **Connecting Line** - vertical line between events (white/10)
- **Event Card** - glassmorphism card with hover effect
- **Expandable Details** - collapsible JSON metadata viewer
- **Date/Time Badge** - formatted with Clock icon

## Color Coding

### By Event Type:
- **Blue** - registration, system events
- **Green** - completed, successful, paid
- **Yellow** - pending, in progress, ratings
- **Orange** - assigned, active shifts
- **Red** - cancelled, failed, disputes
- **Purple** - ratings given by user

### Icon Mapping:
- Shield - registration
- Calendar - shifts
- Star - ratings
- DollarSign - payments
- AlertTriangle - disputes
- CheckCircle - completed
- Ban - banned
- MessageCircle - messages
- Users - team actions
- Clock - time-based events

## Access Control

- Only admins can view user history
- Handled by admin layout authentication
- User must exist or shows 404-like page

## Navigation

From admin users table:
```typescript
<Link href={`/admin/users/${user.id}/history`}>
  <Clock size={18} />
</Link>
```

Back to user profile:
```typescript
<Link href={`/admin/users/${params.id}`}>
  <ArrowLeft size={24} />
</Link>
```

## Performance

- **Parallel fetching** - all data loaded at once
- **Limit audit logs** - only last 50 logs to avoid overload
- **Client-side filtering** - no re-fetch on filter change
- **Memoization** - consider React.memo for timeline items
- **Virtual scrolling** - for users with 1000+ events (future)

## Testing Checklist

- [ ] Load history for user with no events
- [ ] Load history for user with all event types
- [ ] Filter by each event type
- [ ] Verify correct chronological order
- [ ] Test expandable metadata
- [ ] Check stats calculations
- [ ] Verify date/time formatting
- [ ] Test with user who has 100+ events
- [ ] Verify color coding
- [ ] Test back navigation
- [ ] Check responsive layout
- [ ] Verify icons display correctly

## Edge Cases

1. **No events** - shows empty state with filter info
2. **User deleted** - still shows history if logs exist
3. **Missing data** - gracefully handles null/undefined
4. **Large metadata** - JSON viewer with scrolling
5. **Old dates** - formats correctly for years ago
6. **Null ratings** - shows "—" instead of error

## Future Enhancements

1. **Pagination** - load more events on scroll
2. **Date Range Filter** - filter by time period
3. **Export** - download timeline as PDF/CSV
4. **Search** - search within events
5. **Comparison** - compare two users side by side
6. **Activity Graph** - visualize activity over time
7. **Event Details Modal** - full-screen detailed view
8. **Related Events** - group related events together
9. **Real-time Updates** - live updates via WebSockets
10. **Event Comments** - admin notes on events

## Related Features

- Admin users management (`/admin/users`)
- Audit logs (`/admin/logs`)
- User profiles (worker/client)
- Disputes management (`/admin/disputes`)

## Usage Examples

### View specific user history:
```
/admin/users/123e4567-e89b-12d3-a456-426614174000/history
```

### Filter to show only shifts:
- Click "Смены" button in filter bar
- URL can support query params in future:
  `/admin/users/{id}/history?type=shift`

## Dependencies

- **lucide-react** - for icons
- **supabase** - for data fetching
- **next/link** - for navigation

## Notes

- Timeline is **read-only** - no editing/deleting events
- All events sorted newest first (descending)
- Metadata displayed as formatted JSON
- Some events may not have metadata (shows nothing)
- Audit logs limited to 50 most recent
- Date formatting uses Russian locale
- Responsive design works on mobile
- Dark theme maintained throughout
- Loading states could be added for slow connections
