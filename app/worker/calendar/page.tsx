'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, eachDayOfInterval } from 'date-fns'
import { ru } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { createClient } from '@/lib/supabase-client'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Ban, Plus } from 'lucide-react'
import DayView from '@/components/calendar/DayView'
import BlockDatesModal from '@/components/calendar/BlockDatesModal'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  getDay,
  locales: { ru }
})

interface ShiftEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: string
  pay_amount: number
  location: string
  client_name: string
  type: 'shift' | 'blocked'
}

interface BlockedDate {
  id: string
  start_date: string
  end_date: string
  reason: string | null
}

export default function CalendarPage() {
  const supabase = createClient()
  const [shifts, setShifts] = useState<ShiftEvent[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [allEvents, setAllEvents] = useState<ShiftEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'day'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showBlockModal, setShowBlockModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Combine shifts and blocked dates
    const blockedEvents: ShiftEvent[] = blockedDates.flatMap(block => {
      const days = eachDayOfInterval({
        start: new Date(block.start_date),
        end: new Date(block.end_date)
      })

      return days.map(day => ({
        id: `blocked-${block.id}-${day.toISOString()}`,
        title: block.reason || 'Я занят',
        start: new Date(day.setHours(0, 0, 0, 0)),
        end: new Date(day.setHours(23, 59, 59, 999)),
        status: 'blocked',
        type: 'blocked' as const,
        pay_amount: 0,
        location: '',
        client_name: ''
      }))
    })

    setAllEvents([...shifts, ...blockedEvents])
  }, [shifts, blockedDates])

  const loadData = async () => {
    await Promise.all([loadShifts(), loadBlockedDates()])
  }

  const loadShifts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('shift_workers')
        .select(`
          id,
          status,
          shifts (
            id,
            title,
            date,
            start_time,
            end_time,
            pay_amount,
            location_address,
            users!client_id (
              full_name
            )
          )
        `)
        .eq('worker_id', user.id)

      if (error) throw error

      if (data) {
        const events: ShiftEvent[] = data
          .filter(item => item.shifts)
          .map(item => {
            const shift = item.shifts as any
            return {
              id: shift.id,
              title: shift.title,
              start: new Date(`${shift.date}T${shift.start_time}`),
              end: new Date(`${shift.date}T${shift.end_time}`),
              status: item.status,
              type: 'shift' as const,
              pay_amount: shift.pay_amount,
              location: shift.location_address,
              client_name: shift.users?.full_name || 'Неизвестно'
            }
          })

        setShifts(events)
      }
    } catch (error) {
      console.error('Error loading shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBlockedDates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true })

      if (error) throw error

      if (data) {
        setBlockedDates(data)
      }
    } catch (error) {
      console.error('Error loading blocked dates:', error)
    }
  }

  const handleDeleteBlockedDate = async (blockId: string) => {
    if (!confirm('Удалить блокировку дат?')) return

    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', blockId)

      if (error) throw error

      await loadBlockedDates()
    } catch (error) {
      console.error('Error deleting blocked date:', error)
      alert('Ошибка при удалении блокировки')
    }
  }

  const eventStyleGetter = (event: ShiftEvent) => {
    if (event.type === 'blocked') {
      return {
        style: {
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          borderColor: '#6B7280',
          color: '#9CA3AF'
        }
      }
    }

    const statusColors: Record<string, any> = {
      assigned: {
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: '#F97316',
        color: '#F97316'
      },
      checked_in: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10B981',
        color: '#10B981'
      },
      completed: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: '#22C55E',
        color: '#22C55E'
      },
      cancelled: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: '#EF4444',
        color: '#EF4444'
      }
    }

    return {
      style: statusColors[event.status] || {
        backgroundColor: 'rgba(156, 163, 175, 0.2)',
        borderColor: '#9CA3AF',
        color: '#9CA3AF'
      }
    }
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start)
    setView('day')
  }

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  const handleViewChange = (newView: any) => {
    setView(newView)
  }

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV')
    }

    const goToNext = () => {
      toolbar.onNavigate('NEXT')
    }

    const goToToday = () => {
      toolbar.onNavigate('TODAY')
    }

    const label = () => {
      const date = toolbar.date
      return format(date, 'LLLL yyyy', { locale: ru })
    }

    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={goToBack}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-white font-medium"
          >
            Сегодня
          </button>
          <button
            onClick={goToNext}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-bold text-white capitalize">{label()}</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'month'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Месяц
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'day'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            День
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard p-4 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  if (view === 'day') {
    return (
      <DayView
        date={selectedDate || currentDate}
        shifts={allEvents}
        onBackToCalendar={() => setView('month')}
        blockedDates={blockedDates}
        onDeleteBlock={handleDeleteBlockedDate}
      />
    )
  }

  return (
    <div className="min-h-screen bg-dashboard p-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Календарь смен</h1>
              <p className="text-gray-400">
                Смен: {shifts.length} • Блокировок: {blockedDates.length}
              </p>
            </div>
          </div>

          {/* Block Dates Button */}
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-xl font-medium transition border border-gray-500/30"
          >
            <Ban className="w-5 h-5" />
            <span>Я занят</span>
          </button>
        </div>

        {/* Legend */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/20 border-2 border-orange-500"></div>
              <span className="text-sm text-gray-300">Назначена</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500"></div>
              <span className="text-sm text-gray-300">Отмечен</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600/20 border-2 border-green-600"></div>
              <span className="text-sm text-gray-300">Завершена</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border-2 border-red-500"></div>
              <span className="text-sm text-gray-300">Отменена</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-500/20 border-2 border-gray-500"></div>
              <span className="text-sm text-gray-300">Я занят</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={allEvents}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
              onSelectSlot={handleSelectSlot}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              view={view}
              views={[Views.MONTH, Views.DAY]}
              culture="ru"
              selectable
              components={{
                toolbar: CustomToolbar
              }}
              messages={{
                next: 'Следующий',
                previous: 'Предыдущий',
                today: 'Сегодня',
                month: 'Месяц',
                week: 'Неделя',
                day: 'День',
                agenda: 'Повестка',
                date: 'Дата',
                time: 'Время',
                event: 'Событие',
                showMore: (total) => `+${total} ещё`
              }}
            />
          </div>
        </div>

        {/* Blocked Dates List */}
        {blockedDates.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mt-6">
            <h2 className="text-xl font-bold text-white mb-4">Заблокированные периоды</h2>
            <div className="space-y-3">
              {blockedDates.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div>
                    <div className="text-white font-medium">
                      {format(new Date(block.start_date), 'd MMM', { locale: ru })} -{' '}
                      {format(new Date(block.end_date), 'd MMM yyyy', { locale: ru })}
                    </div>
                    {block.reason && (
                      <div className="text-sm text-gray-400 mt-1">{block.reason}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBlockedDate(block.id)}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition border border-red-500/30"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Block Dates Modal */}
      {showBlockModal && (
        <BlockDatesModal
          onClose={() => setShowBlockModal(false)}
          onSuccess={() => {
            loadBlockedDates()
          }}
        />
      )}
    </div>
  )
}
