'use client'

import { Search, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EmptyShiftsProps {
  userType: 'worker' | 'client'
  onOpenFilters?: () => void
}

export function EmptyShifts({ userType, onOpenFilters }: EmptyShiftsProps) {
  const router = useRouter()

  if (userType === 'client') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-12 text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-[#E85D2F]/10 rounded-full flex items-center justify-center mb-6">
          <Plus className="w-16 h-16 text-[#E85D2F]" />
        </div>

        {/* Title */}
        <h2 className="text-h2 text-white mb-3">
          Создайте первую смену
        </h2>

        {/* Description */}
        <p className="text-body text-gray-400 mb-8 max-w-sm">
          Найдите нужных специалистов за 5 минут
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/shifts/create')}
          className="min-h-[56px] px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-white font-bold text-body-large shadow-lg shadow-orange-500/30 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Создать смену
        </button>
      </div>
    )
  }

  // Worker view
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-12 text-center">
      {/* Icon */}
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <Search className="w-16 h-16 text-gray-400" />
      </div>

      {/* Title */}
      <h2 className="text-h2 text-white mb-3">
        Пока нет доступных смен
      </h2>

      {/* Description */}
      <p className="text-body text-gray-400 mb-8 max-w-sm">
        Новые смены появятся здесь. Мы уведомим вас в Telegram!
      </p>

      {/* CTA Button */}
      {onOpenFilters && (
        <button
          onClick={onOpenFilters}
          className="min-h-[56px] px-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-body-large transition-all duration-200 flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          Настроить фильтры
        </button>
      )}
    </div>
  )
}
