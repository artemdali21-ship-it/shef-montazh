'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { addToFavorites, removeFromFavorites } from '@/lib/api/favorites'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  userId: string // current user
  targetUserId: string // user to favorite
  isFavorite?: boolean // initial state
  onToggle?: (isFavorite: boolean) => void // callback
  variant?: 'icon' | 'full' // icon only or with text
  size?: 'sm' | 'md' | 'lg'
}

export default function FavoriteButton({
  userId,
  targetUserId,
  isFavorite: initialFavorite = false,
  onToggle,
  variant = 'full',
  size = 'md',
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation() // prevent parent click
    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        const { success } = await removeFromFavorites(userId, targetUserId)
        if (success) {
          setIsFavorite(false)
          toast.success('Удалено из избранного')
          onToggle?.(false)
        } else {
          toast.error('Ошибка удаления')
        }
      } else {
        // Add to favorites
        const { success } = await addToFavorites(userId, targetUserId)
        if (success) {
          setIsFavorite(true)
          toast.success('Добавлено в избранное')
          onToggle?.(true)
        } else {
          toast.error('Ошибка добавления')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center justify-center rounded-full transition ${
          isFavorite
            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${sizeClasses[size]}`}
        aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      >
        <Star
          className={`${iconSizes[size]} ${isFavorite ? 'fill-yellow-400' : ''}`}
        />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center justify-center gap-1.5 rounded-lg font-semibold transition ${
        isFavorite
          ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30'
          : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${sizeClasses[size]}`}
    >
      <Star className={`${iconSizes[size]} ${isFavorite ? 'fill-yellow-400' : ''}`} />
      <span className="hidden sm:inline">
        {isFavorite ? 'В избранном' : 'В избранное'}
      </span>
    </button>
  )
}
