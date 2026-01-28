'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, ChevronDown, X, MapPin, ShieldCheck, Heart, Star, Inbox } from 'lucide-react'
import { UserCard } from '@/components/features/user-card'

interface WorkerFilterState {
  search: string
  categories: string[]
  minRating: number
  districts: string[]
  verifiedOnly: boolean
  favoritesOnly: boolean
  sort: 'rating' | 'experience' | 'alphabetical'
}

const CATEGORIES = [
  'Монтажник',
  'Декоратор',
  'Электрик',
  'Сварщик',
  'Альпинист',
  'Бутафор',
  'Разнорабочий',
]

const DISTRICTS = [
  'ЦАО',
  'САО',
  'СВАО',
  'ВАО',
  'ЮВАО',
  'ЮАО',
  'ЮЗАО',
  'ЗАО',
  'СЗАО',
]

const MOCK_WORKERS = [
  {
    id: 'w1',
    name: 'Иван Петров',
    avatar: '/placeholder-user.jpg',
    rating: 4.9,
    reviewCount: 23,
    completedShifts: 47,
    reliability: 98,
    location: 'ЮВАО',
    specializations: ['Монтажник', 'Электрик', 'Сварщик'],
    verified: true,
    online: true,
    bio: 'Опытный монтажник с 10+ годами стажа',
    hasTools: true,
    hourlyRate: 1200,
  },
  {
    id: 'w2',
    name: 'Сергей Иванов',
    avatar: '/placeholder-user.jpg',
    rating: 4.7,
    reviewCount: 18,
    completedShifts: 34,
    reliability: 95,
    location: 'ЦАО',
    specializations: ['Электрик', 'Декоратор'],
    verified: true,
    online: false,
    bio: 'Специалист по световому оборудованию',
    hasTools: true,
    hourlyRate: 1100,
  },
  {
    id: 'w3',
    name: 'Дмитрий Сидоров',
    avatar: '/placeholder-user.jpg',
    rating: 4.8,
    reviewCount: 31,
    completedShifts: 56,
    reliability: 99,
    location: 'САО',
    specializations: ['Сварщик', 'Монтажник', 'Разнорабочий'],
    verified: true,
    online: true,
    bio: 'Сварщик высокой квалификации',
    hasTools: true,
    hourlyRate: 1400,
  },
  {
    id: 'w4',
    name: 'Анатолий Морозов',
    avatar: '/placeholder-user.jpg',
    rating: 4.5,
    reviewCount: 12,
    completedShifts: 28,
    reliability: 92,
    location: 'ВАО',
    specializations: ['Альпинист', 'Монтажник'],
    verified: false,
    online: true,
    bio: 'Работник высоты, альпинист',
    hasTools: false,
    hourlyRate: 1500,
  },
  {
    id: 'w5',
    name: 'Олег Васильев',
    avatar: '/placeholder-user.jpg',
    rating: 4.6,
    reviewCount: 15,
    completedShifts: 41,
    reliability: 94,
    location: 'ЮЗАО',
    specializations: ['Декоратор', 'Бутафор'],
    verified: true,
    online: true,
    bio: 'Дизайнер и декоратор интерьеров',
    hasTools: true,
    hourlyRate: 950,
  },
]

