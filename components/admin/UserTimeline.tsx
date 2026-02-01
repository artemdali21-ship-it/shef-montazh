'use client'

import { Calendar, Star, DollarSign, AlertTriangle, Shield, User, Ban, CheckCircle, MessageCircle, Users, Clock } from 'lucide-react'
import { useState } from 'react'

interface TimelineEvent {
  type: string
  date: string
  icon: any
  color: string
  bgColor: string
  title: string
  description: string
  metadata?: any
}

interface Props {
  history: {
    user: any
    shifts: any[]
    ratingsReceived: any[]
    ratingsGiven: any[]
    payments: any[]
    disputes: any[]
    logs: any[]
  }
}

const eventTypeLabels: Record<string, string> = {
  'all': 'Все события',
  'user': 'Пользователь',
  'shift': 'Смены',
  'rating': 'Рейтинги',
  'payment': 'Платежи',
  'dispute': 'Споры',
  'audit': 'Действия'
}

export default function UserTimeline({ history }: Props) {
  const [filter, setFilter] = useState('all')

  // Combine and sort all events
  const allEvents: TimelineEvent[] = [
    {
      type: 'user.created',
      date: history.user.created_at,
      icon: Shield,
      color: 'blue-400',
      bgColor: 'blue-500/20',
      title: 'Регистрация',
      description: `Пользователь зарегистрировался на платформе`,
      metadata: { email: history.user.email }
    },
    // Shifts
    ...history.shifts.map((s: any) => ({
      type: 'shift',
      date: s.shift?.date || s.created_at,
      icon: Calendar,
      color: s.status === 'completed' ? 'green-400' : s.status === 'cancelled' ? 'red-400' : 'orange-400',
      bgColor: s.status === 'completed' ? 'green-500/20' : s.status === 'cancelled' ? 'red-500/20' : 'orange-500/20',
      title: s.shift?.title || 'Смена',
      description: `Статус: ${s.status}`,
      metadata: {
        shift_id: s.shift_id,
        price: s.shift?.price,
        category: s.shift?.category
      }
    })),
    // Ratings received
    ...history.ratingsReceived.map((r: any) => ({
      type: 'rating',
      date: r.created_at,
      icon: Star,
      color: 'yellow-400',
      bgColor: 'yellow-500/20',
      title: 'Получен рейтинг',
      description: `${r.rating}/5 от ${r.from_user?.full_name || 'клиента'}${r.comment ? ': "' + r.comment.slice(0, 50) + '..."' : ''}`,
      metadata: {
        rating: r.rating,
        from: r.from_user?.full_name,
        comment: r.comment
      }
    })),
    // Ratings given
    ...history.ratingsGiven.map((r: any) => ({
      type: 'rating',
      date: r.created_at,
      icon: Star,
      color: 'purple-400',
      bgColor: 'purple-500/20',
      title: 'Оставил рейтинг',
      description: `${r.rating}/5 для ${r.to_user?.full_name || 'исполнителя'}`,
      metadata: {
        rating: r.rating,
        to: r.to_user?.full_name
      }
    })),
    // Payments
    ...history.payments.map((p: any) => ({
      type: 'payment',
      date: p.created_at,
      icon: DollarSign,
      color: p.status === 'paid' || p.status === 'succeeded' ? 'green-400' : p.status === 'failed' ? 'red-400' : 'yellow-400',
      bgColor: p.status === 'paid' || p.status === 'succeeded' ? 'green-500/20' : p.status === 'failed' ? 'red-500/20' : 'yellow-500/20',
      title: 'Платёж',
      description: `${p.amount?.toLocaleString('ru-RU')} ₽ - ${p.status}`,
      metadata: {
        amount: p.amount,
        status: p.status,
        payment_id: p.id
      }
    })),
    // Disputes
    ...history.disputes.map((d: any) => ({
      type: 'dispute',
      date: d.created_at,
      icon: AlertTriangle,
      color: d.status === 'resolved' ? 'blue-400' : 'red-400',
      bgColor: d.status === 'resolved' ? 'blue-500/20' : 'red-500/20',
      title: d.status === 'resolved' ? 'Спор разрешён' : 'Создан спор',
      description: d.reason || `Статус: ${d.status}`,
      metadata: {
        status: d.status,
        reason: d.reason
      }
    })),
    // Audit logs
    ...history.logs.map((log: any) => ({
      type: 'audit',
      date: log.created_at,
      icon: getAuditIcon(log.action),
      color: getAuditColor(log.action),
      bgColor: getAuditBgColor(log.action),
      title: formatActionName(log.action),
      description: log.entity_type ? `${log.entity_type}` : 'Действие',
      metadata: log.metadata
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filter events
  const filteredEvents = filter === 'all'
    ? allEvents
    : allEvents.filter(e => e.type === filter || e.type.startsWith(filter + '.'))

  const eventTypes = ['all', 'user', 'shift', 'rating', 'payment', 'dispute', 'audit']

  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {eventTypeLabels[type]}
            </button>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-400">
          Найдено событий: {filteredEvents.length}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => {
            const Icon = event.icon

            return (
              <div key={index} className="flex gap-4">
                {/* Icon Column */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 bg-${event.bgColor} rounded-full flex items-center justify-center border-2 border-white/10`}>
                    <Icon size={20} className={`text-${event.color}`} />
                  </div>
                  {index < filteredEvents.length - 1 && (
                    <div className="w-0.5 flex-1 bg-white/10 mt-2 min-h-[40px]" />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 pb-4">
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{event.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={14} />
                        <span>
                          {new Date(event.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span>
                          {new Date(event.date).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{event.description}</p>

                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                          Подробнее
                        </summary>
                        <pre className="mt-2 text-xs text-gray-400 bg-black/30 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              События не найдены
            </h3>
            <p className="text-gray-400">
              Нет событий для отображения с выбранным фильтром
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function getAuditIcon(action: string) {
  if (action.includes('created')) return CheckCircle
  if (action.includes('banned')) return Ban
  if (action.includes('message')) return MessageCircle
  if (action.includes('team')) return Users
  if (action.includes('payment')) return DollarSign
  if (action.includes('shift')) return Calendar
  if (action.includes('rating')) return Star
  return User
}

function getAuditColor(action: string) {
  if (action.includes('created')) return 'green-400'
  if (action.includes('banned') || action.includes('deleted')) return 'red-400'
  if (action.includes('completed') || action.includes('resolved')) return 'blue-400'
  if (action.includes('updated')) return 'yellow-400'
  return 'gray-400'
}

function getAuditBgColor(action: string) {
  if (action.includes('created')) return 'green-500/20'
  if (action.includes('banned') || action.includes('deleted')) return 'red-500/20'
  if (action.includes('completed') || action.includes('resolved')) return 'blue-500/20'
  if (action.includes('updated')) return 'yellow-500/20'
  return 'gray-500/20'
}

function formatActionName(action: string): string {
  const parts = action.split('.')
  if (parts.length === 2) {
    const [entity, verb] = parts
    const entityMap: Record<string, string> = {
      'user': 'Пользователь',
      'shift': 'Смена',
      'payment': 'Платёж',
      'rating': 'Рейтинг',
      'dispute': 'Спор',
      'team': 'Бригада',
      'worker': 'Исполнитель',
      'message': 'Сообщение'
    }
    const verbMap: Record<string, string> = {
      'created': 'создан',
      'updated': 'обновлён',
      'deleted': 'удалён',
      'banned': 'заблокирован',
      'unbanned': 'разблокирован',
      'completed': 'завершён',
      'assigned': 'назначен',
      'processed': 'обработан',
      'resolved': 'разрешён'
    }
    return `${entityMap[entity] || entity} ${verbMap[verb] || verb}`
  }
  return action
}
