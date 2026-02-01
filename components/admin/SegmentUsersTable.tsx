'use client'

import Link from 'next/link'
import { Star, User, Clock, Shield } from 'lucide-react'

interface Props {
  users: any[]
  segmentId: string
}

export default function SegmentUsersTable({ users, segmentId }: Props) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'shef':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'worker':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'client':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор'
      case 'shef':
        return 'Шеф'
      case 'worker':
        return 'Исполнитель'
      case 'client':
        return 'Заказчик'
      default:
        return role
    }
  }

  if (users.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
        <User size={48} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Пользователи не найдены
        </h3>
        <p className="text-gray-400">
          В этом сегменте пока нет пользователей
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Пользователь
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Роль
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Рейтинг
              </th>
              {segmentId === 'vip-clients' && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Потрачено
                </th>
              )}
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Регистрация
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                        {user.full_name?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {user.full_name}
                        {(user.role === 'admin' || user.role === 'shef') && (
                          <Shield size={14} className="text-orange-400" />
                        )}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-400">{user.phone}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-300 text-sm">{user.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.rating ? (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-white">{user.rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                {segmentId === 'vip-clients' && (
                  <td className="px-6 py-4">
                    <span className="font-semibold text-green-400">
                      {user.total_spent?.toLocaleString('ru-RU')} ₽
                    </span>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} />
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition"
                    >
                      Открыть
                    </Link>
                    <Link
                      href={`/admin/users/${user.id}/history`}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition"
                    >
                      История
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-sm text-gray-400 text-center">
        Показано пользователей: {users.length}
      </div>
    </div>
  )
}
