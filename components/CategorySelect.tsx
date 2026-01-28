'use client'

import { useState } from 'react'
import {
  Wrench,
  Paintbrush,
  Zap,
  Flame,
  Mountain,
  Package,
  HardHat,
} from 'lucide-react'

interface CategorySelectProps {
  onSelect: (categories: string[]) => void
}

const categories = [
  { id: 'montazhnik', name: 'Монтажник', icon: Wrench },
  { id: 'decorator', name: 'Декоратор', icon: Paintbrush },
  { id: 'electrik', name: 'Электрик', icon: Zap },
  { id: 'svarchik', name: 'Сварщик', icon: Flame },
  { id: 'alpinist', name: 'Альпинист', icon: Mountain },
  { id: 'butafor', name: 'Бутафор', icon: Package },
  { id: 'raznorabochiy', name: 'Разнорабочий', icon: HardHat },
]

export default function CategorySelect({ onSelect }: CategorySelectProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleCategory = (id: string) => {
    setSelected(prev => {
      const newSelected = prev.includes(id) ? prev.filter(cat => cat !== id) : [...prev, id]
      onSelect(newSelected)
      return newSelected
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Выберите специализацию</h1>
        <p className="text-white/60 font-medium">Можно выбрать несколько категорий</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map(category => {
          const Icon = category.icon
          const isSelected = selected.includes(category.id)

          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`relative group overflow-hidden rounded-2xl transition-all active:scale-95 ${
                isSelected ? 'ring-2 ring-[#E85D2F]' : ''
              }`}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#E85D2F]/30 to-[#E85D2F]/10'
                    : 'bg-gradient-to-br from-white/5 to-white/[0.02] group-hover:from-white/10 group-hover:to-white/5'
                }`}
              />

              {/* Border */}
              <div
                className={`absolute inset-0 rounded-2xl border transition-all ${
                  isSelected ? 'border-[#E85D2F]' : 'border-white/20 group-hover:border-white/30'
                }`}
              />

              {/* Content */}
              <div className="relative p-4 flex flex-col items-center gap-3 min-h-32 justify-center">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#E85D2F]/20 text-[#E85D2F]'
                      : 'bg-white/10 text-white/60 group-hover:bg-white/15'
                  }`}
                >
                  <Icon size={24} strokeWidth={1.5} />
                </div>

                {/* Text */}
                <span
                  className={`text-sm font-semibold text-center transition-all ${
                    isSelected ? 'text-[#E85D2F]' : 'text-white/80'
                  }`}
                >
                  {category.name}
                </span>

                {/* Checkbox indicator */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#E85D2F] border-[#E85D2F]'
                      : 'border-white/30 group-hover:border-white/50'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
