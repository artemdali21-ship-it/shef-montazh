# Admin Financial Reporting

## Overview

Детальная финансовая отчётность для администратора платформы. Показывает общую выручку, комиссии платформы, выплаты исполнителям, график роста по месяцам, последние транзакции и возможность экспорта в CSV.

## Files Created

### New Files:
- `app/admin/finance/page.tsx` - главная страница финансовой отчётности
- `components/admin/RevenueChart.tsx` - bar chart с выручкой и комиссиями по месяцам
- `components/admin/TransactionsTable.tsx` - таблица последних транзакций
- `components/admin/ExportButton.tsx` - кнопка экспорта отчёта в CSV

### Modified Files:
- `components/admin/AdminSidebar.tsx` - добавлен пункт меню "Финансы"

## Features

### 1. **Key Metrics Cards**

3 основные метрики:
- **Общая выручка** - сумма всех оплаченных платежей (DollarSign icon, green)
- **Комиссии платформы** - сумма всех комиссий платформы (TrendingUp icon, orange)
- **Выплачено исполнителям** - сумма выплат исполнителям (amount - platform_fee) (ArrowUpRight icon, blue)

### 2. **Revenue Chart (Выручка по месяцам)**

BarChart с recharts:
- Два столбца на каждый месяц: выручка и комиссия
- Зелёный цвет (#10B981) для выручки
- Оранжевый цвет (#E85D2F) для комиссий
- Ось Y показывает значения в тысячах (15k)
- Tooltip с детальными суммами
- Legend для различия между выручкой и комиссией
- Rounded corners на столбцах (radius: [8, 8, 0, 0])

### 3. **Transactions Table (Последние транзакции)**

Таблица с 7 колонками:
- **Дата** - дата и время создания транзакции
- **Смена** - название смены
- **Клиент** - имя клиента с красной стрелкой вверх (расход)
- **Исполнитель** - имя исполнителя с зелёной стрелкой вниз (доход)
- **Сумма** - общая сумма платежа
- **Комиссия** - комиссия платформы (оранжевый цвет)
- **Статус** - статус платежа с цветной меткой

Статусы:
- **Оплачено** (paid/succeeded) - зелёная метка
- **Ожидает** (pending) - жёлтая метка
- **Отклонено** (failed) - красная метка

Лимит: последние 20 транзакций

### 4. **Export to CSV**

Кнопка "Скачать отчёт" в правом верхнем углу:
- Экспортирует все платежи в CSV формат
- Колонки: Дата, Сумма (₽), Комиссия (₽), Выплата исполнителю (₽)
- Добавляет строку с итогами внизу файла
- UTF-8 кодировка с BOM для корректного отображения в Excel
- Имя файла: `finance_report_YYYY-MM-DD.csv`
- Disabled когда нет данных

## Data Calculation

### Total Revenue:
```typescript
const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
```

### Total Fees:
```typescript
const totalFees = payments.reduce((sum, p) => sum + Number(p.platform_fee), 0)
```

### Total Payouts:
```typescript
const totalPayouts = payments.reduce((sum, p) =>
  sum + (Number(p.amount) - Number(p.platform_fee)), 0
)
```

### Monthly Revenue:
```typescript
const monthlyData = data.reduce((acc, payment) => {
  const month = format(payment.created_at, 'MMM YYYY')

  if (!acc[month]) {
    acc[month] = { revenue: 0, fees: 0 }
  }

  acc[month].revenue += payment.amount
  acc[month].fees += payment.platform_fee

  return acc
}, {})
```

## Database Queries

### Finance Stats Query:
```typescript
const { data: payments } = await supabase
  .from('payments')
  .select('amount, platform_fee, created_at, status')
  .eq('status', 'paid')
```

### Transactions Query:
```typescript
const { data } = await supabase
  .from('payments')
  .select(`
    id,
    amount,
    platform_fee,
    status,
    created_at,
    shift:shift_id (title),
    client:client_id (full_name),
    worker:worker_id (full_name)
  `)
  .order('created_at', { ascending: false })
  .limit(20)
```

## CSV Export Format

```csv
Дата,Сумма (₽),Комиссия (₽),Выплата исполнителю (₽)
31.01.2026 14:30,15000,1500,13500
30.01.2026 10:15,20000,2000,18000
...

ИТОГО,235000,23500,211500
```

Features:
- BOM prefix (\uFEFF) for UTF-8 encoding
- Comma-separated values
- Totals row at the end
- Date format: DD.MM.YYYY HH:mm
- Automatic download with timestamp in filename

## UI Components

### Metric Card:
```
┌─────────────────────┐
│ [Icon in green bg]  │ (DollarSign/TrendingUp/ArrowUpRight)
│ 235k ₽              │ (Value - large, bold, white)
│ Общая выручка       │ (Label - small, gray)
└─────────────────────┘
```

### Chart Container:
```
┌─────────────────────────────────┐
│ Выручка по месяцам              │ (Title - white, semibold)
│                                 │
│ [BarChart with bars]            │ (300px height)
│   Revenue | Fees                │ (Legend)
└─────────────────────────────────┘
```

### Transaction Row:
```
┌───────────────────────────────────────────────────────────┐
│ 31 янв, 14:30 | Монтаж... | ↗ Иван П. | ↙ Петр С. | ... │
└───────────────────────────────────────────────────────────┘
```

## Styling

- Dark theme with glassmorphism (bg-white/5, backdrop-blur-xl)
- Border: border-white/10
- Revenue bar: green (#10B981)
- Fees bar: orange (#E85D2F)
- Client arrow: red (expense indicator)
- Worker arrow: green (payout indicator)
- Status badges with appropriate colors
- Hover effects on table rows (hover:bg-white/5)

## Responsive Design

- **Mobile**: Cards stack vertically, table scrolls horizontally
- **Tablet (md+)**: 3 columns for metric cards
- **Desktop**: Full width table, optimized spacing

## Navigation

Added to AdminSidebar:
```typescript
{ href: '/admin/finance', label: 'Финансы', icon: DollarSign }
```

## Access Control

Handled by admin layout:
- Checks authentication
- Verifies admin or shef role
- Redirects unauthorized users

## Testing Checklist

- [ ] Load finance page with 0 payments
- [ ] Load finance page with payments
- [ ] Revenue chart displays correctly
- [ ] Monthly grouping works correctly
- [ ] Transactions table loads last 20
- [ ] Status colors display correctly
- [ ] Export CSV button works
- [ ] CSV file downloads with correct format
- [ ] CSV opens correctly in Excel
- [ ] UTF-8 characters display properly in CSV
- [ ] Totals row in CSV calculates correctly
- [ ] Empty state when no payments
- [ ] Loading states display
- [ ] Client/worker names display in transactions
- [ ] Shift titles display in transactions
- [ ] Date formatting correct
- [ ] Responsive layout works

## Future Enhancements

1. **Date Range Filter** - фильтр по периоду
2. **Advanced Analytics** - глубокая аналитика
3. **Revenue Forecasting** - прогнозирование выручки
4. **Payment Method Breakdown** - разбивка по методам оплаты
5. **Refunds Tracking** - отслеживание возвратов
6. **Commission Settings** - настройка комиссий
7. **Automated Reports** - автоматическая отправка отчётов
8. **Excel Export** - экспорт в XLSX формат
9. **PDF Reports** - PDF отчёты с графиками
10. **Email Reports** - отправка отчётов на email
11. **Real-time Updates** - real-time обновление данных
12. **Comparison Mode** - сравнение периодов
13. **Category Breakdown** - разбивка по категориям работ
14. **Geographic Analysis** - анализ по регионам
15. **Worker Performance** - анализ производительности исполнителей

## Related Features

- Admin dashboard (`/admin`)
- Payments management (can be integrated)
- User management (`/admin/users`)
- Disputes (`/admin/disputes`)

## Performance Notes

- Server component for main page (fast initial load)
- Client components for interactive parts (chart, table, export)
- Transactions limited to 20 for performance
- CSV export happens client-side (no server load)
- Consider pagination for large transaction lists
- Consider caching for frequently accessed stats

## Dependencies

- **recharts** - ^2.15.4 (for BarChart)
- **lucide-react** - for icons
- **supabase-client** - for client-side data fetching
- **supabase-server** - for server-side data fetching

## Notes

- Only counts **paid** payments for stats
- Platform fee is separate column in payments table
- Payouts calculated as: amount - platform_fee
- Monthly grouping uses payment created_at date
- Transactions sorted by created_at descending
- CSV uses locale formatting for dates
- All monetary values formatted with toLocaleString('ru-RU')
- Dark theme maintained throughout
- Server component for initial data, client components for interactivity
