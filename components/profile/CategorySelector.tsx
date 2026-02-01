'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

const CATEGORIES = [
  { id: 'монтажник', label: 'Монтажник декораций', icon: '/images/skills/stage-builder.png' },
  { id: 'такелажник', label: 'Такелажник / Риггер', icon: '/images/skills/rigging.png' },
  { id: 'альпинист', label: 'Промышленный альпинист', icon: '/images/skills/climber.png' },
  { id: 'грузчик', label: 'Грузчик / Стейдж-грузчик', icon: '/images/skills/loader.png' },
  { id: 'декоратор', label: 'Декоратор / Маляр', icon: '/images/skills/painter.png' },
  { id: 'светотехник', label: 'Светотехник', icon: '/images/skills/lighting.png' },
  { id: 'звукотехник', label: 'Звукотехник', icon: '/images/skills/sound.png' },
  { id: 'видеотехник', label: 'Видео / LED-техник', icon: '/images/skills/video.png' },
  { id: 'электрик', label: 'Электрик (ивент/сцена)', icon: '/images/skills/electrician.png' },
  { id: 'водитель', label: 'Водитель', icon: '/images/skills/driver-wheel.png' },
  { id: 'курьер', label: 'Курьер / Раннер', icon: '/images/skills/courier.png' },
  { id: 'клининг', label: 'Клининг', icon: '/images/skills/cleaner.png' }
]

interface CategorySelectorProps {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

export default function CategorySelector({ selectedCategories, onChange }: CategorySelectorProps) {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId))
    } else {
      onChange([...selectedCategories, categoryId])
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
      <h3 className="text-lg font-bold text-white mb-4">Мои специализации</h3>
      <p className="text-sm text-gray-400 mb-4">
        Выберите категории, в которых вы работаете
      </p>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id)

          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`
                relative flex items-center gap-2 p-3 rounded-xl
                border transition-all min-h-[60px]
                ${isSelected
                  ? 'bg-lime-300/25 border-lime-300'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
            >
              {category.icon.startsWith('/') ? (
                <img
                  src={category.icon}
                  alt={category.label}
                  className="w-7 h-7 object-contain flex-shrink-0"
                  style={{ filter: isSelected ? 'brightness(1.2)' : 'brightness(0.9)' }}
                />
              ) : (
                <span className="text-xl flex-shrink-0">{category.icon}</span>
              )}
              <span className={`text-xs font-medium leading-tight text-left ${isSelected ? 'text-lime-300' : 'text-white'}`}>
                {category.label}
              </span>

              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-lime-300 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-400">
            ✓ Выбрано категорий: {selectedCategories.length}
          </p>
        </div>
      )}
    </div>
  )
}
