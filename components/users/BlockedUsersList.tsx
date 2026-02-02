'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface BlockedUsersListProps {
  userId: string
}

export default function BlockedUsersList({ userId }: BlockedUsersListProps) {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBlockedUsers()
  }, [userId])

  const loadBlockedUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blocked?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBlockedUsers(data)
      }
    } catch (error) {
      console.error('Error loading blocked users:', error)
    } finally {
      setLoading(false)
    }
  }

  const unblockUser = async (blockedUserId: string) => {
    if (!confirm('Разблокировать пользователя?')) return

    try {
      const response = await fetch(
        `/api/blocked?blockerId=${userId}&blockedUserId=${blockedUserId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(b => b.blocked_user_id !== blockedUserId))
      }
    } catch (error) {
      console.error('Error unblocking user:', error)
      alert('Ошибка при разблокировке')
    }
  }

  if (loading) {
    return <LoadingSpinner text="Загрузка заблокированных..." />
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚫</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Нет заблокированных пользователей
        </h3>
        <p className="text-gray-600">
          Вы можете блокировать пользователей из их профиля
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          ℹ️ Заблокированные пользователи не смогут видеть ваши смены и отправлять вам сообщения
        </p>
      </div>

      {blockedUsers.map((blocked) => (
        <div
          key={blocked.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
              🚫
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {blocked.blocked_user.full_name}
              </div>
              <div className="text-sm text-gray-600">
                <span className="capitalize">{blocked.blocked_user.role}</span>
              </div>
              {blocked.reason && (
                <div className="text-sm text-gray-500 mt-1">
                  Причина: {blocked.reason}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                Заблокирован {new Date(blocked.created_at).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>

          <button
            onClick={() => unblockUser(blocked.blocked_user_id)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Разблокировать
          </button>
        </div>
      ))}
    </div>
  )
}
