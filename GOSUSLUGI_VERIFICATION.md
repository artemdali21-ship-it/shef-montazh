# Компонент Госуслуги Верификации (Gosuslugi Button)

## Обзор

Компонент `GosuslugiButton` предоставляет интерактивную кнопку для верификации пользователей через Госуслуги (Russian State Services). Компонент поддерживает два состояния: непроверенный (unverified) и проверенный (verified).

## Структура

```
components/verification/
├── GosuslugiButton.tsx          # Основной компонент
├── index.ts                     # Exports
└── README.md                    # Документация
```

## Компоненты

### 1. GosuslugiButton

Основная кнопка верификации с двумя состояниями.

**Props:**
```typescript
interface GosuslugiButtonProps {
  isVerified: boolean      // Статус верификации
  onVerify: () => void    // Callback при клике на верификацию
  compact?: boolean       // Компактный режим (для карточек)
}
```

**Unverified State:**
- Синий градиент (#0066FF → #0052CC)
- ShieldCheck иконка
- Glassmorphism design с backdrop blur
- Hover эффект: scale-105 + brightness увеличение
- Текст: "Подтвердить через Госуслуги"

**Verified State:**
- Зелёный фон (#10B981)
- CheckCircle2 иконка
- Компактный размер
- Текст: "Верифицирован через Госуслуги"

**Пример:**
```tsx
<GosuslugiButton 
  isVerified={isVerified} 
  onVerify={() => {
    // Open OAuth flow or trigger verification
    setIsVerified(true)
  }} 
/>
```

### 2. GosuslugiVerificationBadge

Компактный бейдж для отображения в карточках пользователей (top-right corner).

**Props:**
```typescript
interface GosuslugiVerificationBadgeProps {
  isVerified: boolean  // Показывает ли бейдж
}
```

**Стиль:**
- Зелёный градиент фон
- Glassmorphism с backdrop blur
- CheckCircle2 иконка
- Текст: "Верифицирован"
- Размер: small (для карточек)

**Пример:**
```tsx
<div style={{ position: 'relative' }}>
  <GosuslugiVerificationBadge isVerified={worker.isGosuslugiVerified} />
  {/* Card content */}
</div>
```

### 3. UserProfileCard

Компонент карточки пользователя с встроенным бейджем Госуслуги верификации.

**Props:**
```typescript
interface UserProfileCardProps {
  name: string
  specialization: string
  rating: number
  completedJobs: number
  location: string
  isGosuslugiVerified: boolean
  onClick?: () => void
}
```

**Пример:**
```tsx
<UserProfileCard
  name="Иван Петров"
  specialization="Монтажник"
  rating={4.9}
  completedJobs={47}
  location="Москва"
  isGosuslugiVerified={true}
  onClick={() => navigateToProfile(worker.id)}
/>
```

## Использование

### На странице профиля (/profile)

```tsx
import { GosuslugiButton } from '@/components/verification'
import { useState } from 'react'

export default function ProfileScreen() {
  const [isVerified, setIsVerified] = useState(false)

  return (
    <div>
      <GosuslugiButton
        isVerified={isVerified}
        onVerify={() => {
          // Здесь должен быть OAuth flow с Госуслугами
          console.log('Opening Gosuslugi OAuth flow')
          // window.location.href = 'https://esia.gosuslugi.ru/...';
          setIsVerified(true)
        }}
      />
    </div>
  )
}
```

### В поиске / Результатах поиска

```tsx
import { UserProfileCard } from '@/components/UserProfileCard'

export default function SearchResults() {
  const workers = [...]

  return (
    <div>
      {workers.map(worker => (
        <UserProfileCard
          key={worker.id}
          name={worker.name}
          specialization={worker.specialization}
          rating={worker.rating}
          completedJobs={worker.completedJobs}
          location={worker.location}
          isGosuslugiVerified={worker.isGosuslugiVerified}
          onClick={() => router.push(`/profile/${worker.id}`)}
        />
      ))}
    </div>
  )
}
```

### Компактный режим

```tsx
<GosuslugiButton
  isVerified={isGosuslugiVerified}
  onVerify={() => handleVerification()}
  compact={true}  // Меньший размер для карточек
/>
```

## Дизайн

### Цветовая палитра
- **Unverified Button**: Синий градиент (#0066FF → #0052CC)
- **Verified Badge**: Зелёный (#10B981)
- **Border**: White/40% для glassmorphism
- **Text**: White (#FFFFFF)

### Анимации
- Hover: scale-105 + brightness-120
- Active: scale-95
- Ripple effect на hover (опционально)
- Smooth transitions (300ms)

### Иконки (lucide-react)
- **Unverified**: ShieldCheck
- **Verified**: CheckCircle2

## Демонстрация

Посетите `/gosuslugi-demo` для интерактивной демонстрации всех компонентов:
- Кнопка верификации (все состояния)
- Компактный режим
- Карточки пользователей с бейджами
- Live примеры с переключением состояний

## Интеграция с OAuth

Для полной интеграции с Госуслугами:

```tsx
const handleVerify = async () => {
  // 1. Открыть Госуслуги OAuth window
  const clientId = process.env.NEXT_PUBLIC_GOSUSLUGI_CLIENT_ID
  const redirectUri = `${window.location.origin}/api/gosuslugi/callback`
  
  window.location.href = `https://esia.gosuslugi.ru/aas/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`

  // 2. На callback странице обменять код на токен
  // 3. Сохранить статус верификации в БД
  // 4. Обновить UI
}
```

## Тестирование

Компонент полностью готов к использованию и включает:
- TypeScript типизацию
- Accessibility (ARIA labels)
- Mobile-friendly дизайн
- Smooth transitions и animations
- Error handling

## Файлы проекта

- `components/verification/GosuslugiButton.tsx` - Основной компонент
- `components/verification/index.ts` - Экспорты
- `components/UserProfileCard.tsx` - Карточка пользователя
- `app/gosuslugi-demo/page.tsx` - Демонстрационная страница
- `components/ProfileScreen.tsx` - Интегрирован в профиль

---

**Версия:** 1.0.0  
**Последнее обновление:** 2026-01-28
