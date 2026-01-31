'use client'

import { useState } from 'react'
import { Ban, X } from 'lucide-react'
import { blockUser, unblockUser } from '@/lib/api/blocked'
import toast from 'react-hot-toast'

interface BlockButtonProps {
  userId: string // current user
  targetUserId: string // user to block
  targetUserName?: string // for confirmation modal
  isBlocked?: boolean // initial state
  onBlock?: () => void // callback after block/unblock
  variant?: 'icon' | 'full'
  size?: 'sm' | 'md' | 'lg'
}

export default function BlockButton({
  userId,
  targetUserId,
  targetUserName = 'этого пользователя',
  isBlocked: initialBlocked = false,
  onBlock,
  variant = 'full',
  size = 'md',
}: BlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(initialBlocked)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isBlocked) {
      // Unblock directly
      handleUnblock()
    } else {
      // Show modal for block
      setShowModal(true)
    }
  }

  const handleBlock = async () => {
    setLoading(true)

    try {
      const { success } = await blockUser(userId, targetUserId, reason)
      if (success) {
        setIsBlocked(true)
        setShowModal(false)
        setReason('')
        toast.success('Пользователь заблокирован')
        onBlock?.()
      } else {
        toast.error('Ошибка блокировки')
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      toast.error('Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async () => {
    setLoading(true)

    try {
      const { success } = await unblockUser(userId, targetUserId)
      if (success) {
        setIsBlocked(false)
        toast.success('Пользователь разблокирован')
        onBlock?.()
      } else {
        toast.error('Ошибка разблокировки')
      }
    } catch (error) {
      console.error('Error unblocking user:', error)
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

  return (
    <>
      {/* Button */}
      {variant === 'icon' ? (
        <button
          onClick={handleBlockClick}
          disabled={loading}
          className={`flex items-center justify-center rounded-full transition ${
            isBlocked
              ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${sizeClasses[size]}`}
          aria-label={isBlocked ? 'Разблокировать' : 'Заблокировать'}
        >
          <Ban className={iconSizes[size]} />
        </button>
      ) : (
        <button
          onClick={handleBlockClick}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 rounded-lg font-semibold transition ${
            isBlocked
              ? 'bg-gray-500/20 border border-gray-500/30 text-gray-400 hover:bg-gray-500/30'
              : 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${sizeClasses[size]}`}
        >
          <Ban className={iconSizes[size]} />
          <span className="hidden sm:inline">
            {isBlocked ? 'Разблокировать' : 'Заблокировать'}
          </span>
        </button>
      )}

      {/* Block Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A2A] rounded-2xl border border-white/10 max-w-md w-full p-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Заблокировать пользователя</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-400 mb-4">
              Вы уверены, что хотите заблокировать <span className="text-white font-semibold">{targetUserName}</span>?
            </p>

            {/* Reason Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Причина блокировки (опционально)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Например: Некорректное поведение, spam..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/200 символов
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleBlock}
                disabled={loading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Блокировка...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    Заблокировать
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
