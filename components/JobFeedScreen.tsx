'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Shield, CheckCircle, ArrowRight, Inbox } from 'lucide-react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

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
    <div
      className="w-full min-h-screen flex flex-col"
      style={{
        backgroundImage: 'url(/images/gradient-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* HEADER */}
      <Header title="Лента смен" showBack={false} showNotifications={true} />

      {/* JOB CARDS FEED */}
      <div className="flex-1 overflow-y-auto pt-24 pb-24 px-5 font-sans">
        <div className="flex flex-col gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => console.log(`Navigating to job ${job.id}`)}
                className="rounded-3xl p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl"
                style={{
                  background: '#F5F5F5',
                  boxShadow: job.urgent ? '0 4px 16px rgba(232, 93, 47, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                  border: job.urgent ? '2px solid #E85D2F' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Job Type Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900 flex-1" style={{ color: '#1A1A1A' }}>
                    {job.type}
                  </h3>
                  {job.urgent && (
                    <span
                      className="text-xs font-bold uppercase px-2.5 py-1 rounded-lg ml-2 flex-shrink-0"
                      style={{ background: '#E85D2F', color: '#FFFFFF' }}
                    >
                      Срочно
                    </span>
                  )}
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-1.5 mb-2 text-sm" style={{ color: '#6B6B6B' }}>
                  <Calendar size={14} />
                  <span>
                    {job.date} • {job.time}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-4 text-sm" style={{ color: '#6B6B6B' }}>
                  <MapPin size={14} />
                  <span>{job.location}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-300 my-4" style={{ background: '#D0D0D0' }} />

                {/* Footer: Rate & Badges */}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                      {job.rate} ₽
                    </div>
                    <div className="text-xs" style={{ color: '#6B6B6B' }}>
                      {job.duration}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {job.escrow && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(232, 93, 47, 0.1)' }}
                      >
                        <Shield size={16} style={{ color: '#E85D2F' }} />
                      </div>
                    )}
                    {job.verified && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(191, 255, 0, 0.1)' }}
                      >
                        <CheckCircle size={16} style={{ color: '#BFFF00' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`Apply to job ${job.id}`)
                  }}
                  className="w-full h-11 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: '#E85D2F',
                    boxShadow: '0 4px 12px rgba(232, 93, 47, 0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#D04D1F'
                    e.currentTarget.style.transform = 'translateX(2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#E85D2F'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <span>Откликнуться</span>
                  <ArrowRight size={16} />
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

        {/* BOTTOM NAVIGATION */}
        <BottomNav userType="worker" />
      </div>
    </div>
  )
}
