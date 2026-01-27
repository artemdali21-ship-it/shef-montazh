## Компонент Госуслуги - Быстрый старт

### Установка и использование

**1. Импорт компонента:**
```tsx
import { GosuslugiButton, GosuslugiVerificationBadge } from '@/components/verification'
```

**2. Использование на странице профиля:**
```tsx
'use client'
import { useState } from 'react'
import { GosuslugiButton } from '@/components/verification'

export default function ProfileScreen() {
  const [isVerified, setIsVerified] = useState(false)

  return (
    <GosuslugiButton
      isVerified={isVerified}
      onVerify={() => {
        // Запустить OAuth flow или другую логику
        setIsVerified(true)
      }}
    />
  )
}
```

**3. Использование в карточках:**
```tsx
import { UserProfileCard } from '@/components/UserProfileCard'

<UserProfileCard
  name="Иван Петров"
  specialization="Монтажник"
  rating={4.9}
  completedJobs={47}
  location="Москва"
  isGosuslugiVerified={true}
/>
```

### Файлы компонента

```
✅ components/verification/GosuslugiButton.tsx     - Основной компонент
✅ components/verification/index.ts                - Экспорты
✅ components/UserProfileCard.tsx                  - Карточка пользователя
✅ components/ProfileScreen.tsx                    - Интегрирован здесь
✅ app/gosuslugi-demo/page.tsx                     - Демонстрация
✅ GOSUSLUGI_VERIFICATION.md                       - Полная документация
```

### Демонстрация

Откройте `/gosuslugi-demo` чтобы увидеть компонент в действии:
- Кнопка верификации (unverified / verified)
- Компактный режим
- Карточки пользователей с бейджами
- Интерактивные примеры

### Особенности

✓ **Glassmorphism дизайн** - Современный вид с backdrop blur  
✓ **Два состояния** - Unverified (синий) и Verified (зелёный)  
✓ **Компактный режим** - Для карточек и малых элементов  
✓ **Бейдж** - Отдельный компонент для карточек пользователей  
✓ **Smooth анимации** - Hover эффекты, transitions  
✓ **Accessible** - ARIA labels, keyboard navigation  
✓ **TypeScript** - Полная типизация  

### Цвета

- **Unverified**: #0066FF → #0052CC (синий градиент)
- **Verified**: #10B981 (зелёный)
- **Border**: rgba(255, 255, 255, 0.4)
- **Text**: #FFFFFF

### Иконки

- **Unverified**: ShieldCheck (lucide-react)
- **Verified**: CheckCircle2 (lucide-react)

---

**Компонент готов к использованию! Интегрирован в ProfileScreen.**
