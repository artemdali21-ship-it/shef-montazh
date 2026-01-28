'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, Filter, ChevronDown, X, MapPin, Calendar, DollarSign, ShieldCheck, Clock, Inbox, Star, Heart } from 'lucide-react'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { UserCard } from '@/components/features/user-card'

interface ShiftFilterState {
  search: string
  categories: string[]
  dateRange: { start: Date | null; end: Date | null }
  districts: string[]
  priceRange: [number, number]
  verifiedOnly: boolean
  sort: 'date' | 'price-high' | 'price-low' | 'distance'
}

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

// Mock shifts data
const MOCK_SHIFTS = [
  {
    id: 1,
    title: 'Монтаж выставочного стенда',
    date: new Date(2026, 0, 28),
    time: '18:00 - 02:00',
    duration: '8 часов',
    location: 'Крокус Экспо, павильон 3',
    district: 'ЮВАО',
    rate: 2500,
    category: 'Монтажник',
    urgent: false,
    verified: true,
    escrow: true,
  },
  {
    id: 2,
    title: 'Демонтаж декораций',
    date: new Date(),
    time: '20:00 - 02:00',
    duration: '6 часов',
    location: 'ЦВЗ Манеж',
    district: 'ЦАО',
    rate: 3200,
    category: 'Разнорабочий',
    urgent: true,
    verified: true,
    escrow: true,
  },
  {
    id: 3,
    title: 'Сборка металлических ферм',
    date: new Date(2026, 0, 27),
    time: '10:00 - 18:00',
    duration: '8 часов',
    location: 'Экспоцентр, зал 1',
    district: 'САО',
    rate: 2800,
    category: 'Сварщик',
    urgent: false,
    verified: true,
    escrow: true,
  },
  {
    id: 4,
    title: 'Монтаж световой техники',
    date: new Date(),
    time: '14:00 - 22:00',
    duration: '8 часов',
    location: 'БКЗ Октябрьский',
    district: 'ЗАО',
    rate: 3500,
    category: 'Электрик',
    urgent: true,
    verified: true,
    escrow: true,
  },
  {
    id: 5,
    title: 'Установка временных конструкций',
    date: new Date(2026, 0, 29),
    time: '08:00 - 17:00',
    duration: '9 часов',
    location: 'Мосводоканал',
    district: 'СЗАО',
    rate: 2600,
    category: 'Монтажник',
    urgent: false,
    verified: true,
    escrow: true,
  },
]

// Mock workers data
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
    favorite: false,
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
    favorite: true,
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
    favorite: false,
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
    favorite: false,
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
    favorite: false,
  },
]

// Helper to get user role
function getUserRole(): 'client' | 'worker' {
  // In real app, get from auth/context
  return 'client'
}

