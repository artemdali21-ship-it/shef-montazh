'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, TrendingUp, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { getUserReceivedRatings, calculateUserAverageRating } from '@/lib/api/ratings'
import RatingFilters from '@/components/ratings/RatingFilters'
import RatingsList from '@/components/ratings/RatingsList'

interface Rating {
  id: string
  rating: number
  comment: string | null
  created_at: string
  from_user: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  }
  shift: {
    id: string
    title: string
    date: string
  }
}

export default function WorkerRatingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [allRatings, setAllRatings] = useState<Rating[]>([])
  const [filteredRatings, setFilteredRatings] = useState<Rating[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    loadRatings()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    }
  }

  const loadRatings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all ratings
      const { data: ratingsData } = await getUserReceivedRatings(user.id)

      if (ratingsData) {
        setAllRatings(ratingsData as Rating[])
        setFilteredRatings(ratingsData as Rating[])
      }

      // Get average and count
      const { average, count } = await calculateUserAverageRating(user.id)
      setAverageRating(average)
      setTotalCount(count)
    } catch (error) {
      console.error('Error loading ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filters: {
    starFilter: number | null
    onlyWithComments: boolean
    searchQuery: string
  }) => {
    let filtered = [...allRatings]

    // Filter by star rating
    if (filters.starFilter !== null) {
      filtered = filtered.filter(r => r.rating === filters.starFilter)
    }

    // Filter by comments
    if (filters.onlyWithComments) {
      filtered = filtered.filter(r => r.comment && r.comment.trim().length > 0)
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.comment?.toLowerCase().includes(query) ||
        r.from_user.full_name.toLowerCase().includes(query) ||
        r.shift.title.toLowerCase().includes(query)
      )
    }

    setFilteredRatings(filtered)
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Мои отзывы</h1>
            <p className="text-sm text-gray-400">История всех полученных оценок</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Average Rating */}
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500/30 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
              </div>
              <p className="text-sm text-orange-400/70">Средний рейтинг</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {averageRating > 0 ? averageRating.toFixed(1) : '—'}
            </p>
          </div>

          {/* Total Reviews */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-blue-400/70">Всего отзывов</p>
            </div>
            <p className="text-3xl font-bold text-white">{totalCount}</p>
          </div>

          {/* With Comments */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-green-400/70">С комментариями</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {allRatings.filter(r => r.comment).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <RatingFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Показано отзывов: <span className="text-white font-medium">{filteredRatings.length}</span> из {totalCount}
            </p>
          </div>
        )}

        {/* Ratings List */}
        <RatingsList ratings={filteredRatings} loading={loading} />
      </div>
    </div>
  )
}
