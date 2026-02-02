'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'worker' | 'client' | 'shef' | 'admin'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const roleParam = filter !== 'all' ? `&role=${filter}` : ''
      const response = await fetch(`/api/admin/users?limit=100${roleParam}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Заблокировать' : 'Разблокировать'} пользователя?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        await loadUsers()
      } else {
        alert('Ошибка при изменении статуса')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert('Ошибка при изменении статуса')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить пользователя? Это действие необратимо.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadUsers()
      } else {
        alert('Ошибка при удалении пользователя')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Ошибка при удалении пользователя')
    }
  }

  const filteredUsers = users.filter(user =>
    searchQuery === '' ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const roleLabels = {
    worker: 'Работник',
    client: 'Заказчик',
    shef: 'Шеф',
    admin: 'Администратор'
  }

  const roleIcons = {
    worker: '🔧',
    client: '🏢',
    shef: '👨‍💼',
    admin: '⚙️'
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Загрузка пользователей..." />
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Управление пользователями</h2>
          <span className="text-sm text-gray-600">
            Всего: <span className="font-semibold">{filteredUsers.length}</span> пользователей
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени или email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2">
            {(['all', 'worker', 'client', 'shef', 'admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role === 'all' ? 'Все' : roleLabels[role]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Пользователь
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Роль
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Рейтинг
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Регистрация
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name || 'Не указано'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        <span>{roleIcons[user.role]}</span>
                        <span>{roleLabels[user.role] || user.role}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.rating ? (
                        <span className="text-yellow-600">
                          ⭐ {user.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                        user.is_active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active !== false ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active !== false)}
                          className={`px-3 py-1 rounded text-sm ${
                            user.is_active !== false
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {user.is_active !== false ? '🔒 Блок' : '🔓 Разблок'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm"
                        >
                          🗑 Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
