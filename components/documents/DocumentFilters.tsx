'use client'

import { Filter, X } from 'lucide-react'
import { useState } from 'react'

interface DocumentFiltersProps {
  selectedType: string
  selectedPeriod: string
  onTypeChange: (type: string) => void
  onPeriodChange: (period: string) => void
}

export default function DocumentFilters({
  selectedType,
  selectedPeriod,
  onTypeChange,
  onPeriodChange
}: DocumentFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const documentTypes = [
    { value: 'all', label: 'Все типы' },
    { value: 'act', label: 'Акты' },
    { value: 'receipt', label: 'Чеки' },
    { value: 'contract', label: 'Договоры' }
  ]

  const periods = [
    { value: 'all', label: 'Всё время' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'quarter', label: 'Квартал' },
    { value: 'year', label: 'Год' }
  ]

  const hasActiveFilters = selectedType !== 'all' || selectedPeriod !== 'all'

  const clearFilters = () => {
    onTypeChange('all')
    onPeriodChange('all')
  }

  return (
    <div className="space-y-3">
      {/* Filter toggle button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl
            border transition-all duration-200
            ${showFilters || hasActiveFilters
              ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Фильтры</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="
              flex items-center gap-2 px-3 py-2 rounded-xl
              bg-white/5 border border-white/10 text-gray-400
              hover:bg-white/10 transition-all duration-200
            "
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Сбросить</span>
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-4">
          {/* Document type filter */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Тип документа</label>
            <div className="grid grid-cols-2 gap-2">
              {documentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onTypeChange(type.value)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedType === type.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period filter */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Период</label>
            <div className="grid grid-cols-2 gap-2">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => onPeriodChange(period.value)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedPeriod === period.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }
                  `}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
