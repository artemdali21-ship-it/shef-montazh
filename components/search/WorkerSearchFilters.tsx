'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X, SlidersHorizontal, Shield, Heart } from 'lucide-react'
import { CATEGORIES, DISTRICTS } from '@/lib/api/search'
import { WorkerSearchFilters, EXPERIENCE_LEVELS } from '@/lib/api/worker-search'

interface WorkerSearchFiltersProps {
  filters: WorkerSearchFilters
  onFiltersChange: (filters: WorkerSearchFilters) => void
  onReset: () => void
}

export default function WorkerSearchFilters({ filters, onFiltersChange, onReset }: WorkerSearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {
    const current = filters.categories || []
    const updated = current.includes(categoryId)
      ? current.filter(c => c !== categoryId)
      : [...current, categoryId]
    onFiltersChange({ ...filters, categories: updated })
  }

  const activeFiltersCount = [
    filters.categories?.length || 0,
    filters.minRating ? 1 : 0,
    filters.minExperience ? 1 : 0,
    filters.district ? 1 : 0,
    filters.verifiedOnly ? 1 : 0,
    filters.favoritesOnly ? 1 : 0,
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
              Специализация
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

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Мин. рейтинг: {filters.minRating || 0}★
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

          {/* Experience */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Опыт работы
            </label>
            <select
              value={filters.minExperience || 0}
              onChange={(e) => onFiltersChange({ ...filters, minExperience: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {EXPERIENCE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
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

          {/* Quick Filters */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white mb-2">
              Быстрые фильтры
            </label>

            {/* Verified Only */}
            <button
              onClick={() => onFiltersChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                filters.verifiedOnly
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">Только с Госуслугами</span>
            </button>

            {/* Favorites Only */}
            <button
              onClick={() => onFiltersChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                filters.favoritesOnly
                  ? 'bg-pink-500/20 border border-pink-500/30 text-pink-400'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${filters.favoritesOnly ? 'fill-pink-400' : ''}`} />
              <span className="font-medium">Только избранные</span>
            </button>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Сортировка
            </label>
            <select
              value={filters.sortBy || 'rating'}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="rating">По рейтингу</option>
              <option value="experience">По опыту</option>
              <option value="price">По цене</option>
              <option value="alphabetical">По алфавиту</option>
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