export default function SearchPage() {
  const userRole = getUserRole()
  
  const [shiftFilters, setShiftFilters] = useState<ShiftFilterState>({
    search: '',
    categories: [],
    dateRange: { start: null, end: null },
    districts: [],
    priceRange: [5000, 100000],
    verifiedOnly: false,
    sort: 'date',
  })

  const [workerFilters, setWorkerFilters] = useState<WorkerFilterState>({
    search: '',
    categories: [],
    minRating: 1.0,
    districts: [],
    verifiedOnly: false,
    favoritesOnly: false,
    sort: 'rating',
  })

  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>(['w2'])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(userRole === 'worker' ? shiftFilters.search : workerFilters.search)
    }, 300)
    return () => clearTimeout(timer)
  }, [userRole, shiftFilters.search, workerFilters.search])

  // Filter shifts for workers
  const filteredShifts = useMemo(() => {
    return MOCK_SHIFTS.filter((shift) => {
      if (
        debouncedSearch &&
        !shift.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !shift.location.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false
      }

      if (shiftFilters.categories.length > 0 && !shiftFilters.categories.includes(shift.category)) {
        return false
      }

      if (shiftFilters.districts.length > 0 && !shiftFilters.districts.includes(shift.district)) {
        return false
      }

      if (shift.rate < shiftFilters.priceRange[0] || shift.rate > shiftFilters.priceRange[1]) {
        return false
      }

      if (shiftFilters.verifiedOnly && !shift.verified) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (shiftFilters.sort === 'date') return a.date.getTime() - b.date.getTime()
      if (shiftFilters.sort === 'price-high') return b.rate - a.rate
      if (shiftFilters.sort === 'price-low') return a.rate - b.rate
      return 0
    })
  }, [debouncedSearch, shiftFilters])

  // Filter workers for clients
  const filteredWorkers = useMemo(() => {
    return MOCK_WORKERS.filter((worker) => {
      if (
        debouncedSearch &&
        !worker.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !worker.bio?.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false
      }

      if (workerFilters.categories.length > 0 && 
          !worker.specializations.some(spec => workerFilters.categories.includes(spec))) {
        return false
      }

      if (worker.rating < workerFilters.minRating) {
        return false
      }

      if (workerFilters.districts.length > 0 && !workerFilters.districts.includes(worker.location)) {
        return false
      }

      if (workerFilters.verifiedOnly && !worker.verified) {
        return false
      }

      if (workerFilters.favoritesOnly && !favorites.includes(worker.id)) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (workerFilters.sort === 'rating') return b.rating - a.rating
      if (workerFilters.sort === 'experience') return b.completedShifts - a.completedShifts
      if (workerFilters.sort === 'alphabetical') return a.name.localeCompare(b.name)
      return 0
    })
  }, [debouncedSearch, workerFilters, favorites])

  const handleShiftCategoryToggle = (category: string) => {
    setShiftFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleWorkerCategoryToggle = (category: string) => {
    setWorkerFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleDistrictToggle = (district: string, isWorker: boolean) => {
    if (isWorker) {
      setWorkerFilters((prev) => ({
        ...prev,
        districts: prev.districts.includes(district)
          ? prev.districts.filter((d) => d !== district)
          : [...prev.districts, district],
      }))
    } else {
      setShiftFilters((prev) => ({
        ...prev,
        districts: prev.districts.includes(district)
          ? prev.districts.filter((d) => d !== district)
          : [...prev.districts, district],
      }))
    }
  }

  const handleToggleFavorite = (workerId: string) => {
    setFavorites((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    )
  }

  const handleResetFilters = () => {
    if (userRole === 'worker') {
      setShiftFilters({
        search: '',
        categories: [],
        dateRange: { start: null, end: null },
        districts: [],
        priceRange: [5000, 100000],
        verifiedOnly: false,
        sort: 'date',
      })
    } else {
      setWorkerFilters({
        search: '',
        categories: [],
        minRating: 1.0,
        districts: [],
        verifiedOnly: false,
        favoritesOnly: false,
        sort: 'rating',
      })
    }
    setDebouncedSearch('')
  }

  const activeFilterCount = userRole === 'worker'
    ? [
        shiftFilters.categories.length > 0,
        shiftFilters.districts.length > 0,
        shiftFilters.priceRange[0] > 5000 || shiftFilters.priceRange[1] < 100000,
        shiftFilters.verifiedOnly,
      ].filter(Boolean).length
    : [
        workerFilters.categories.length > 0,
        workerFilters.minRating > 1.0,
        workerFilters.districts.length > 0,
        workerFilters.verifiedOnly,
        workerFilters.favoritesOnly,
      ].filter(Boolean).length

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{
        backgroundImage: 'url(/images/gradient-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* HEADER */}
      <Header 
        title={userRole === 'worker' ? 'Поиск смен' : 'Поиск исполнителей'} 
        showBack={false} 
        showNotifications={true} 
      />

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-4 font-sans">
        {/* SEARCH BAR */}
        <div className="sticky top-24 z-40 mb-6 flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search size={18} className="text-white/50" />
            </div>
            <input
              type="text"
              placeholder={userRole === 'worker' 
                ? 'Поиск по названию или адресу' 
                : 'Поиск исполнителей по имени'}
              value={userRole === 'worker' ? shiftFilters.search : workerFilters.search}
              onChange={(e) => {
                if (userRole === 'worker') {
                  setShiftFilters((prev) => ({ ...prev, search: e.target.value }))
                } else {
                  setWorkerFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              }}
              className="w-full h-12 pl-12 pr-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-white/40"
            />
            {((userRole === 'worker' ? shiftFilters.search : workerFilters.search) !== '') && (
              <button
                onClick={() => {
                  if (userRole === 'worker') {
                    setShiftFilters((prev) => ({ ...prev, search: '' }))
                  } else {
                    setWorkerFilters((prev) => ({ ...prev, search: '' }))
                  }
                }}
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

        {/* FILTERS PANEL - WORKERS */}
        {userRole === 'client' && showFiltersPanel && (
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
                      checked={workerFilters.categories.includes(cat)}
                      onChange={() => handleWorkerCategoryToggle(cat)}
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
                  value={workerFilters.minRating}
                  onChange={(e) => setWorkerFilters((prev) => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#BFFF00]"
                />
                <span className="text-sm font-bold text-white min-w-[3rem] text-right">
                  {workerFilters.minRating.toFixed(1)}+
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
                      checked={workerFilters.districts.includes(dist)}
                      onChange={() => handleDistrictToggle(dist, true)}
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
                checked={workerFilters.verifiedOnly}
                onChange={(e) => setWorkerFilters((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
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
                checked={workerFilters.favoritesOnly}
                onChange={(e) => setWorkerFilters((prev) => ({ ...prev, favoritesOnly: e.target.checked }))}
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

        {/* FILTERS PANEL - SHIFTS */}
        {userRole === 'worker' && showFiltersPanel && (
          <div className="mb-6 p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* CATEGORIES */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span>Категория</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={shiftFilters.categories.includes(cat)}
                      onChange={() => handleShiftCategoryToggle(cat)}
                      className="w-4 h-4 rounded accent-[#BFFF00]"
                    />
                    <span className="text-xs text-white/80">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* DISTRICTS */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <MapPin size={16} />
                <span>Район Москвы</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {DISTRICTS.map((dist) => (
                  <label
                    key={dist}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={shiftFilters.districts.includes(dist)}
                      onChange={() => handleDistrictToggle(dist, false)}
                      className="w-4 h-4 rounded accent-[#BFFF00]"
                    />
                    <span className="text-xs text-white/80">{dist}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <DollarSign size={16} />
                <span>Цена</span>
              </h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-white/60 block mb-1">От</label>
                  <input
                    type="number"
                    value={shiftFilters.priceRange[0]}
                    onChange={(e) =>
                      setShiftFilters((prev) => ({
                        ...prev,
                        priceRange: [Math.max(1000, parseInt(e.target.value) || 5000), prev.priceRange[1]],
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/60 block mb-1">До</label>
                  <input
                    type="number"
                    value={shiftFilters.priceRange[1]}
                    onChange={(e) =>
                      setShiftFilters((prev) => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], Math.min(500000, parseInt(e.target.value) || 100000)],
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-white/40 transition-colors"
                  />
                </div>
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
                checked={shiftFilters.verifiedOnly}
                onChange={(e) => setShiftFilters((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
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
            {userRole === 'worker'
              ? `Найдено: ${filteredShifts.length} ${['смена', 'смены', 'смен'][[1, 2, 5, 6, 7, 8, 9, 0].includes(filteredShifts.length % 10) ? 2 : filteredShifts.length % 10 === 1 ? 0 : 1]}`
              : `Найдено: ${filteredWorkers.length} исполнител${[1].includes(filteredWorkers.length % 10) ? 'я' : 'ей'}`}
          </p>
          <div className="relative">
            <select
              value={userRole === 'worker' ? shiftFilters.sort : workerFilters.sort}
              onChange={(e) => {
                if (userRole === 'worker') {
                  setShiftFilters((prev) => ({ ...prev, sort: e.target.value as any }))
                } else {
                  setWorkerFilters((prev) => ({ ...prev, sort: e.target.value as any }))
                }
              }}
              className="h-10 px-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-white/40 transition-colors appearance-none pr-8"
            >
              {userRole === 'worker' ? (
                <>
                  <option value="date">По дате</option>
                  <option value="price-high">По цене (дорогие)</option>
                  <option value="price-low">По цене (дешевые)</option>
                </>
              ) : (
                <>
                  <option value="rating">По рейтингу</option>
                  <option value="experience">По опыту</option>
                  <option value="alphabetical">По алфавиту</option>
                </>
              )}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* SHIFTS GRID - WORKERS VIEW */}
        {userRole === 'worker' && filteredShifts.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filteredShifts.map((shift) => (
              <div
                key={shift.id}
                className="group rounded-2xl p-5 bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 cursor-pointer transition-all duration-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white">{shift.title}</h3>
                  </div>
                  {shift.urgent && (
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-lg ml-2 bg-[#E85D2F] text-white flex-shrink-0">
                      Срочно
                    </span>
                  )}
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-1.5 mb-2 text-sm text-white/60">
                  <Calendar size={14} />
                  <span>
                    {shift.date.toLocaleDateString('ru-RU')} • {shift.time}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-4 text-sm text-white/60">
                  <MapPin size={14} />
                  <span>{shift.location}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 my-4" />

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-[#E85D2F]">{shift.rate.toLocaleString('ru-RU')} ₽</div>
                    <div className="text-xs text-white/60">{shift.duration}</div>
                  </div>

                  <button className="h-10 px-6 rounded-xl bg-[#E85D2F] text-white font-medium text-sm hover:bg-[#D04D1F] transition-colors group-hover:shadow-lg group-hover:shadow-[#E85D2F]/30">
                    Откликнуться
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WORKERS GRID - CLIENTS VIEW */}
        {userRole === 'client' && filteredWorkers.length > 0 && (
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
        )}

        {/* EMPTY STATE */}
        {((userRole === 'worker' && filteredShifts.length === 0) || (userRole === 'client' && filteredWorkers.length === 0)) && (
          <div className="flex flex-col items-center justify-center py-20">
            <Inbox size={48} className="text-white/30 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">
              {userRole === 'worker' ? 'Смены не найдены' : 'Исполнители не найдены'}
            </h3>
            <p className="text-sm text-white/60 mb-6">Попробуйте изменить критерии поиска</p>
            <button
              onClick={handleResetFilters}
              className="h-10 px-6 rounded-xl bg-[#E85D2F] text-white font-medium text-sm hover:bg-[#D04D1F] transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomNav userType={userRole === 'worker' ? 'worker' : 'client'} />
    </div>
  )
}
