'use client'

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { ru }
})

interface ShiftEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: string
  pay_amount?: number
  location?: string
  client_name?: string
}

interface Props {
  shifts: ShiftEvent[]
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  onSelectEvent?: (event: ShiftEvent) => void
  onNavigate?: (date: Date) => void
  view?: 'month' | 'week' | 'day'
  onViewChange?: (view: string) => void
  currentDate?: Date
}

export default function ShiftCalendar({
  shifts,
  onSelectSlot,
  onSelectEvent,
  onNavigate,
  view = 'month',
  onViewChange,
  currentDate = new Date()
}: Props) {
  const eventStyleGetter = (event: ShiftEvent) => {
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

        <div className="w-40" /> {/* Spacer for alignment */}
      </div>
    )
  }

  return (
    <Calendar
      localizer={localizer}
      events={shifts}
      startAccessor="start"
      endAccessor="end"
      eventPropGetter={eventStyleGetter}
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      onNavigate={onNavigate}
      onView={onViewChange}
      view={view as any}
      date={currentDate}
      views={[Views.MONTH, Views.WEEK, Views.DAY]}
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
  )
}
