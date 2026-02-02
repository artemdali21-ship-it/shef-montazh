'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ShiftDetailProps {
  shift: {
    id: string
    title: string
    category: string
    description?: string
    location_address: string
    location_lat?: number
    location_lng?: number
    date: string
    start_time: string
    end_time: string
    pay_amount: number
    required_workers: number
    status: string
    requirements?: string
    client_id: string
    client?: {
      id: string
      full_name: string
      rating?: number
      phone?: string
    }
    applications_count?: number
    accepted_count?: number
  }
  userRole?: 'worker' | 'client' | 'shef' | 'admin'
  userId?: string
  hasApplied?: boolean
  isAccepted?: boolean
}

export default function ShiftDetail({ shift, userRole, userId, hasApplied, isAccepted }: ShiftDetailProps) {
  const router = useRouter()
  const [isApplying, setIsApplying] = useState(false)
  const [message, setMessage] = useState('')

  const canApply = userRole === 'worker' &&
                   shift.status === 'published' &&
                   !hasApplied &&
                   !isAccepted

  const handleApply = async () => {
    if (!userId) {
      router.push('/auth/login')
      return
    }

    setIsApplying(true)
    try {
      const response = await fetch('/api/shifts/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shift_id: shift.id,
          worker_id: userId,
          message
        })
      })

      if (response.ok) {
        alert('Заявка отправлена!')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Ошибка при отправке заявки')
      }
    } catch (error) {
      alert('Ошибка при отправке заявки')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {shift.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {shift.category}
              </span>
              <span>ID: {shift.id.slice(0, 8)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {shift.pay_amount.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-500">за смену</div>
          </div>
        </div>

        {shift.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Описание</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{shift.description}</p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Time & Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Время и место</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">Дата</div>
              <div className="text-gray-900">
                {new Date(shift.date).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Время работы</div>
              <div className="text-gray-900">
                {shift.start_time} - {shift.end_time}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Адрес</div>
              <div className="text-gray-900">{shift.location_address}</div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Заказчик</h3>
          {shift.client ? (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">Название</div>
                <div className="text-gray-900">{shift.client.full_name}</div>
              </div>
              {shift.client.rating && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Рейтинг</div>
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">⭐</span>
                    <span className="text-gray-900 font-medium">
                      {shift.client.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500 mb-1">Требуется работников</div>
                <div className="text-gray-900">
                  {shift.accepted_count || 0} / {shift.required_workers}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Информация недоступна</p>
          )}
        </div>
      </div>

      {/* Requirements */}
      {shift.requirements && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Требования</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{shift.requirements}</p>
        </div>
      )}

      {/* Application Section for Workers */}
      {canApply && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Откликнуться на смену</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Сопроводительное сообщение (необязательно)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              {message.length} / 500 символов
            </span>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isApplying ? 'Отправка...' : 'Откликнуться'}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {hasApplied && !isAccepted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          ✓ Вы уже откликнулись на эту смену. Ожидайте решения заказчика.
        </div>
      )}

      {isAccepted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✓ Вы приняты на эту смену!
        </div>
      )}
    </div>
  )
}
