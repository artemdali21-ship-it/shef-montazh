'use client'

import {
  Wrench, Palette, Zap, Flame, Mountain, Paintbrush, HardHat
} from 'lucide-react'

interface CategoryBadgesProps {
  categories: string[]
  size?: 'sm' | 'md'
  className?: string
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Монтажник': Wrench,
  'Декоратор': Palette,
  'Электрик': Zap,
  'Сварщик': Flame,
  'Альпинист': Mountain,
  'Бутафор': Paintbrush,
  'Разнорабочий': HardHat,
}

export function CategoryBadges({ categories, size = 'md', className = '' }: CategoryBadgesProps) {
  if (!categories || categories.length === 0) return null

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 gap-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category, index) => {
        const Icon = CATEGORY_ICONS[category] || HardHat

        return (
          <div
            key={index}
            className={`
              inline-flex items-center
              bg-[#E85D2F]/10 border border-[#E85D2F]/30
              rounded-lg font-medium text-[#E85D2F]
              ${sizeClasses[size].container}
              ${sizeClasses[size].text}
            `}
          >
            <Icon className={sizeClasses[size].icon} />
            <span>{category}</span>
          </div>
        )
      })}
    </div>
  )
}
