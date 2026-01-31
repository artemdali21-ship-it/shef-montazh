'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Heart, Star, Shield, MessageCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { getFavorites } from '@/lib/api/favorites'
import FavoriteButton from '@/components/user/FavoriteButton'
import Image from 'next/image'

export default function ClientFavoritesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data } = await getFavorites(user.id)
      setFavorites(data)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = (targetUserId: string) => {
    setFavorites(prev => prev.filter(f => f.favorite_user?.id !== targetUserId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-h1 text-white">Избранные исполнители</h1>
            <p className="text-body-small text-gray-400">
              {favorites.length} {favorites.length === 1 ? 'исполнитель' : 'исполнителей'}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              У вас пока нет избранных
            </h3>
            <p className="text-gray-400 mb-6">
              Добавляйте исполнителей в избранное, чтобы быстро находить их
            </p>
            <button
              onClick={() => router.push('/search')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition"
            >
              Найти исполнителей
            </button>
          </div>
        ) : (
          /* Grid of Favorites */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav) => {
              const user = fav.favorite_user
              if (!user) return null

              return (
                <div
                  key={fav.id}
                  onClick={() => router.push(`/worker/${user.id}`)}
                  className="card-hover animate-fade-in bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {user.is_verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                          <Shield className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {user.full_name}
                      </h3>
                      {user.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 font-semibold text-sm">
                            {user.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Смен</p>
                      <p className="text-white font-bold text-sm">
                        {user.successful_shifts}/{user.total_shifts}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Успех</p>
                      <p className="text-white font-bold text-sm">
                        {user.total_shifts > 0
                          ? Math.round((user.successful_shifts / user.total_shifts) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {userId && (
                      <FavoriteButton
                        userId={userId}
                        targetUserId={user.id}
                        isFavorite={true}
                        onToggle={(isFav) => {
                          if (!isFav) handleRemoveFavorite(user.id)
                        }}
                        size="sm"
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Open chat
                        alert('Чат будет реализован в следующей версии')
                      }}
                      className="py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Написать</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
