'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [role, setRole] = useState(searchParams.get('role') || 'all')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  useEffect(() => {
    const params = new URLSearchParams()

    if (search) params.set('search', search)
    if (role !== 'all') params.set('role', role)
    if (status !== 'all') params.set('status', status)

    router.push(`/admin/users?${params.toString()}`)
  }, [search, role, status, router])

  const handleReset = () => {
    setSearch('')
    setRole('all')
    setStatus('all')
  }

  const hasActiveFilters = search || role !== 'all' || status !== 'all'

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-white">Фильтры</h2>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="ml-auto text-sm text-orange-400 hover:text-orange-300"
          >
            Сбросить
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Поиск
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Имя или email..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Роль
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">Все роли</option>
            <option value="client">Заказчик</option>
            <option value="worker">Исполнитель</option>
            <option value="shef">Шеф</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Статус
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="banned">Заблокированные</option>
          </select>
        </div>
      </div>
    </div>
  )
}
