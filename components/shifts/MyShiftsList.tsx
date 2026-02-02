'use client'

import { useState, useEffect } from 'react'
import ShiftCard from './ShiftCard'

interface MyShiftsListProps {
  userId: string
  userRole: 'worker' | 'client' | 'shef' | 'admin'
}

export default function MyShiftsList({ userId, userRole }: MyShiftsListProps) {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    loadShifts()
  }, [userId, filter])

  const loadShifts = async () => {
    setLoading(true)
    try {
      const endpoint = userRole === 'client'
        ? `/api/shifts?client_id=${userId}&status=${filter !== 'all' ? filter : ''}`
        : `/api/shifts?worker_id=${userId}&status=${filter !== 'all' ? filter : ''}`

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setShifts(data)
      }
    } catch (error) {
      console.error('Error loading shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterButtons = [
    { value: 'all', label: 'Все' },
    { value: 'upcoming', label: 'Предстоящие' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершенные' }
  ]

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === btn.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && shifts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'У вас пока нет смен' : 'Нет смен в этой категории'}
          </h3>
          <p className="text-gray-600">
            {userRole === 'client'
              ? 'Создайте свою первую смену, чтобы найти работников'
              : 'Откликнитесь на доступные смены'}
          </p>
        </div>
      )}

      {/* Shifts Grid */}
      {!loading && shifts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift) => (
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
