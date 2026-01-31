'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { PaymentFilters as Filters, PaymentStatus } from '@/lib/api/payments'

interface PaymentFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onReset: () => void
}

export default function PaymentFilters({
  filters,
  onFiltersChange,
  onReset
}: PaymentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusOptions: Array<{ value: PaymentStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'pending', label: 'Ожидает' },
    { value: 'paid', label: 'Оплачено' },
    { value: 'overdue', label: 'Просрочено' },
    { value: 'failed', label: 'Не удалось' },
    { value: 'refunded', label: 'Возвращено' },
  ]

  const periodPresets = [
    { label: '7 дней', days: 7 },
    { label: '30 дней', days: 30 },
    { label: '3 месяца', days: 90 },
    { label: 'Все время', days: null },
  ]

  const handleStatusChange = (status: PaymentStatus | 'all') => {
    onFiltersChange({ ...filters, status, page: 1 })
  }

  const handlePeriodChange = (days: number | null) => {
    if (days === null) {
      // All time
      onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined, page: 1 })
    } else {
      const dateTo = new Date().toISOString()
      const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      onFiltersChange({ ...filters, dateFrom, dateTo, page: 1 })
    }
  }

  const handleSortChange = (sortBy: 'date' | 'amount') => {
    onFiltersChange({ ...filters, sortBy, page: 1 })
  }

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ ...filters, sortOrder, page: 1 })
  }

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.dateFrom,
    filters.sortBy !== 'date' || filters.sortOrder !== 'desc',
  ].filter(Boolean).length

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-400" />
          <span className="text-white font-semibold">Фильтры</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-orange-500 rounded-full text-white text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-white/10">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Статус
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    filters.status === option.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Период
            </label>
            <div className="flex flex-wrap gap-2">
              {periodPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePeriodChange(preset.days)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    (preset.days === null && !filters.dateFrom) ||
                    (preset.days !== null && filters.dateFrom)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Сортировка
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">По полю</label>
                <select
                  value={filters.sortBy || 'date'}
                  onChange={(e) => handleSortChange(e.target.value as 'date' | 'amount')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="date">По дате</option>
                  <option value="amount">По сумме</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Порядок</label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="desc">Сначала новые</option>
                  <option value="asc">Сначала старые</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-semibold transition"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  )
}
