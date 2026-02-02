'use client'

import { useEffect, useState } from 'react'
import ShiftCard from '@/components/shifts/ShiftCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ShiftHistoryProps {
  userId: string
  role: 'worker' | 'client'
}

export default function ShiftHistory({ userId, role }: ShiftHistoryProps) {
  const [shifts, setShifts] = useState<any[]>([])
  const [filteredShifts, setFilteredShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadHistory()
  }, [userId])

  useEffect(() => {
    applyFilters()
  }, [shifts, statusFilter, dateFilter, categoryFilter, sortBy, sortOrder])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const endpoint = role === 'worker'
        ? `/api/shifts?worker_id=${userId}`
        : `/api/shifts?client_id=${userId}`

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setShifts(data)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...shifts]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Date filter
    const now = new Date()
    if (dateFilter !== 'all') {
      filtered = filtered.filter(s => {
        const shiftDate = new Date(s.date)
        switch (dateFilter) {
          case 'week':
            return (now.getTime() - shiftDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
          case 'month':
            return (now.getTime() - shiftDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
          case 'year':
            return (now.getTime() - shiftDate.getTime()) <= 365 * 24 * 60 * 60 * 1000
          default:
            return true
        }
      })
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        return sortOrder === 'asc' ? comparison : -comparison
      } else {
        const comparison = a.pay_amount - b.pay_amount
        return sortOrder === 'asc' ? comparison : -comparison
      }
    })

    setFilteredShifts(filtered)
  }

  const categories = Array.from(new Set(shifts.map(s => s.category)))

  if (loading) {
    return <LoadingSpinner text="Загрузка истории..." />
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Фильтры</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Все</option>
              <option value="published">Опубликованные</option>
              <option value="applications">Прием заявок</option>
              <option value="accepted">Набранные</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершенные</option>
              <option value="cancelled">Отмененные</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Период</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Весь период</option>
              <option value="week">Последняя неделя</option>
              <option value="month">Последний месяц</option>
              <option value="year">Последний год</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Категория</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Все категории</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Сортировка</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="date">По дате</option>
                <option value="amount">По оплате</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-gray-600">Найдено смен:</span>
          <span className="font-semibold text-gray-900">{filteredShifts.length}</span>
          {filteredShifts.length !== shifts.length && (
            <button
              onClick={() => {
                setStatusFilter('all')
                setDateFilter('all')
                setCategoryFilter('all')
              }}
              className="ml-2 text-blue-600 hover:text-blue-700"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredShifts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Смены не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить фильтры
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              variant="my-shifts"
            />
          ))}
        </div>
      )}
    </div>
  )
}
