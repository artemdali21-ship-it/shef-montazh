# Category System

Система категорий специалистов для платформы ШЕФ-МОНТАЖ.

## Категории

- **Монтажник** - Wrench (orange)
- **Декоратор** - Palette (purple)
- **Электрик** - Zap (yellow)
- **Сварщик** - Flame (red)
- **Альпинист** - Mountain (blue)
- **Бутафор** - Paintbrush (pink)
- **Разнорабочий** - HardHat (gray)

## Использование

### CategoryBadge

Отображение одной категории:

```tsx
import CategoryBadge from '@/components/categories/CategoryBadge'

// В профиле исполнителя
<CategoryBadge categoryId="montazhnik" size="md" />

// В карточке смены
<CategoryBadge categoryId="elektrik" size="sm" />

// Outlined вариант
<CategoryBadge categoryId="dekorator" size="md" variant="outlined" />
```

### CategorySelector

Выбор категорий (для формы профиля):

```tsx
'use client'

import { useState } from 'react'
import CategorySelector from '@/components/categories/CategorySelector'

export default function ProfileForm() {
  const [categories, setCategories] = useState<string[]>([])

  return (
    <CategorySelector
      selectedCategories={categories}
      onChange={setCategories}
      maxSelection={3}
      label="Ваши специализации"
      description="Выберите до 3 категорий, в которых вы специализируетесь"
    />
  )
}
```

### Работа с категориями в коде

```tsx
import { CATEGORIES, getCategoryById, getCategoriesByIds } from '@/lib/constants/categories'

// Получить одну категорию
const category = getCategoryById('montazhnik')
console.log(category?.name) // "Монтажник"

// Получить несколько категорий
const userCategories = getCategoriesByIds(['montazhnik', 'elektrik'])
console.log(userCategories.length) // 2

// Отобразить все категории
CATEGORIES.map(cat => (
  <CategoryBadge key={cat.id} categoryId={cat.id} />
))
```

## Интеграция

### В профиле исполнителя

```tsx
import CategoryBadge from '@/components/categories/CategoryBadge'
import { getCategoriesByIds } from '@/lib/constants/categories'

export default function WorkerProfile({ profile }) {
  const categories = getCategoriesByIds(profile.categories || [])

  return (
    <div>
      <h3>Специализации</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <CategoryBadge key={cat.id} categoryId={cat.id} size="md" />
        ))}
      </div>
    </div>
  )
}
```

### В карточке смены

```tsx
import CategoryBadge from '@/components/categories/CategoryBadge'

export default function ShiftCard({ shift }) {
  return (
    <div>
      <h3>{shift.title}</h3>
      {shift.required_category && (
        <CategoryBadge categoryId={shift.required_category} size="sm" />
      )}
    </div>
  )
}
```

### В фильтрах

```tsx
'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/constants/categories'

export default function ShiftFilters() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div>
      <label>Категория</label>
      <select
        value={selectedCategory || ''}
        onChange={(e) => setSelectedCategory(e.target.value || null)}
      >
        <option value="">Все категории</option>
        {CATEGORIES.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

## База данных

В таблице `worker_profiles` категории хранятся как массив ID:

```sql
-- Пример данных
categories: ['montazhnik', 'elektrik']

-- Поиск по категориям
SELECT * FROM worker_profiles
WHERE 'montazhnik' = ANY(categories);

-- Поиск по нескольким категориям
SELECT * FROM worker_profiles
WHERE categories && ARRAY['montazhnik', 'elektrik'];
```

## Размеры

- `sm` - Маленький (14px icon, text-xs)
- `md` - Средний (16px icon, text-sm) - по умолчанию
- `lg` - Большой (20px icon, text-base)

## Варианты

- `default` - С заливкой фона
- `outlined` - Только обводка без заливки
