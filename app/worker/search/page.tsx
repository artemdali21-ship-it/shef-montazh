'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Calendar, MapPin, DollarSign, Clock, Users } from 'lucide-react'
import { searchShifts, ShiftSearchFilters, ShiftSearchResult } from '@/lib/api/search'
import { CATEGORIES } from '@/lib/constants/categories'
import CategoryFilter from '@/components/search/CategoryFilter'
import CategoryBadge from '@/components/categories/CategoryBadge'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'

export default function WorkerSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [shifts, setShifts] = useState<ShiftSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    performSearch()
  }, [selectedCategories, debouncedSearch, currentPage])

  const performSearch = async () => {
    try {
      setLoading(true)

      const filters: ShiftSearchFilters = {
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        sortBy: 'date',
        page: currentPage,
      }

      const result = await searchShifts(filters)

      // Filter by search query if present
      let filteredShifts = result.data
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        filteredShifts = result.data.filter(shift =>
          shift.title.toLowerCase().includes(query) ||
          shift.location_address.toLowerCase().includes(query) ||
          shift.client_name.toLowerCase().includes(query)
        )
      }

      setShifts(filteredShifts)
      setTotalCount(result.count)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Error searching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedCategories([])
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasActiveFilters = selectedCategories.length > 0 || searchQuery

  return (
    <main className="min-h-screen bg-dashboard pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4">
          <h1 className="text-h1 text-white mb-1">Поиск смен</h1>
          <p className="text-body-small text-gray-400">
            Найдено {totalCount} {
              totalCount === 1 ? 'смена' :
              totalCount < 5 ? 'смены' : 'смен'
            }
          </p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск смен..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition ${
            hasActiveFilters
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <span className="font-semibold">Фильтры по категориям</span>
          {selectedCategories.length > 0 && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </button>

        {/* Category Filters */}
        {showFilters && (
          <CategoryFilter
            selected={selectedCategories}
            onChange={setSelectedCategories}
            variant="expanded"
            showCount
          />
        )}

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition"
          >
            Сбросить фильтры
          </button>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <p className="text-gray-400">Смены не найдены</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => (
              <Link
                key={shift.id}
                href={`/shifts/${shift.id}`}
                className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{shift.title}</h3>
                    {shift.category && (
                      <CategoryBadge categoryId={shift.category} size="sm" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-400">
                      {shift.pay_amount.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(shift.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{shift.start_time} - {shift.end_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{shift.location_address}</span>
                  </div>
                  {shift.required_workers && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Требуется: {shift.required_workers} чел.</span>
                    </div>
                  )}
                </div>

                {/* Client Info */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Заказчик: <span className="text-white">{shift.client_name}</span>
                  </span>
                  {shift.client_rating > 0 && (
                    <span className="text-sm text-yellow-400">
                      ★ {shift.client_rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition"
            >
              Назад
            </button>
            <span className="px-4 py-2 text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
