'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES, DISTRICTS, ShiftSearchFilters } from '@/lib/api/search'

interface SearchFiltersProps {
  filters: ShiftSearchFilters
  onFiltersChange: (filters: ShiftSearchFilters) => void
  onReset: () => void
}

export default function SearchFilters({ filters, onFiltersChange, onReset }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {
    const current = filters.categories || []
    const updated = current.includes(categoryId)
      ? current.filter(c => c !== categoryId)
      : [...current, categoryId]
    onFiltersChange({ ...filters, categories: updated })
  }

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      onFiltersChange({ ...filters, priceMin: value })
    } else {
      onFiltersChange({ ...filters, priceMax: value })
    }
  }

  const activeFiltersCount = [
    filters.categories?.length || 0,
    filters.date ? 1 : 0,
    filters.district ? 1 : 0,
    filters.priceMin !== undefined ? 1 : 0,
    filters.priceMax !== undefined ? 1 : 0,
    filters.minRating ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-orange-400" />
          <span className="text-white font-semibold">Фильтры</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Filters Content */}
      {isOpen && (
        <div className="p-4 pt-0 space-y-6">
          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Категории
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    filters.categories?.includes(category.id)
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Дата
            </label>
            <input
              type="date"
              value={filters.date || ''}
              onChange={(e) => onFiltersChange({ ...filters, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Район
            </label>
            <select
              value={filters.district || ''}
              onChange={(e) => onFiltersChange({ ...filters, district: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Все районы</option>
              {DISTRICTS.map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Цена
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">От</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={filters.priceMin || ''}
                  onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">До</label>
                <input
                  type="number"
                  placeholder="100000"
                  value={filters.priceMax || ''}
                  onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Client Rating */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Мин. рейтинг заказчика: {filters.minRating || 0}★
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating || 0}
              onChange={(e) => onFiltersChange({ ...filters, minRating: parseFloat(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>5</span>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Сортировка
            </label>
            <select
              value={filters.sortBy || 'date'}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="date">По дате</option>
              <option value="price">По цене</option>
              <option value="rating">По рейтингу</option>
            </select>
          </div>

          {/* Reset Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  )
}
