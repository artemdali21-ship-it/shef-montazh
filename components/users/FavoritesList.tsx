'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface FavoritesListProps {
  userId: string
}

export default function FavoritesList({ userId }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [userId])

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/favorites?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoritedUserId: string) => {
    if (!confirm('Удалить из избранного?')) return

    try {
      const response = await fetch(
        `/api/favorites?userId=${userId}&favoritedUserId=${favoritedUserId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setFavorites(favorites.filter(f => f.favorited_user_id !== favoritedUserId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Ошибка при удалении из избранного')
    }
  }

  if (loading) {
    return <LoadingSpinner text="Загрузка избранного..." />
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⭐</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          У вас пока нет избранных
        </h3>
        <p className="text-gray-600">
          Добавляйте пользователей в избранное для быстрого доступа
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {favorites.map((favorite) => (
        <div
          key={favorite.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              {favorite.favorited_user.role === 'worker' ? '👷' : '🏢'}
            </div>
            <div>
              <Link
                href={`/profile/${favorite.favorited_user_id}`}
                className="font-semibold text-gray-900 hover:text-blue-600"
              >
                {favorite.favorited_user.full_name}
              </Link>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span className="capitalize">{favorite.favorited_user.role}</span>
                {favorite.favorited_user.rating && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-600">
                      ⭐ {favorite.favorited_user.rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/messages/${favorite.favorited_user_id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Написать сообщение"
            >
              💬
            </Link>
            <button
              onClick={() => removeFavorite(favorite.favorited_user_id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Удалить из избранного"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
