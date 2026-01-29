'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, ChevronDown, X, MapPin, Calendar, DollarSign, ShieldCheck, Inbox } from 'lucide-react'

interface ShiftFilterState {
  search: string
  categories: string[]
  districts: string[]
  priceRange: [number, number]
  verifiedOnly: boolean
  sort: 'date' | 'price-high' | 'price-low'
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

export function ShiftSearch() {
  const [filters, setFilters] = useState<ShiftFilterState>(() => {
    if (typeof window === 'undefined') return getDefaultFilters()
    const saved = localStorage.getItem('shiftSearchFilters')
    return saved ? JSON.parse(saved) : getDefaultFilters()
  })

  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  function getDefaultFilters(): ShiftFilterState {
    return {
      search: '',
      categories: [],
      districts: [],
      priceRange: [5000, 100000],
      verifiedOnly: false,
      sort: 'date',
    }
  }

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem('shiftSearchFilters', JSON.stringify(filters))
  }, [filters])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return MOCK_SHIFTS.filter((shift) => {
      if (
        debouncedSearch &&
        !shift.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !shift.location.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false
      }

      if (filters.categories.length > 0 && !filters.categories.includes(shift.category)) {
        return false
      }

      if (filters.districts.length > 0 && !filters.districts.includes(shift.district)) {
        return false
      }

      if (shift.rate < filters.priceRange[0] || shift.rate > filters.priceRange[1]) {
        return false
      }

      if (filters.verifiedOnly && !shift.verified) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (filters.sort === 'date') return a.date.getTime() - b.date.getTime()
      if (filters.sort === 'price-high') return b.rate - a.rate
      if (filters.sort === 'price-low') return a.rate - b.rate
      return 0
    })
  }, [debouncedSearch, filters])

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

  const handleResetFilters = () => {
    setFilters(getDefaultFilters())
  }

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.districts.length > 0,
    filters.priceRange[0] > 5000 || filters.priceRange[1] < 100000,
    filters.verifiedOnly,
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
            placeholder="Поиск по названию или адресу"
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
            <h3 className="text-sm font-bold text-white mb-3">Категория</h3>
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
                    checked={filters.districts.includes(dist)}
                    onChange={() => handleDistrictToggle(dist)}
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
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    setFilters((prev) => ({
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
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    setFilters((prev) => ({
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
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
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
        <p className="text-sm text-white/60">Найдено: {filteredShifts.length} смены</p>
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as any }))}
            className="h-10 px-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-white/40 transition-colors appearance-none pr-8"
          >
            <option value="date">По дате</option>
            <option value="price-high">По цене (дорогие)</option>
            <option value="price-low">По цене (дешевые)</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
      </div>

      {/* SHIFTS GRID */}
      {filteredShifts.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Inbox size={48} className="text-white/30 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Смены не найдены</h3>
          <p className="text-sm text-white/60 mb-6">Попробуйте изменить фильтры</p>
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
