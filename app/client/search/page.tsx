'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import WorkerSearchFilters from '@/components/search/WorkerSearchFilters'
import WorkerGrid from '@/components/search/WorkerGrid'
import { searchWorkers } from '@/lib/api/worker-search'
import type { WorkerSearchFilters, WorkerSearchResult } from '@/lib/api/worker-search'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/lib/supabase-client'

export default function ClientSearchPage() {
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<WorkerSearchFilters>({
    sortBy: 'rating',
  })
  const [workers, setWorkers] = useState<WorkerSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [clientId, setClientId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    loadClientId()
    loadFavorites()
  }, [])

  useEffect(() => {
    performSearch()
  }, [filters, debouncedSearch, currentPage])

  const loadClientId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setClientId(user.id)
    }
  }

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('favorites')
        .select('favorite_user_id')
        .eq('user_id', user.id)

      if (data) {
        setFavoriteIds(new Set(data.map(f => f.favorite_user_id)))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const performSearch = async () => {
    try {
      setLoading(true)
      const result = await searchWorkers(
        {
          ...filters,
          page: currentPage,
        },
        clientId || undefined
      )

      // Filter by search query if present
      let filteredWorkers = result.data
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        filteredWorkers = result.data.filter(w =>
          w.full_name.toLowerCase().includes(query)
        )
      }

      setWorkers(filteredWorkers)
      setTotalCount(result.count)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Error searching workers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: WorkerSearchFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleReset = () => {
    setFilters({
      sortBy: 'rating',
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleFavoriteToggle = async (workerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const isFavorite = favoriteIds.has(workerId)

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('favorite_user_id', workerId)

        setFavoriteIds(prev => {
          const next = new Set(prev)
          next.delete(workerId)
          return next
        })
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            favorite_user_id: workerId,
          })

        setFavoriteIds(prev => new Set(prev).add(workerId))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleInvite = (workerId: string) => {
    // TODO: Implement invite modal or navigate to shift selection
    console.log('Invite worker:', workerId)
    // For now, just navigate to worker profile
    // In production, this would open a modal to select which shift to invite them to
    alert('Функция приглашения будет реализована в следующей версии')
  }

  return (
    <main className="min-h-screen bg-dashboard pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4">
          <h1 className="text-h1 text-white mb-1">Поиск исполнителей</h1>
          <p className="text-body-small text-gray-400">
            Найдено {totalCount} {totalCount === 1 ? 'исполнитель' : 'исполнителей'}
          </p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск исполнителей по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filters */}
        <WorkerSearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        {/* Results */}
        <WorkerGrid
          workers={workers}
          loading={loading}
          onFavoriteToggle={handleFavoriteToggle}
          onInvite={handleInvite}
          favoriteIds={favoriteIds}
          userId={clientId}
        />

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
