'use client'

import { useRouter } from 'next/navigation'
import { Star, Shield, Briefcase, Users, Heart } from 'lucide-react'
import { WorkerSearchResult } from '@/lib/api/worker-search'
import Image from 'next/image'

interface WorkerGridProps {
  workers: WorkerSearchResult[]
  loading?: boolean
  onFavoriteToggle?: (workerId: string) => void
  favoriteIds?: Set<string>
}

export default function WorkerGrid({
  workers,
  loading,
  onFavoriteToggle,
  favoriteIds = new Set()
}: WorkerGridProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/10 rounded-full" />
              <div className="flex-1">
                <div className="h-5 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (workers.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
        <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          Исполнители не найдены
        </h3>
        <p className="text-gray-400">
          Попробуйте изменить фильтры или сбросить их
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workers.map((worker) => {
        const isFavorite = favoriteIds.has(worker.id)
        const completionRate = worker.total_shifts > 0
          ? Math.round((worker.successful_shifts / worker.total_shifts) * 100)
          : 0

        return (
          <div
            key={worker.id}
            onClick={() => router.push(`/worker/${worker.id}`)}
            className="card-hover animate-fade-in bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition cursor-pointer relative"
          >
            {/* Favorite Button */}
            {onFavoriteToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFavoriteToggle(worker.id)
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition z-10"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`}
                />
              </button>
            )}

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              {/* Avatar */}
              <div className="relative w-16 h-16 flex-shrink-0">
                {worker.avatar_url ? (
                  <Image
                    src={worker.avatar_url}
                    alt={worker.full_name}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {worker.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {worker.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Name & Rating */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white mb-1 truncate">
                  {worker.full_name}
                </h3>
                <div className="flex items-center gap-2">
                  {worker.rating > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-semibold text-sm">
                        {worker.rating.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Нет оценок</span>
                  )}
                  {worker.gosuslugi_verified && (
                    <Shield className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            {worker.categories && worker.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {worker.categories.slice(0, 3).map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-md text-xs font-medium"
                  >
                    {cat}
                  </span>
                ))}
                {worker.categories.length > 3 && (
                  <span className="px-2 py-1 bg-white/5 text-gray-400 rounded-md text-xs font-medium">
                    +{worker.categories.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Shifts */}
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">Смен</span>
                </div>
                <span className="text-white font-bold text-sm">
                  {worker.successful_shifts}/{worker.total_shifts}
                </span>
              </div>

              {/* Completion Rate */}
              <div className="bg-white/5 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Star className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">Успех</span>
                </div>
                <span className="text-white font-bold text-sm">
                  {completionRate}%
                </span>
              </div>
            </div>

            {/* Bio */}
            {worker.bio && (
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                {worker.bio}
              </p>
            )}

            {/* Experience */}
            {worker.experience_years && worker.experience_years > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <span>Опыт:</span>
                <span className="text-white font-semibold">
                  {worker.experience_years} {worker.experience_years === 1 ? 'год' : 'лет'}
                </span>
              </div>
            )}

            {/* Footer */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/worker/${worker.id}`)
              }}
              className="w-full py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-sm font-semibold transition"
            >
              Посмотреть профиль
            </button>
          </div>
        )
      })}
    </div>
  )
}
