'use client'

import { useState } from 'react'
import { Search, Star, Filter, X } from 'lucide-react'

interface Props {
  onFilterChange: (filters: {
    starFilter: number | null
    onlyWithComments: boolean
    searchQuery: string
  }) => void
}

export default function RatingFilters({ onFilterChange }: Props) {
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const [onlyWithComments, setOnlyWithComments] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleStarFilter = (star: number | null) => {
    setStarFilter(star)
    onFilterChange({ starFilter: star, onlyWithComments, searchQuery })
  }

  const handleCommentsToggle = () => {
    const newValue = !onlyWithComments
    setOnlyWithComments(newValue)
    onFilterChange({ starFilter, onlyWithComments: newValue, searchQuery })
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    onFilterChange({ starFilter, onlyWithComments, searchQuery: query })
  }

  const clearFilters = () => {
    setStarFilter(null)
    setOnlyWithComments(false)
    setSearchQuery('')
    onFilterChange({ starFilter: null, onlyWithComments: false, searchQuery: '' })
  }

  const hasActiveFilters = starFilter !== null || onlyWithComments || searchQuery !== ''

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Поиск по комментариям..."
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
            showFilters
              ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
          }`}
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
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Сбросить всё
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-4">
          {/* Star Filter */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Фильтр по звёздам</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStarFilter(null)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  starFilter === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Все
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarFilter(star)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                    starFilter === star
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Star
                    size={14}
                    className={starFilter === star ? 'fill-white text-white' : ''}
                  />
                  {star}
                </button>
              ))}
            </div>
          </div>

          {/* Comments Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-sm text-gray-300">Только с комментариями</span>
            <button
              onClick={handleCommentsToggle}
              className={`relative w-12 h-6 rounded-full transition ${
                onlyWithComments ? 'bg-orange-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  onlyWithComments ? 'translate-x-7' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
