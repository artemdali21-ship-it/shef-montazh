'use client'

import { CATEGORIES } from '@/lib/constants/categories'
import { Check } from 'lucide-react'

interface Props {
  selected: string[]
  onChange: (categories: string[]) => void
  variant?: 'compact' | 'expanded'
  showCount?: boolean
}

export default function CategoryFilter({
  selected,
  onChange,
  variant = 'expanded',
  showCount = false
}: Props) {
  const toggle = (categoryId: string) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter(id => id !== categoryId))
    } else {
      onChange([...selected, categoryId])
    }
  }

  if (variant === 'compact') {
    // Grid of buttons (for filters panel)
    return (
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Специализация
          {showCount && selected.length > 0 && (
            <span className="ml-2 text-orange-400">({selected.length})</span>
          )}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(category => {
            const Icon = category.icon
            const isSelected = selected.includes(category.id)

            return (
              <button
                key={category.id}
                onClick={() => toggle(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                  isSelected
                    ? `${category.bgColor} ${category.color} border ${category.borderColor}`
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon size={16} />
                {category.name}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Expanded checkbox list (for dedicated filter section)
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="font-semibold text-white mb-4 flex items-center justify-between">
        <span>Категории</span>
        {showCount && selected.length > 0 && (
          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
            {selected.length}
          </span>
        )}
      </h3>

      <div className="space-y-2">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isSelected = selected.includes(category.id)

          return (
            <label
              key={category.id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                isSelected
                  ? `${category.bgColor} border ${category.borderColor}`
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Checkbox */}
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(category.id)}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                />
                {isSelected && (
                  <Check className="absolute inset-0 m-auto w-3 h-3 text-white pointer-events-none" />
                )}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isSelected ? category.bgColor : 'bg-white/5'
              }`}>
                <Icon size={20} className={isSelected ? category.color : 'text-gray-400'} />
              </div>

              {/* Name */}
              <span className={`flex-1 font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {category.name}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
