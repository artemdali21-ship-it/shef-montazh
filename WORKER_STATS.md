# Worker Statistics Dashboard

## Overview

Детальная статистика для исполнителя с визуализацией данных через recharts. Показывает ключевые метрики, графики доходов, распределение по категориям, динамику рейтинга и топ клиентов.

## Files Created

### New Files:
- `app/worker/stats/page.tsx` - главная страница статистики
- `components/stats/EarningsChart.tsx` - график доходов по месяцам (LineChart)
- `components/stats/ShiftsBreakdown.tsx` - распределение смен по категориям (PieChart)
- `components/stats/RatingTrend.tsx` - динамика рейтинга (LineChart)

## Features

### 1. **Key Metrics Cards**

4 основные метрики в карточках:
- **Завершено смен** - общее количество завершенных смен (Calendar icon, blue)
- **Заработано** - общая сумма заработка в рублях (DollarSign icon, green)
- **Средний рейтинг** - средняя оценка от клиентов (Star icon, yellow)
- **Рост за месяц** - процент роста заработка за последние 30 дней vs предыдущие 30 дней (TrendingUp icon, green/red)

### 2. **Earnings Chart (Доходы по месяцам)**

LineChart с recharts:
- Показывает доходы за последние 6 месяцев
- Ось X: месяцы (Янв 2025, Фев 2025, etc.)
- Ось Y: сумма в рублях с форматированием
- Orange line (#f97316) для соответствия бренду
- Tooltip с темным фоном
- Grid с полупрозрачными линиями

### 3. **Shifts Breakdown (Распределение по категориям)**

PieChart с recharts:
- Показывает количество смен по категориям
- Категории: Монтаж, Демонтаж, Отделка, Сантехника, Электрика, Другое
- Уникальные цвета для каждой категории
- Label с процентами
- Legend внизу
- Tooltip с количеством смен

### 4. **Rating Trend (Динамика рейтинга)**

LineChart с recharts:
- Показывает последние 10 оценок
- Ось Y от 0 до 5 (звёздная шкала)
- Yellow line (#eab308) для рейтинга
- Текущий рейтинг в заголовке со звездой
- Даты на оси X

### 5. **Top Clients (Топ клиенты)**

Список из топ-5 клиентов:
- Ранжирование по количеству смен
- Номер места в оранжевом бейдже
- Имя клиента
- Количество смен
- Общая сумма заработка от клиента
- Зелёный цвет для суммы

## Data Calculation

### Growth Percentage:
```typescript
const recentEarnings = shifts (last 30 days)
const previousEarnings = shifts (30-60 days ago)
const growth = ((recent - previous) / previous) * 100
```

### Monthly Earnings:
```typescript
// Group shifts by month
shifts.forEach(s => {
  const month = format(s.date, 'MMM YYYY')
  monthlyEarnings[month] += s.shift.price
})
```

### Category Breakdown:
```typescript
// Count shifts per category
shifts.forEach(s => {
  const category = s.shift.category || 'Другое'
  categoryCount[category] += 1
})
```

### Top Clients:
```typescript
// Aggregate by client
shifts.forEach(s => {
  clientStats[clientId] = {
    name: client.full_name,
    shifts: count,
    earnings: total
  }
})
// Sort by shifts descending, take top 5
```

## Database Queries

### Main Query:
```typescript
supabase
  .from('shift_workers')
  .select(`
    *,
    shift:shifts (
      id,
      title,
      category,
      price,
      date,
      client:client_id (
        id,
        full_name
      )
    ),
    rating:worker_ratings (
      rating,
      created_at
    )
  `)
  .eq('worker_id', user.id)
  .eq('status', 'completed')
```

## Empty State

Когда у worker нет завершенных смен:
- Иконка Calendar (серая)
- Заголовок: "Статистика пока недоступна"
- Описание: "Завершите первую смену, чтобы увидеть вашу статистику"
- CTA кнопка: "Найти смены" → `/worker/shifts`

## Category Colors

```typescript
const CATEGORY_COLORS = {
  'Монтаж': '#f97316',      // orange-500
  'Демонтаж': '#3b82f6',    // blue-500
  'Отделка': '#10b981',     // green-500
  'Сантехника': '#f59e0b',  // amber-500
  'Электрика': '#8b5cf6',   // violet-500
  'Другое': '#ec4899'       // pink-500
}
```

## Recharts Configuration

### Common Tooltip Style:
```typescript
contentStyle={{
  backgroundColor: 'rgba(0,0,0,0.9)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: 'white'
}}
```

### Common Axis Style:
```typescript
stroke="rgba(255,255,255,0.5)"
style={{ fontSize: '12px' }}
```

### Common Grid:
```typescript
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
```

## UI Components

### Metric Card Structure:
```
┌─────────────────────┐
│ [Icon]              │ (Calendar/DollarSign/Star/TrendingUp)
│ 42                  │ (Value - large, bold)
│ Завершено смен      │ (Label - small, gray)
└─────────────────────┘
```

### Chart Container:
```
┌─────────────────────────────────┐
│ Доходы по месяцам               │ (Title - white, semibold)
│                                 │
│ [LineChart with data]           │ (300px height)
│                                 │
└─────────────────────────────────┘
```

### Client Row:
```
┌─────────────────────────────────┐
│ [1] Иван Петров     15,000 ₽   │
│     5 смен                      │
└─────────────────────────────────┘
```

## Responsive Design

- **Mobile (default)**: 2 columns for metric cards
- **Desktop (md+)**: 4 columns for metric cards
- **Charts**: Full width on mobile, 2 columns on desktop for breakdown/rating

## Navigation

Add link to worker profile page in "Quick actions":
```typescript
<button onClick={() => router.push('/worker/stats')}>
  Статистика
</button>
```

## Testing Checklist

- [ ] Load stats with 0 completed shifts (empty state)
- [ ] Load stats with 1 shift
- [ ] Load stats with 10+ shifts
- [ ] Monthly earnings chart displays correctly
- [ ] Category breakdown shows all categories
- [ ] Rating trend with < 10 ratings
- [ ] Rating trend with 10+ ratings (should show last 10)
- [ ] Top clients sorted correctly
- [ ] Growth percentage positive (green)
- [ ] Growth percentage negative (red)
- [ ] Growth percentage when no previous data (0%)
- [ ] Responsive layout on mobile
- [ ] Tooltips work on all charts
- [ ] Back button navigates to profile

## Future Enhancements

1. **Date Range Filter** - выбор периода для статистики
2. **Export to PDF** - скачать отчет в PDF
3. **Comparison Mode** - сравнение периодов
4. **Category Filter** - фильтр по категориям
5. **Client Details** - клик на клиента открывает детали
6. **Weekly View** - разбивка по неделям
7. **Earnings Forecast** - прогноз доходов на основе тренда
8. **Share Stats** - поделиться статистикой (для портфолио)
9. **Goal Setting** - установка целей по доходам
10. **Badges/Achievements** - достижения за метрики

## Related Features

- Worker profile (`/worker/profile`)
- Shift history (`/worker/shifts`)
- Ratings (`/worker/ratings`)
- Payments history (can be integrated)

## Performance Notes

- All calculations done on client side from fetched data
- Single DB query fetches all needed data with joins
- No pagination on initial load (assumes reasonable number of completed shifts)
- Charts render via recharts (optimized React library)
- Consider adding pagination if worker has 100+ completed shifts

## Dependencies

- **recharts** - ^2.15.4 (already installed)
- **lucide-react** - for icons
- **supabase-client** - for data fetching

## Notes

- Only shows completed shifts (status = 'completed')
- Rating data comes from worker_ratings table
- Monthly earnings grouped by shift date (not completion date)
- Categories use shift.category field
- Client aggregation by shift.client_id
- Growth calculation compares 30-day windows
- All monetary values formatted with toLocaleString('ru-RU')
- Dark theme maintained throughout
