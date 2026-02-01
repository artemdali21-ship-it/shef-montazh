# User Segmentation System

## Overview

Система сегментации пользователей для массовых действий. Позволяет группировать пользователей по различным критериям и выполнять с ними массовые операции: просмотр, экспорт в CSV, рассылки.

## Files Created

### New Files:
- `app/admin/segments/page.tsx` - главная страница сегментов с count
- `app/admin/segments/[id]/page.tsx` - детальная страница сегмента с пользователями
- `components/admin/ExportSegmentButton.tsx` - кнопка экспорта в CSV
- `components/admin/SegmentUsersTable.tsx` - таблица пользователей сегмента

### Modified Files:
- `components/admin/AdminSidebar.tsx` - добавлен пункт меню "Сегменты" (Layers icon)

## Predefined Segments

### 1. **ТОП исполнители** (top-workers)
- **Критерий**: Рейтинг > 4.8
- **Цель**: Работа с лучшими исполнителями
- **Use cases**: Приоритетное назначение, бонусы, специальные условия
- **Icon**: TrendingUp (green)

```typescript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'worker')
  .gte('rating', 4.8)
```

### 2. **Проблемные пользователи** (problematic)
- **Критерий**: Есть баны ИЛИ участвует в спорах
- **Цель**: Мониторинг и превентивные меры
- **Use cases**: Дополнительный контроль, предупреждения, ограничения
- **Icon**: AlertTriangle (red)

```typescript
// Get banned users + users with disputes
const bannedUsers = await supabase
  .from('worker_profiles')
  .select('user_id')
  .eq('status', 'banned')

const disputes = await supabase
  .from('disputes')
  .select('created_by, against_user')

const uniqueUsers = new Set([...banned, ...disputeParticipants])
```

### 3. **Неактивные 30 дней** (inactive)
- **Критерий**: Нет записей в audit_logs за последние 30 дней
- **Цель**: Реактивация пользователей
- **Use cases**: Возвратные рассылки, акции, опросы о причинах неактивности
- **Icon**: Clock (gray)

```typescript
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const activeUsers = await supabase
  .from('audit_logs')
  .select('user_id')
  .gte('created_at', thirtyDaysAgo.toISOString())

const inactiveUsers = allUsers.filter(u => !activeUsers.includes(u.id))
```

### 4. **Новички** (newbies)
- **Критерий**: < 5 завершённых смен
- **Цель**: Онбординг и поддержка новых исполнителей
- **Use cases**: Обучающие материалы, наставничество, первые задания
- **Icon**: Sparkles (blue)

```typescript
const { data: shiftWorkers } = await supabase
  .from('shift_workers')
  .select('worker_id')
  .eq('status', 'completed')

const workerShiftCounts = countByWorkerId(shiftWorkers)
const newbies = workers.filter(w => workerShiftCounts[w.id] < 5)
```

### 5. **VIP клиенты** (vip-clients)
- **Критерий**: Потратили > 100,000 рублей
- **Цель**: Удержание ценных клиентов
- **Use cases**: Персональный менеджер, скидки, приоритетная поддержка
- **Icon**: Crown (purple)

```typescript
const { data: payments } = await supabase
  .from('payments')
  .select('client_id, amount')
  .eq('status', 'paid')

const clientSpending = aggregateByClient(payments)
const vipClients = clients.filter(c => clientSpending[c.id] > 100000)
```

## Features

### 1. **Segments Overview Page**

Главная страница показывает:
- Карточки всех сегментов
- Количество пользователей в каждом
- Иконки и цветовое кодирование
- Описание критериев
- Total count bar сверху
- Hover effects и transitions

### 2. **Segment Detail Page**

Детальная страница сегмента:
- **Header**: название, описание, back button
- **Stats Card**: количество пользователей
- **Action Buttons**: Export CSV, Рассылка
- **Users Table**: список всех пользователей
- **Empty State**: если нет пользователей

### 3. **Export to CSV**

Функционал экспорта:
- Button "Экспорт CSV" (green)
- Exports all segment users
- Columns: ID, Name, Email, Phone, Role, Rating, Registration Date
- UTF-8 with BOM for Excel compatibility
- Filename: `segment_[name]_[date].csv`
- Proper CSV escaping (commas, quotes)

CSV Format:
```csv
ID,Имя,Email,Телефон,Роль,Рейтинг,Дата регистрации
uuid,Иван Петров,ivan@example.com,+79001234567,worker,4.9,15.01.2025
```

### 4. **Users Table**

Таблица с колонками:
- **Пользователь**: аватар, имя, телефон, Shield icon (admin/shef)
- **Email**: контактная информация
- **Роль**: цветной badge (admin/shef/worker/client)
- **Рейтинг**: звезда с числом
- **Потрачено**: только для VIP clients segment
- **Регистрация**: дата с Clock icon
- **Действия**: "Открыть", "История"

### 5. **Mass Mailing** (Future)

Placeholder функционал:
- Button "Рассылка" (blue)
- Currently disabled (in development)
- Will allow sending notifications/emails to segment
- Modal with message composer
- Preview before send
- Track delivery status

## UI Components

