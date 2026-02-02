'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadShifts()
  }, [filter])

  const loadShifts = async () => {
    setLoading(true)
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : ''
      const response = await fetch(`/api/shifts?limit=100${statusParam}`)
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

  const cancelShift = async (shiftId: string) => {
    if (!confirm('Отменить смену? Это действие необратимо.')) {
      return
    }

    try {
      const response = await fetch(`/api/shifts/${shiftId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        await loadShifts()
      } else {
        alert('Ошибка при отмене смены')
      }
    } catch (error) {
      console.error('Error cancelling shift:', error)
      alert('Ошибка при отмене смены')
    }
  }

  const deleteShift = async (shiftId: string) => {
    if (!confirm('Удалить смену? Это действие необратимо.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/shifts/${shiftId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadShifts()
      } else {
        alert('Ошибка при удалении смены')
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      alert('Ошибка при удалении смены')
    }
  }

  const statusLabels = {
    draft: 'Черновик',
    published: 'Опубликована',
    applications: 'Прием заявок',
    accepted: 'Набрана',
    checking_in: 'Отметка',
    in_progress: 'В работе',
    completed: 'Завершена',
    reviewed: 'Оценена',
    cancelled: 'Отменена'
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    applications: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    checking_in: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    reviewed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Загрузка смен..." />
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Управление сменами</h2>
          <span className="text-sm text-gray-600">
            Всего: <span className="font-semibold">{shifts.length}</span> смен
          </span>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'published', 'applications', 'accepted', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Все' : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Смена
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Заказчик
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Дата
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Оплата
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Смены не найдены
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{shift.title}</div>
                        <div className="text-sm text-gray-500">{shift.category}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          {shift.location_address}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {shift.client?.full_name || 'Не указан'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {new Date(shift.date).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {shift.start_time} - {shift.end_time}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {shift.pay_amount.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-gray-500">
                        {shift.accepted_count || 0} / {shift.required_workers} набрано
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[shift.status]}`}>
                        {statusLabels[shift.status] || shift.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/shifts/${shift.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm"
                        >
                          👁 Просмотр
                        </Link>
                        {shift.status !== 'cancelled' && shift.status !== 'completed' && (
                          <button
                            onClick={() => cancelShift(shift.id)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded text-sm"
                          >
                            ❌ Отменить
                          </button>
                        )}
                        <button
                          onClick={() => deleteShift(shift.id)}
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
