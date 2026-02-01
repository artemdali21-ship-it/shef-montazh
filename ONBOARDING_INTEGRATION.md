# Onboarding Tour - Интеграция

## 📋 Готовые компоненты

✅ `components/OnboardingTour.tsx` - основной компонент тура
✅ `hooks/useOnboarding.ts` - хук для управления туром

---

## 🎯 Интеграция в страницы

### Worker Dashboard

```tsx
// app/(worker)/dashboard/page.tsx
'use client'

import { OnboardingTour } from '@/components/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function WorkerDashboard() {
  const { showTour, completeTour, skipTour } = useOnboarding('worker')

  return (
    <>
      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour
          role="worker"
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}

      {/* Page Content with data-tour attributes */}
      <div className="container mx-auto p-4">
        <div data-tour="worker-profile">
          <h1>Мой Профиль</h1>
          {/* Profile content */}
        </div>

        <div data-tour="shifts-list">
          <h2>Доступные смены</h2>
          {/* Shifts list */}
        </div>

        <button data-tour="apply-button">
          Откликнуться
        </button>
      </div>
    </>
  )
}
```

---

### Client Dashboard

```tsx
// app/(client)/dashboard/page.tsx
'use client'

import { OnboardingTour } from '@/components/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function ClientDashboard() {
  const { showTour, completeTour, skipTour } = useOnboarding('client')

  return (
    <>
      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour
          role="client"
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}

      {/* Page Content with data-tour attributes */}
      <div className="container mx-auto p-4">
        <button data-tour="create-shift">
          Создать смену
        </button>

        <div data-tour="applications">
          <h2>Отклики на мои смены</h2>
          {/* Applications list */}
        </div>

        <button data-tour="approve-button">
          Одобрить
        </button>
      </div>
    </>
  )
}
```

---

## 🏷️ Data-tour атрибуты

Добавьте `data-tour` атрибуты на элементы страницы:

```tsx
// Worker
<div data-tour="worker-profile">...</div>
<div data-tour="shifts-list">...</div>
<button data-tour="apply-button">...</button>
<button data-tour="checkin-button">...</button>
<div data-tour="balance">...</div>

// Client
<button data-tour="create-shift">...</button>
<div data-tour="applications">...</div>
<button data-tour="approve-button">...</button>
<div data-tour="monitoring">...</div>
<div data-tour="payment">...</div>
```

---

## 🔄 Сброс тура (для тестирования)

```tsx
import { resetOnboardingTour } from '@/components/OnboardingTour'

// В админ панели или настройках
<button onClick={() => resetOnboardingTour('worker')}>
  Сбросить тур для воркеров
</button>

<button onClick={() => resetOnboardingTour('client')}>
  Сбросить тур для клиентов
</button>
```

Или через консоль браузера:
```js
localStorage.removeItem('onboarding_worker_completed')
localStorage.removeItem('onboarding_client_completed')
```

---

## 📊 Analytics (опционально)

Хук автоматически отправляет события в Google Analytics если он подключен:

```js
// Автоматически отправляется при завершении
gtag('event', 'onboarding_completed', { role: 'worker' })

// Автоматически отправляется при пропуске
gtag('event', 'onboarding_skipped', { role: 'worker' })
```

---

## 🎨 Кастомизация

### Изменить шаги тура

Отредактируйте `components/OnboardingTour.tsx`:

```tsx
const WORKER_TOUR_STEPS: TourStep[] = [
  {
    title: 'Ваш новый шаг',
    description: 'Описание нового шага',
    targetSelector: '[data-tour="new-element"]'
  },
  // ...
]
```

### Изменить стиль

Компонент использует Tailwind CSS классы. Измените в `components/OnboardingTour.tsx`:

```tsx
<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
  {/* Ваши стили */}
</div>
```

---

## ✅ Чеклист интеграции

- [ ] Добавить `<OnboardingTour>` на Worker Dashboard
- [ ] Добавить `<OnboardingTour>` на Client Dashboard
- [ ] Добавить `data-tour` атрибуты на ключевые элементы
- [ ] Протестировать тур на Worker странице
- [ ] Протестировать тур на Client странице
- [ ] Добавить кнопку "Показать тур снова" в настройках
- [ ] Проверить что тур не показывается повторно после завершения
- [ ] Проверить что "Больше не показывать" работает

---

## 🐛 Troubleshooting

**Тур не показывается:**
- Проверьте что `useOnboarding` вызывается в client component ('use client')
- Убедитесь что localStorage очищен (сбросьте флаги)
- Проверьте что `role` передан правильно ('worker' или 'client')

**Тур показывается каждый раз:**
- Проверьте что `onComplete` и `onSkip` вызываются
- Убедитесь что localStorage доступен (не в incognito mode)

**Шаги не совпадают с элементами:**
- Добавьте `data-tour` атрибуты на нужные элементы
- Обновите `targetSelector` в конфигурации шагов

---

## 🚀 Готово!

После интеграции новые пользователи будут видеть интерактивный тур при первом входе, что снизит churn и улучшит onboarding experience.
