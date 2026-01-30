'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, MapPin } from 'lucide-react'

interface CheckInButtonProps {
  shiftId: string
  shiftDate: string
  startTime: string
  status: 'confirmed' | 'on_way' | 'checked_in' | 'checked_out'
}

export default function CheckInButton({
  shiftId,
  shiftDate,
  startTime,
  status,
}: CheckInButtonProps) {
  const router = useRouter()
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0)
  const [canCheckIn, setCanCheckIn] = useState(false)

  useEffect(() => {
    const calculateTimeUntilStart = () => {
      const now = new Date()
      const shiftDateTime = new Date(`${shiftDate}T${startTime}`)
      const diffMs = shiftDateTime.getTime() - now.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)

      setTimeUntilStart(diffMinutes)
      // Can check in 30 minutes before start time
      setCanCheckIn(diffMinutes <= 30 && diffMinutes >= -60)
    }

    calculateTimeUntilStart()
    const interval = setInterval(calculateTimeUntilStart, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [shiftDate, startTime])

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 0) {
      return 'Смена началась'
    }
    if (minutes < 60) {
      return `Доступно через ${minutes} мин`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `Доступно через ${hours}ч ${mins}м`
  }

  if (status === 'checked_in') {
    return (
      <div className="w-full py-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-bold text-lg text-center flex items-center justify-center gap-2">
        <MapPin className="w-6 h-6" />
        Вы на объекте
      </div>
    )
  }

  if (status === 'checked_out' || status === 'completed') {
    return (
      <div className="w-full py-4 bg-gray-500/20 border border-gray-500/30 rounded-xl text-gray-400 font-bold text-lg text-center">
        Смена завершена
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!canCheckIn && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{formatTimeRemaining(timeUntilStart)}</span>
        </div>
      )}
      <button
        onClick={() => router.push(`/shift/${shiftId}/checkin`)}
        disabled={!canCheckIn}
        className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg flex items-center justify-center gap-2 ${
          canCheckIn
            ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
            : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
        }`}
      >
        <MapPin className="w-6 h-6" />
        {status === 'on_way' ? 'Я на объекте' : 'Выйти на смену'}
      </button>
    </div>
  )
}
