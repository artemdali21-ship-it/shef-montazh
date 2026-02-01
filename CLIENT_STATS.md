# Client Statistics Dashboard

## Overview

Расширенная статистика для заказчика с визуализацией данных через recharts. Показывает ключевые метрики по смонтированным сменам, расходам, оценкам исполнителей и топ-5 лучших работников.

## Files Created

### New Files:
- `app/client/stats/page.tsx` - главная страница статистики для клиента
- `components/stats/SpendingChart.tsx` - график расходов по месяцам (LineChart)
- `components/stats/TopWorkers.tsx` - топ-5 исполнителей по количеству смен

## Features

### 1. **Key Metrics Cards**

4 основные метрики в карточках:
- **Опубликовано смен** - общее количество созданных смен (Calendar icon, blue)
- **Потрачено** - общая сумма расходов на завершенные смены в тысячах рублей (DollarSign icon, red)
- **Средняя оценка** - средняя оценка, выставленная исполнителям (Star icon, yellow)
- **Успешных смен** - процент завершенных смен от общего числа (CheckCircle icon, green)

### 2. **Spending Chart (Расходы по месяцам)**

LineChart с recharts:
- Показывает расходы за последние 6 месяцев
- Ось X: месяцы (Янв 2025, Фев 2025, etc.)
- Ось Y: сумма в рублях с форматированием
- Red line (#ef4444) для расходов
- Tooltip с темным фоном
- Grid с полупрозрачными линиями

### 3. **Top Workers (ТОП-5 исполнителей)**

Список лучших исполнителей:
- Ранжирование по количеству завершенных смен
- Номер места в оранжевом бейдже
- Аватар или инициалы исполнителя
- Имя исполнителя
- Рейтинг со звездочкой
- Количество смен

## Data Calculation

### Total Shifts:
```typescript
const { count: totalShifts } = await supabase
  .from('shifts')
  .select('*', { count: 'exact', head: true })
  .eq('client_id', user.id)
```

### Total Spending:
```typescript
const { data: completedShifts } = await supabase
  .from('shifts')
  .select('price')
  .eq('client_id', user.id)
  .eq('status', 'completed')

const totalSpending = completedShifts?.reduce((sum, s) => sum + (s.price || 0), 0) || 0
```

### Average Rating:
```typescript
const { data: ratings } = await supabase
  .from('worker_ratings')
  .select('rating')
  .eq('client_id', user.id)

const avgRating = ratings && ratings.length > 0
  ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
  : 0
```

### Success Rate:
```typescript
const { count: completedCount } = await supabase
  .from('shifts')
  .select('*', { count: 'exact', head: true })
  .eq('client_id', user.id)
  .eq('status', 'completed')

const successRate = totalShifts && completedCount
  ? (completedCount / totalShifts) * 100
  : 0
```

### Top Workers:
```typescript
// Get all shift_workers for client's completed shifts
const { data: shiftWorkers } = await supabase
  .from('shift_workers')
  .select(`
    worker_id,
    shift:shifts!inner (
      id,
      client_id
    ),
    worker:users (
      id,
      full_name,
      avatar_url,
      worker_profiles (
        rating
      )
    )
  `)
  .eq('shift.client_id', userId)
  .eq('status', 'completed')

// Count shifts per worker, sort by count, take top 5
```

### Monthly Spending:
```typescript
// Get all completed shifts
const { data: shifts } = await supabase
  .from('shifts')
  .select('id, date, price')
  .eq('client_id', userId)
  .eq('status', 'completed')

// Group by month
shifts?.forEach(shift => {
  const monthKey = format(shift.date, 'MMM YYYY')
  monthlySpending[monthKey] += shift.price || 0
})
```

## Database Queries

### Main Stats Query:
Multiple queries for different metrics:
1. Total shifts count
2. Completed shifts with prices
3. Worker ratings from client
4. Completed shifts count for success rate

### Spending Chart Query:
```typescript
supabase
  .from('shifts')
  .select('id, date, price')
  .eq('client_id', userId)
  .eq('status', 'completed')
  .order('date', { ascending: true })
```

### Top Workers Query:
```typescript
supabase
  .from('shift_workers')
  .select(`
    worker_id,
    shift:shifts!inner (id, client_id),
    worker:users (
      id,
      full_name,
      avatar_url,
      worker_profiles (rating)
    )
  `)
  .eq('shift.client_id', userId)
  .eq('status', 'completed')
```

## Empty State

Когда у клиента нет созданных смен:
- Иконка Calendar (серая)
- Заголовок: "Статистика пока недоступна"
- Описание: "Создайте первую смену, чтобы увидеть вашу статистику"
- CTA кнопка: "Создать смену" → `/create-shift`

## UI Components

### Metric Card Structure:
```
┌─────────────────────┐
│ [Icon in colored bg]│ (Calendar/DollarSign/Star/CheckCircle)
│ 42                  │ (Value - large, bold, white)
│ Опубликовано смен   │ (Label - small, gray)
└─────────────────────┘
```

### Chart Container:
```
┌─────────────────────────────────┐
│ Расходы по месяцам              │ (Title - white, semibold)
│                                 │
│ [LineChart with data]           │ (300px height)
│                                 │
└─────────────────────────────────┘
```

### Top Worker Row:
```
┌─────────────────────────────────┐
│ [1] [Avatar] Иван Петров        │
│              ⭐ 4.8      5 смен  │
└─────────────────────────────────┘
```

## Styling

- Dark theme with glassmorphism (bg-white/5, backdrop-blur-xl)
- Border: border-white/10
- Icons with colored backgrounds (bg-{color}-500/10)
- Icon colors: blue-400, red-400, yellow-400, green-400
- Spending line: red (#ef4444) to indicate expenses
- Consistent with the rest of the app

## Responsive Design

- **Mobile (default)**: 2 columns for metric cards
- **Tablet (md+)**: 4 columns for metric cards
- **Desktop (lg+)**: 2 columns for charts side by side
- Charts stack vertically on mobile

## Navigation

Added link to client profile page in "Quick actions":
```typescript
<button onClick={() => router.push('/client/stats')}>
  Статистика
</button>
```

## Differences from Worker Stats

### Client Focus:
- **Spending** instead of Earnings (red color, shows money going out)
- **Published shifts** instead of Completed shifts
- **Success rate** (% of completed shifts)
- **Average rating given** (to workers) instead of received
- **Top workers** instead of Top clients

### Metrics Orientation:
- Client perspective: money spent, shifts created
- Shows performance of hired workers
- Success rate indicates how many shifts were completed successfully

## Testing Checklist

- [ ] Load stats with 0 shifts (empty state)
- [ ] Load stats with 1 shift
- [ ] Load stats with 10+ completed shifts
- [ ] Monthly spending chart displays correctly
- [ ] Top workers shows up to 5 workers
- [ ] Top workers sorted by shift count
- [ ] Success rate calculation correct
- [ ] Average rating calculation correct
- [ ] Total spending only counts completed shifts
- [ ] Responsive layout on mobile
- [ ] Tooltips work on charts
- [ ] Back button navigates to profile
- [ ] Empty state CTA button works
- [ ] Loading state displays while fetching data

## Future Enhancements

1. **Date Range Filter** - выбор периода для статистики
2. **Worker Performance Details** - клик на исполнителя показывает детали
3. **Category Breakdown** - расходы по категориям работ
4. **Cost Comparison** - сравнение расходов с предыдущим периодом
5. **Budget Tracking** - установка бюджета и отслеживание
6. **Export Reports** - экспорт статистики в PDF/Excel
7. **Shift Timeline** - временная шкала смен
8. **Payment Analytics** - анализ платежей
9. **Cost per Category** - средняя стоимость по категориям
10. **Recurring Expenses** - регулярные затраты

## Related Features

- Client profile (`/client/profile`)
- Create shift (`/create-shift`)
- Shifts list (`/client/shifts`)
- Worker ratings (`worker_ratings` table)
- Payments history (`/client/payments`)

## Performance Notes

- All calculations done on client side from fetched data
- Multiple separate DB queries for different metrics
- Charts fetch their own data independently
- Consider caching for frequently accessed stats
- Consider server-side aggregation for large datasets

## Dependencies

- **recharts** - ^2.15.4 (already installed)
- **lucide-react** - for icons
- **supabase-client** - for data fetching

## Notes

- Only counts **completed** shifts for spending and worker stats
- Success rate uses all shifts (not just completed)
- Worker ratings from `worker_ratings` table with `client_id`
- Monthly spending grouped by shift date
- Top workers limited to 5 for better UX
- All monetary values formatted with toLocaleString('ru-RU')
- Dark theme maintained throughout
- Charts load independently with their own loading states
