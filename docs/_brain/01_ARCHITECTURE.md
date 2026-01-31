# 01_ARCHITECTURE.md

> **Последнее обновление:** 31.01.2026  
> **Статус:** В разработке (MVP)

---

## 🏗️ ТЕХНИЧЕСКИЙ СТЕК

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Telegram:** Telegram Mini Apps SDK

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (5GB бесплатно)
- **API:** Next.js API Routes + Supabase Edge Functions
- **Realtime:** Supabase Realtime (для чатов)

### Платежи и интеграции
- **Payments:** ЮКасса API (после регистрации ИП)
- **Auth:** Госуслуги ID (OAuth 2.0) - в планах
- **Notifications:** Telegram Bot API

### Инфраструктура
- **Hosting:** Vercel (Hobby tier)
- **CDN:** Vercel Edge Network
- **SSL:** Автоматический (Vercel)

---

## 📁 СТРУКТУРА ПРОЕКТА

```
shef-montazh/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Группа: авторизация
│   │   ├── login/
│   │   └── register/
│   ├── (worker)/                 # Группа: исполнитель
│   │   ├── dashboard/
│   │   ├── search/
│   │   ├── shifts/[id]/
│   │   └── profile/
│   ├── (client)/                 # Группа: заказчик
│   │   ├── dashboard/
│   │   ├── shifts/create/
│   │   ├── shifts/[id]/
│   │   └── workers/
│   ├── (shef)/                   # Группа: шеф-монтажник
│   │   ├── dashboard/
│   │   ├── teams/
│   │   └── monitoring/
│   ├── api/                      # API routes
│   │   ├── shifts/
│   │   ├── applications/
│   │   ├── payments/
│   │   ├── webhooks/yukassa/
│   │   └── notifications/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                       # Базовые компоненты
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── features/                 # Фичевые компоненты
│   │   ├── shift/
│   │   ├── worker/
│   │   ├── rating/
│   │   └── payment/
│   └── layouts/
│
├── lib/
│   ├── supabase.ts
│   ├── supabase-types.ts
│   ├── telegram.ts
│   ├── payments.ts
│   ├── notifications.ts
│   └── utils.ts
│
├── docs/
│   ├── _brain/                   # 🧠 СИСТЕМА ЗНАНИЙ
│   │   ├── 00_CONTEXT.md
│   │   ├── 01_ARCHITECTURE.md    # ← ВЫ ЗДЕСЬ
│   │   ├── 02_DATA_MODEL.md
│   │   ├── 03_STATE_MACHINES.md
│   │   ├── 04_DECISIONS_LOG.md
│   │   ├── 05_BACKLOG.md
│   │   └── 06_KNOWN_ISSUES.md
│   └── CURRENT_STATUS.md
│
├── .env.local
├── package.json
└── next.config.js
```

---

## 🎨 ПАТТЕРНЫ И СОГЛАШЕНИЯ

### Naming Conventions
```typescript
// Компоненты: PascalCase
UserProfile.tsx

// Функции: camelCase
getUserData()

// Константы: UPPER_SNAKE_CASE
MAX_SHIFTS = 20

// Файлы: kebab-case
user-profile.tsx
```

### Структура компонента
```typescript
// 1. Imports
import { useState } from 'react'

// 2. Types
interface ShiftCardProps {
  shift: Shift
  onApply: (id: string) => void
}

// 3. Component
export function ShiftCard({ shift, onApply }: ShiftCardProps) {
  const [loading, setLoading] = useState(false)
  
  const handleApply = async () => {
    setLoading(true)
    await onApply(shift.id)
    setLoading(false)
  }
  
  return (
    <Card>
      <h3>{shift.title}</h3>
      <Button onClick={handleApply} loading={loading}>
        Откликнуться
      </Button>
    </Card>
  )
}
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Row Level Security (RLS)
Включено на всех таблицах Supabase.

Примеры политик:
```sql
-- Worker видит только свои отклики
CREATE POLICY "Workers see own applications"
ON applications FOR SELECT
TO authenticated
USING (worker_id = auth.uid());

-- Client видит отклики на свои смены
CREATE POLICY "Clients see applications for their shifts"
ON applications FOR SELECT
TO authenticated
USING (
  shift_id IN (
    SELECT id FROM shifts WHERE client_id = auth.uid()
  )
);
```

### Environment Variables
```bash
# .env.local (НИКОГДА не коммитить!)

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=xxx

YUKASSA_SHOP_ID=xxx
YUKASSA_SECRET_KEY=xxx

GOSUSLUGI_CLIENT_ID=xxx
GOSUSLUGI_CLIENT_SECRET=xxx
```

---

## 🌐 API ENDPOINTS

### Shifts
```
GET    /api/shifts              # Список смен
POST   /api/shifts              # Создать смену
GET    /api/shifts/[id]         # Детали смены
PATCH  /api/shifts/[id]         # Обновить смену
DELETE /api/shifts/[id]         # Удалить смену
```

### Applications
```
GET    /api/applications        # Мои отклики
POST   /api/applications        # Откликнуться
PATCH  /api/applications/[id]   # Одобрить/отклонить
```

### Ratings
```
POST   /api/ratings             # Оценить
GET    /api/ratings/[userId]    # Рейтинг пользователя
```

### Payments
```
POST   /api/payments/create     # Создать платёж
POST   /api/webhooks/yukassa    # Webhook от ЮКасса
```

---

## 🔌 ИНТЕГРАЦИИ

### 1. Telegram Mini Apps
```typescript
import { WebApp } from '@twa-dev/sdk'

export const tg = WebApp

tg.ready()
tg.expand()
tg.MainButton.setText('Откликнуться')
tg.MainButton.onClick(() => handleApply())
tg.HapticFeedback.impactOccurred('medium')
```

### 2. ЮКасса
```typescript
import { YooKassa } from '@a2seven/yoo-checkout'

export const yukassa = new YooKassa({
  shopId: process.env.YUKASSA_SHOP_ID!,
  secretKey: process.env.YUKASSA_SECRET_KEY!
})
```

### 3. Госуслуги ID (в планах)
OAuth 2.0 flow для получения верифицированных данных пользователя.

---

## 🚀 ДЕПЛОЙ

### Окружения
```
Development:  localhost:3000
Preview:      xxx.vercel.app
Production:   shef-montazh.vercel.app
```

### CI/CD
- Push в `main` → автодеплой на Vercel
- Pull Request → preview URL
- Instant rollback через Vercel dashboard

---

## 📊 МОНИТОРИНГ

### Must-have
- **Sentry** - ошибки (10k events/мес бесплатно)
- **UptimeRobot** - uptime (50 мониторов бесплатно)
- **Vercel Analytics** - performance (встроенное)

---

## 📱 TELEGRAM MINI APP СПЕЦИФИКА

### Main Button
```typescript
tg.MainButton.setText('Откликнуться')
tg.MainButton.color = '#E85D2F'
tg.MainButton.show()
```

### Haptic Feedback
```typescript
tg.HapticFeedback.notificationOccurred('success')
tg.HapticFeedback.impactOccurred('medium')
```

### Safe Area
```css
padding-top: env(safe-area-inset-top);
padding-bottom: calc(16px + env(safe-area-inset-bottom));
```

---

## 🎯 ПРОИЗВОДИТЕЛЬНОСТЬ

### Цели
- **Lighthouse Score:** >90
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Bundle size:** <200KB (gzipped)

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Telegram Mini Apps: https://core.telegram.org/bots/webapps
- ЮКасса API: https://yookassa.ru/developers

---

**Этот файл - техническая карта проекта.**
