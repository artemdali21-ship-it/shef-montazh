'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import SearchFilters from '@/components/search/SearchFilters'
import ShiftGrid from '@/components/search/ShiftGrid'
import { searchShifts, ShiftSearchFilters, ShiftSearchResult } from '@/lib/api/search'
import { useDebounce } from '@/hooks/useDebounce'

export default function WorkerSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ShiftSearchFilters>({
    sortBy: 'date',
    priceMin: undefined,
    priceMax: undefined,
  })
  const [shifts, setShifts] = useState<ShiftSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    performSearch()
  }, [filters, debouncedSearch, currentPage])

  const performSearch = async () => {
    try {
      setLoading(true)
      const result = await searchShifts({
        ...filters,
        page: currentPage,
      })

      setShifts(result.data)
      setTotalCount(result.count)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Error searching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: ShiftSearchFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleReset = () => {
    setFilters({
      sortBy: 'date',
      priceMin: undefined,
      priceMax: undefined,
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-20">
        <div className="p-4">
          <h1 className="text-h1 text-white mb-1">Поиск смен</h1>
          <p className="text-body-small text-gray-400">
            Найдено {totalCount} {totalCount === 1 ? 'смена' : 'смен'}
          </p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию или адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filters */}
        <SearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        {/* Results */}
        <ShiftGrid shifts={shifts} loading={loading} />

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

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
              <span className="text-white font-semibold">Загрузка...</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