### Segment Card:
```
┌─────────────────────────┐
│ [Icon]        [Count]   │
│  ТОП исполнители        │
│  Рейтинг > 4.8          │
│                         │
│  142        пользователей│
└─────────────────────────┘
```

### Stats Card:
```
┌─────────────────────────────────┐
│ Пользователей в сегменте        │
│ 142                             │
│                                 │
│ [Export CSV] [Рассылка]         │
└─────────────────────────────────┘
```

## Color Coding

### Segments:
- **Green** - positive (top workers)
- **Red** - negative (problematic)
- **Gray** - neutral (inactive)
- **Blue** - informational (newbies)
- **Purple** - premium (VIP clients)

### Roles:
- **Red** - Admin
- **Purple** - Shef
- **Blue** - Worker
- **Green** - Client

## Navigation

From admin sidebar:
```typescript
<Link href="/admin/segments">
  <Layers size={20} />
  Сегменты
</Link>
```

From segments overview to detail:
```typescript
<Link href={`/admin/segments/${segment.id}`}>
  {segment.name}
</Link>
```

## Performance

### Optimization Strategies:
1. **Parallel Counting** - all segments counted in parallel (Promise.all)
2. **Head-only queries** - use count: 'exact', head: true where possible
3. **Caching** - consider caching segment counts (update hourly)
4. **Pagination** - for segments with 1000+ users (future)
5. **Indexes** - ensure indexes on rating, created_at, status fields

### Current Limitations:
- All users loaded at once (no pagination)
- Counts recalculated on every page load
- Complex queries not optimized (inactive, newbies)
- Large segments may be slow

## Use Cases

### 1. Retention Campaign:
```
Segment: Неактивные 30 дней
Action: Email рассылка с персональным промокодом
Goal: Вернуть 20% неактивных пользователей
```

### 2. Quality Initiative:
```
Segment: ТОП исполнители
Action: Приглашение в элитную программу
Goal: Удержание лучших исполнителей
```

### 3. Problem Prevention:
```
Segment: Проблемные пользователи
Action: Превентивные меры, дополнительный мониторинг
Goal: Снизить количество споров на 30%
```

### 4. Onboarding:
```
Segment: Новички
Action: Обучающая email серия
Goal: Увеличить retention новых пользователей
```

### 5. VIP Program:
```
Segment: VIP клиенты
Action: Персональный менеджер, эксклюзивные условия
Goal: Увеличить LTV на 50%
```

## Future Enhancements

### Custom Segments:
1. **Segment Builder** - UI for creating custom segments
2. **Query Builder** - visual query construction
3. **Saved Segments** - save custom segments to database
4. **Dynamic Segments** - auto-update based on criteria

### Advanced Features:
5. **Segment Analytics** - track segment growth/decline
6. **Segment Overlap** - see users in multiple segments
7. **A/B Testing** - split segments for experiments
8. **Automated Actions** - trigger actions when user enters segment
9. **Segment Tags** - tag users with segment membership
10. **Schedule Actions** - schedule mailings/actions

### Integration:
11. **Email Integration** - connect to SendGrid/Mailchimp
12. **SMS Integration** - send SMS to segments
13. **Push Notifications** - send app notifications
14. **Webhooks** - trigger external webhooks
15. **Export to Google Sheets** - direct export

## Testing Checklist

- [ ] All segments show correct counts
- [ ] Segment detail pages load users correctly
- [ ] Export CSV works for all segments
- [ ] CSV opens correctly in Excel
- [ ] UTF-8 characters display properly
- [ ] Empty segments show empty state
- [ ] User links work (open profile, history)
- [ ] Role badges display correctly
- [ ] VIP segment shows spending amount
- [ ] Inactive segment excludes active users
- [ ] Newbies segment counts shifts correctly
- [ ] Problematic segment includes all criteria
- [ ] Top workers segment filters by rating
- [ ] Responsive layout works

## Security

- Only admins can access segments
- RLS policies on all tables
- No user data exposed to non-admins
- CSV export logs in audit_logs
- Mass actions logged in audit_logs

## Best Practices

1. **Review Before Export** - check user list before exporting
2. **Test Mailings** - test on small group first
3. **Personalize Messages** - use user data for personalization
4. **Track Results** - measure campaign effectiveness
5. **GDPR Compliance** - respect user communication preferences
6. **Unsubscribe** - always include unsubscribe option
7. **Frequency Caps** - limit message frequency
8. **Segment Refresh** - segments update on page load

## Related Features

- User management (`/admin/users`)
- User history (`/admin/users/[id]/history`)
- Audit logs (`/admin/logs`)
- Admin notes (`/admin/users/[id]`)

## Dependencies

- **supabase** - database queries
- **lucide-react** - icons
- **next/link** - navigation

## Notes

- Segments calculated on page load (real-time)
- No segment data stored in database
- Users can be in multiple segments
- VIP threshold: 100,000 rub (configurable)
- Top rating threshold: 4.8 (configurable)
- Inactive period: 30 days (configurable)
- Newbie threshold: 5 shifts (configurable)
- CSV uses Russian column names
- All monetary values in rubles
