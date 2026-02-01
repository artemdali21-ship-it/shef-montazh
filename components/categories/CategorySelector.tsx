'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/constants/categories'
import { Check } from 'lucide-react'

interface Props {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
  maxSelection?: number
  label?: string
  description?: string
}

export default function CategorySelector({
  selectedCategories,
  onChange,
  maxSelection,
  label = 'Категории специализации',
  description
}: Props) {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Remove category
      onChange(selectedCategories.filter(id => id !== categoryId))
    } else {
      // Add category (check max selection)
      if (maxSelection && selectedCategories.length >= maxSelection) {
        return
      }
      onChange([...selectedCategories, categoryId])
    }
  }

  return (
    <div>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
          {maxSelection && (
            <span className="text-gray-400 font-normal ml-2">
              (выберите до {maxSelection})
            </span>
          )}
        </label>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-400 mb-3">{description}</p>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategories.includes(category.id)
          const isDisabled = !isSelected && maxSelection && selectedCategories.length >= maxSelection

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-xl border transition-all
                ${isSelected
                  ? `${category.bgColor} ${category.borderColor} ${category.color}`
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <Check size={14} className="text-gray-900" />
                </div>
              )}

              {/* Icon */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? category.bgColor : 'bg-white/5'}`}>
                  <Icon size={20} className={isSelected ? category.color : 'text-gray-400'} />
                </div>
                <span className="text-sm font-medium text-center">
                  {category.name}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selection Count */}
      {maxSelection && (
        <div className="mt-3 text-sm text-gray-400">
          Выбрано: {selectedCategories.length} из {maxSelection}
        </div>
      )}
    </div>
  )
}
