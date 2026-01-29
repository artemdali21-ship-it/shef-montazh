'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Shield, CheckCircle, ArrowRight, Inbox } from 'lucide-react'
import { Header } from './Header'

const jobs = [
  {
    id: 1,
    type: 'Монтаж выставочного стенда',
    date: '28 января',
    time: '18:00 - 02:00',
    duration: '8 часов',
    location: 'Крокус Экспо, павильон 3',
    rate: 2500,
    urgent: false,
    verified: true,
    escrow: true,
  },
  {
    id: 2,
    type: 'Демонтаж декораций',
    date: 'Сегодня',
    time: '20:00 - 02:00',
    duration: '6 часов',
    location: 'ЦВЗ Манеж',
    rate: 3200,
    urgent: true,
    verified: true,
    escrow: true,
  },
  {
    id: 3,
    type: 'Сборка металлических ферм',
    date: '27 января',
    time: '10:00 - 18:00',
    duration: '8 часов',
    location: 'Экспоцентр, зал 1',
    rate: 2800,
    urgent: false,
    verified: true,
    escrow: true,
  },
  {
    id: 4,
    type: 'Монтаж световой техники',
    date: 'Сегодня',
    time: '14:00 - 22:00',
    duration: '8 часов',
    location: 'БКЗ Октябрьский',
    rate: 3500,
    urgent: true,
    verified: true,
    escrow: true,
  },
  {
    id: 5,
    type: 'Установка временных конструкций',
    date: '29 января',
    time: '08:00 - 17:00',
    duration: '9 часов',
    location: 'Мосводоканал',
    rate: 2600,
    urgent: false,
    verified: true,
    escrow: true,
  },
]

const filters = [
  { id: 'all', label: 'Все', count: 5 },
  { id: 'nearby', label: 'Рядом', count: 2 },
  { id: 'today', label: 'Сегодня', count: 2 },
  { id: 'urgent', label: 'Срочно', count: 2 },
]

export default function JobFeedScreen() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'nearby') return Math.random() > 0.6
    if (activeFilter === 'today') return job.date === 'Сегодня'
    if (activeFilter === 'urgent') return job.urgent
    return true
  })

  return (
    <div className="w-full flex flex-col">
      {/* HEADER */}
      <Header title="Лента смен" showBack={false} showNotifications={true} />

      {/* JOB CARDS FEED */}
      <div className="flex-1 overflow-y-auto pt-20 pb-4 px-5 font-sans">
        <div className="flex flex-col gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  router.push(`/job/${job.id}`)
                  console.log(`[v0] Navigating to job ${job.id}`)
                }}
                className="rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
                style={{
                  background: '#F5F5F5',
                  boxShadow: job.urgent ? '0 4px 16px rgba(232, 93, 47, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                  border: job.urgent ? '2px solid #E85D2F' : 'none',
                }}
              >
                {/* Job Type Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-2xl font-semibold text-gray-900 flex-1 leading-snug" style={{ color: '#1A1A1A' }}>
                    {job.type}
                  </h3>
                  {job.urgent && (
                    <span
                      className="text-xs font-bold uppercase px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
                      style={{ background: '#E85D2F', color: '#FFFFFF' }}
                    >
                      Срочно
                    </span>
                  )}
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 mb-3 text-sm font-medium" style={{ color: '#6B6B6B' }}>
                  <Calendar size={14} />
                  <span>
                    {job.date} • {job.time}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-4 text-sm font-medium" style={{ color: '#6B6B6B' }}>
                  <MapPin size={16} strokeWidth={2} />
                  <span>{job.location}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-300 my-6" style={{ background: '#D0D0D0' }} />

                {/* Footer: Rate & Badges */}
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="text-2xl font-semibold" style={{ color: '#1A1A1A' }}>
                      {job.rate} ₽
                    </div>
                    <div className="text-sm text-gray-500" style={{ color: '#6B6B6B' }}>
                      {job.duration}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.escrow && (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(232, 93, 47, 0.15)', border: '1px solid rgba(232, 93, 47, 0.3)' }}
                      >
                        <Shield size={20} strokeWidth={2} style={{ color: '#E85D2F' }} />
                      </div>
                    )}
                    {job.verified && (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(191, 255, 0, 0.15)', border: '1px solid rgba(191, 255, 0, 0.3)' }}
                      >
                        <CheckCircle size={20} strokeWidth={2} style={{ color: '#BFFF00' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/application?jobId=${job.id}`)
                    console.log(`[v0] Apply to job ${job.id}`)
                  }}
                  className="w-full h-12 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: '#E85D2F',
                    boxShadow: '0 6px 20px rgba(232, 93, 47, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#D04D1F'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#E85D2F'
                  }}
                >
                  <span>Откликнуться</span>
                  <ArrowRight size={20} strokeWidth={2} />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Inbox size={48} style={{ color: '#6B6B6B' }} className="mb-4" />
              <h3 className="text-lg font-bold text-white mb-2" style={{ color: '#FFFFFF' }}>
                Нет доступных смен
              </h3>
              <p className="text-sm" style={{ color: '#9B9B9B' }}>
                Попробуйте изменить фильтры
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