export function WorkerSearch() {
  const [filters, setFilters] = useState<WorkerFilterState>(() => {
    if (typeof window === 'undefined') return getDefaultFilters()
    const saved = localStorage.getItem('workerSearchFilters')
    return saved ? JSON.parse(saved) : getDefaultFilters()
  })

  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('workerFavorites')
    return saved ? JSON.parse(saved) : ['w2']
  })

  function getDefaultFilters(): WorkerFilterState {
    return {
      search: '',
      categories: [],
      minRating: 1.0,
      districts: [],
      verifiedOnly: false,
      favoritesOnly: false,
      sort: 'rating',
    }
  }

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem('workerSearchFilters', JSON.stringify(filters))
  }, [filters])

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('workerFavorites', JSON.stringify(favorites))
  }, [favorites])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Filter workers
  const filteredWorkers = useMemo(() => {
    return MOCK_WORKERS.filter((worker) => {
      if (
        debouncedSearch &&
        !worker.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !worker.bio?.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false
      }

      if (filters.categories.length > 0 && 
          !worker.specializations.some(spec => filters.categories.includes(spec))) {
        return false
      }

      if (worker.rating < filters.minRating) {
        return false
      }

      if (filters.districts.length > 0 && !filters.districts.includes(worker.location)) {
        return false
      }

      if (filters.verifiedOnly && !worker.verified) {
        return false
      }

      if (filters.favoritesOnly && !favorites.includes(worker.id)) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (filters.sort === 'rating') return b.rating - a.rating
      if (filters.sort === 'experience') return b.completedShifts - a.completedShifts
      if (filters.sort === 'alphabetical') return a.name.localeCompare(b.name)
      return 0
    })
  }, [debouncedSearch, filters, favorites])

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleDistrictToggle = (district: string) => {
    setFilters((prev) => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter((d) => d !== district)
        : [...prev.districts, district],
    }))
  }

  const handleToggleFavorite = (workerId: string) => {
    setFavorites((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    )
  }

  const handleResetFilters = () => {
    setFilters(getDefaultFilters())
  }

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.minRating > 1.0,
    filters.districts.length > 0,
    filters.verifiedOnly,
    filters.favoritesOnly,
  ].filter(Boolean).length

  return (
    <>
      {/* SEARCH BAR */}
      <div className="sticky top-0 z-40 mb-6 flex gap-3 bg-gradient-to-b from-black/20 to-transparent pb-3">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search size={18} className="text-white/50" />
          </div>
          <input
            type="text"
            placeholder="Поиск исполнителей по имени"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full h-12 pl-12 pr-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-white/40"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} className="text-white/60" />
            </button>
          )}
        </div>

        {/* FILTERS BUTTON */}
        <button
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          className="h-12 px-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center gap-2 hover:bg-white/15 transition-colors relative"
        >
          <Filter size={18} />
          {activeFilterCount > 0 && (
            <span className="text-xs font-bold bg-[#E85D2F] text-white px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* FILTERS PANEL */}
      {showFiltersPanel && (
        <div className="mb-6 p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* CATEGORIES */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Специальность</h3>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="w-4 h-4 rounded accent-[#BFFF00]"
                  />
                  <span className="text-xs text-white/80">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* RATING SLIDER */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Star size={16} />
              <span>Минимальный рейтинг</span>
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={filters.minRating}
                onChange={(e) => setFilters((prev) => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#BFFF00]"
              />
              <span className="text-sm font-bold text-white min-w-[3rem] text-right">
                {filters.minRating.toFixed(1)}+
              </span>
            </div>
          </div>

          {/* DISTRICTS */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MapPin size={16} />
              <span>Район</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DISTRICTS.map((dist) => (
                <label
                  key={dist}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.districts.includes(dist)}
                    onChange={() => handleDistrictToggle(dist)}
                    className="w-4 h-4 rounded accent-[#BFFF00]"
                  />
                  <span className="text-xs text-white/80">{dist}</span>
                </label>
              ))}
            </div>
          </div>

          {/* VERIFIED ONLY */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <ShieldCheck size={16} className="text-white/60" />
              <span className="text-sm text-white/80">Только верифицированные</span>
            </label>
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
              className="w-4 h-4 rounded accent-[#BFFF00]"
            />
          </div>

          {/* FAVORITES ONLY */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <Heart size={16} className="text-white/60" />
              <span className="text-sm text-white/80">Только избранные</span>
            </label>
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={(e) => setFilters((prev) => ({ ...prev, favoritesOnly: e.target.checked }))}
              className="w-4 h-4 rounded accent-[#BFFF00]"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={handleResetFilters}
              className="flex-1 h-10 rounded-xl bg-white/10 text-white/80 font-medium text-sm hover:bg-white/15 transition-colors"
            >
              Сбросить
            </button>
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="flex-1 h-10 rounded-xl bg-[#E85D2F] text-white font-medium text-sm hover:bg-[#D04D1F] transition-colors"
            >
              Применить
            </button>
          </div>
        </div>
      )}

      {/* SORT & COUNT */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-white/60">
          Найдено: {filteredWorkers.length} исполнител{[1].includes(filteredWorkers.length % 10) ? 'я' : 'ей'}
        </p>
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as any }))}
            className="h-10 px-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-white/40 transition-colors appearance-none pr-8"
          >
            <option value="rating">По рейтингу</option>
            <option value="experience">По опыту</option>
            <option value="alphabetical">По алфавиту</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
      </div>

      {/* WORKERS GRID */}
      {filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="relative">
              <UserCard
                id={worker.id}
                name={worker.name}
                avatar={worker.avatar}
                rating={worker.rating}
                reviewCount={worker.reviewCount}
                completedShifts={worker.completedShifts}
                reliability={worker.reliability}
                location={worker.location}
                specializations={worker.specializations}
                verified={worker.verified}
                online={worker.online}
                bio={worker.bio}
                hasTools={worker.hasTools}
                hourlyRate={worker.hourlyRate}
                onMessage={() => console.log('[v0] Message worker:', worker.id)}
                onViewProfile={() => console.log('[v0] View worker profile:', worker.id)}
              />
              {/* Favorite button */}
              <button
                onClick={() => handleToggleFavorite(worker.id)}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                  favorites.includes(worker.id)
                    ? 'bg-[#E85D2F]/20 border border-[#E85D2F]/50'
                    : 'bg-white/10 border border-white/20 hover:bg-white/15'
                }`}
              >
                <Heart
                  size={18}
                  className={favorites.includes(worker.id) ? 'fill-[#E85D2F] text-[#E85D2F]' : 'text-white/60'}
                />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Inbox size={48} className="text-white/30 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Исполнители не найдены</h3>
          <p className="text-sm text-white/60 mb-6">Попробуйте изменить критерии поиска</p>
          <button
            onClick={handleResetFilters}
            className="h-10 px-6 rounded-xl bg-[#E85D2F] text-white font-medium text-sm hover:bg-[#D04D1F] transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </>
  )
}
