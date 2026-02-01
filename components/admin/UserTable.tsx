'use client'

import { useState } from 'react'
import { Ban, Eye, CheckCircle, Star, Shield, Clock } from 'lucide-react'
import BanUserModal from './BanUserModal'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

interface WorkerProfile {
  status: string | null
  ban_reason: string | null
  ban_until: string | null
  verification_status: string | null
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  rating: number | null
  created_at: string
  worker_profiles?: WorkerProfile[]
}

interface Props {
  users: User[]
}

export default function UserTable({ users }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [unbanning, setUnbanning] = useState<string | null>(null)

  const getBanStatus = (user: User) => {
    const profile = user.worker_profiles?.[0]
    if (!profile || profile.status !== 'banned') return null

    const until = profile.ban_until ? new Date(profile.ban_until) : null
    const isPermanent = !until
    const isExpired = until && until < new Date()

    if (isExpired) return null
    if (isPermanent) return 'Навсегда'
    return `До ${until.toLocaleDateString('ru-RU')}`
  }

  const handleUnban = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите разблокировать этого пользователя?')) {
      return
    }

    setUnbanning(userId)

    try {
      const { error } = await supabase
        .from('worker_profiles')
        .update({
          status: 'active',
          ban_reason: null,
          ban_until: null
        })
        .eq('user_id', userId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Unban error:', error)
      alert('Ошибка при разблокировке пользователя')
    } finally {
      setUnbanning(null)
    }
  }

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
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
        <p className="text-gray-400">Пользователи не найдены</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Пользователь</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Роль</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Рейтинг</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Статус</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Регистрация</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => {
                const banStatus = getBanStatus(user)
                const profile = user.worker_profiles?.[0]

                return (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          {user.full_name}
                          {(user.role === 'admin' || user.role === 'shef') && (
                            <Shield className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium text-white">{user.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {banStatus ? (
                        <div>
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30 inline-block">
                            Заблокирован
                          </span>
                          {profile?.ban_reason && (
                            <div className="text-xs text-gray-500 mt-1">
                              {profile.ban_reason}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {banStatus}
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                          Активен
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${user.id}/history`}
                          className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
                          title="История пользователя"
                        >
                          <Clock size={18} />
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
                          title="Просмотр профиля"
                        >
                          <Eye size={18} />
                        </Link>
                        {!banStatus ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowBanModal(true)
                            }}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition text-red-400 hover:text-red-300"
                            title="Заблокировать"
                          >
                            <Ban size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnban(user.id)}
                            disabled={unbanning === user.id}
                            className="p-2 hover:bg-green-500/10 rounded-lg transition text-green-400 hover:text-green-300 disabled:opacity-50"
                            title="Разблокировать"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showBanModal && selectedUser && (
        <BanUserModal
          user={selectedUser}
          onClose={() => {
            setShowBanModal(false)
            setSelectedUser(null)
          }}
          onSuccess={() => {
            setShowBanModal(false)
            setSelectedUser(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
