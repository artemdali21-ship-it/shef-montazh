'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Check, Clock } from 'lucide-react'
import { getWorkerShiftStatus, type ShiftWorker } from '@/lib/api/shift-workers'

interface CheckInButtonProps {
  shiftId: string
  workerId: string
  shiftDate: string
  shiftStartTime: string
}

export default function CheckInButton({
  shiftId,
  workerId,
  shiftDate,
  shiftStartTime
}: CheckInButtonProps) {
  const router = useRouter()
  const [workerStatus, setWorkerStatus] = useState<ShiftWorker | null>(null)
  const [canCheckIn, setCanCheckIn] = useState(false)
  const [timeUntilCheckIn, setTimeUntilCheckIn] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
  }, [shiftId, workerId])

  useEffect(() => {
    const interval = setInterval(() => {
      updateCheckInAvailability()
    }, 1000)

    return () => clearInterval(interval)
  }, [shiftDate, shiftStartTime])

  const loadStatus = async () => {
    try {
      const { data } = await getWorkerShiftStatus(shiftId, workerId)
      setWorkerStatus(data)
    } catch (error) {
      console.error('Error loading status:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCheckInAvailability = () => {
    const now = new Date()
    const shiftDateTime = new Date(`${shiftDate}T${shiftStartTime}`)
    const thirtyMinutesBefore = new Date(shiftDateTime.getTime() - 30 * 60 * 1000)

    const diff = thirtyMinutesBefore.getTime() - now.getTime()

    if (diff <= 0) {
      setCanCheckIn(true)
      setTimeUntilCheckIn('')
    } else {
      setCanCheckIn(false)

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeUntilCheckIn(`через ${hours}ч ${minutes}м`)
      } else {
        setTimeUntilCheckIn(`через ${minutes}м`)
      }
    }
  }

  const handleCheckIn = () => {
    router.push(`/shifts/${shiftId}/checkin`)
  }

  if (loading) {
    return (
      <div className="w-full py-4 bg-white/5 rounded-xl flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Already checked in
  if (workerStatus?.status === 'checked_in' || workerStatus?.status === 'checked_out' || workerStatus?.status === 'completed') {
    return (
      <div className="w-full py-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center gap-2">
        <Check className="w-5 h-5 text-green-400" />
        <span className="text-green-400 font-medium">
          {workerStatus.status === 'checked_in' ? 'Вы на объекте' :
           workerStatus.status === 'checked_out' ? 'Смена завершена' :
           'Смена завершена'}
        </span>
      </div>
    )
  }

  // On the way
  if (workerStatus?.status === 'on_way') {
    if (canCheckIn) {
      return (
        <button
          onClick={handleCheckIn}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg"
        >
          <MapPin className="w-5 h-5" />
          Я вышел на объект
        </button>
      )
    } else {
      return (
        <div className="w-full py-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">В пути</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Check-in откроется {timeUntilCheckIn}
          </p>
        </div>
      )
    }
  }

  // Confirmed, can check in
  if (canCheckIn) {
    return (
      <button
        onClick={handleCheckIn}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg"
      >
        <MapPin className="w-5 h-5" />
        Я вышел на объект
      </button>
    )
  }

  // Too early to check in
  return (
    <div className="w-full py-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-gray-400" />
        <span className="text-gray-300 font-medium">Check-in недоступен</span>
      </div>
      <p className="text-xs text-gray-400 text-center">
        Откроется {timeUntilCheckIn}
      </p>
    </div>
  )
}
