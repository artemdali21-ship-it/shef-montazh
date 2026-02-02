'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ShiftCardProps {
  shift: {
    id: string
    title: string
    category: string
    location_address: string
    date: string
    start_time: string
    end_time: string
    pay_amount: number
    required_workers: number
    status: string
    client?: {
      full_name: string
      rating?: number
    }
    applications_count?: number
    accepted_count?: number
  }
  variant?: 'default' | 'my-shifts' | 'applications'
  showActions?: boolean
}

export default function ShiftCard({ shift, variant = 'default', showActions = false }: ShiftCardProps) {
  const statusColors: Record<string, string> = {
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

  const statusLabels: Record<string, string> = {
    draft: 'Черновик',
    published: 'Опубликована',
    applications: 'Прием заявок',
    accepted: 'Набрана',
    checking_in: 'Отметка прихода',
    in_progress: 'В работе',
    completed: 'Завершена',
    reviewed: 'Оценена',
    cancelled: 'Отменена'
  }

  const categoryEmojis: Record<string, string> = {
    'монтаж': '🔧',
    'демонтаж': '🔨',
    'освещение': '💡',
    'звук': '🎵',
    'видео': '📹',
    'сцена': '🎭',
    'декор': '🎨',
    'другое': '📦'
  }

  return (
    <Link href={`/shifts/${shift.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {shift.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{categoryEmojis[shift.category] || '📦'}</span>
              <span>{shift.category}</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[shift.status] || 'bg-gray-100 text-gray-800'}`}>
            {statusLabels[shift.status] || shift.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span className="truncate">{shift.location_address}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📅</span>
            <span>{new Date(shift.date).toLocaleDateString('ru-RU')}</span>
            <span className="mx-2">•</span>
            <span>{shift.start_time} - {shift.end_time}</span>
          </div>
          {shift.client && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">👤</span>
              <span>{shift.client.full_name}</span>
              {shift.client.rating && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-yellow-600">⭐ {shift.client.rating.toFixed(1)}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {shift.pay_amount.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs text-gray-500">за смену</div>
          </div>

          {variant === 'default' && (
            <div className="text-sm text-gray-600">
              {shift.accepted_count || 0} / {shift.required_workers} набрано
            </div>
          )}

          {variant === 'my-shifts' && shift.applications_count !== undefined && (
            <div className="text-sm text-blue-600 font-medium">
              {shift.applications_count} заявок
            </div>
          )}
        </div>

        {/* Actions (optional) */}
        {showActions && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Подробнее
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}
