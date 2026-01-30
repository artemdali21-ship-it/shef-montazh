'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Camera, MapPin, ArrowLeft, AlertCircle, CheckCircle, Clock, Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface ShiftData {
  id: string
  title: string
  date: string
  start_time: string
  location_address: string
  status: string
  client_id: string
}

interface CheckInData {
  photo: File | null
  photoPreview: string | null
  latitude: number | null
  longitude: number | null
  manualAddress: string
}

export default function CheckInPage() {
  const router = useRouter()
  const params = useParams()
  const shiftId = params.id as string

  const [shift, setShift] = useState<ShiftData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [canCheckIn, setCanCheckIn] = useState(false)
  const [minutesUntilStart, setMinutesUntilStart] = useState(0)

  const [checkInData, setCheckInData] = useState<CheckInData>({
    photo: null,
    photoPreview: null,
    latitude: null,
    longitude: null,
    manualAddress: '',
  })

  useEffect(() => {
    loadShiftData()
  }, [shiftId])

  useEffect(() => {
    if (shift) {
      checkTimeValidity()
      const interval = setInterval(checkTimeValidity, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [shift])

  async function loadShiftData() {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Load shift data
      const { data: shiftData, error: shiftError } = await supabase
        .from('shifts')
        .select('id, title, date, start_time, location_address, status, client_id')
        .eq('id', shiftId)
        .single()

      if (shiftError) throw shiftError
      if (!shiftData) throw new Error('Смена не найдена')

      setShift(shiftData)

      // Check if already checked in
      const { data: workerData } = await supabase
        .from('shift_workers')
        .select('status, check_in_time')
        .eq('shift_id', shiftId)
        .eq('worker_id', user.id)
        .single()

      if (workerData?.status === 'checked_in' || workerData?.check_in_time) {
        toast.error('Вы уже отметились на этой смене')
        router.push(`/shift/${shiftId}`)
        return
      }
    } catch (err) {
      console.error('Error loading shift:', err)
      toast.error('Не удалось загрузить данные смены')
      router.push('/feed')
    } finally {
      setLoading(false)
    }
  }

  function checkTimeValidity() {
    if (!shift) return

    const now = new Date()
    const shiftDateTime = new Date(`${shift.date}T${shift.start_time}`)
    const timeDiff = shiftDateTime.getTime() - now.getTime()
    const minutesDiff = Math.floor(timeDiff / 60000)

    setMinutesUntilStart(minutesDiff)

    // Can check in 30 minutes before start
    if (minutesDiff <= 30 && minutesDiff >= -60) {
      setCanCheckIn(true)
    } else {
      setCanCheckIn(false)
    }
  }

  async function requestLocation() {
    setGettingLocation(true)

    if (!navigator.geolocation) {
      toast.error('Геолокация не поддерживается вашим браузером')
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCheckInData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
        toast.success('Местоположение определено')
        setGettingLocation(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Не удалось определить местоположение. Введите адрес вручную.')
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setCheckInData(prev => ({
        ...prev,
        photo: file,
        photoPreview: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    // Validation
    if (!checkInData.photo) {
      toast.error('Загрузите фото с объекта')
      return
    }

    if (!checkInData.latitude && !checkInData.manualAddress) {
      toast.error('Укажите местоположение или введите адрес')
      return
    }

    try {
      setSubmitting(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Пользователь не авторизован')

      // 1. Upload photo to Supabase Storage
      const fileExt = checkInData.photo.name.split('.').pop()
      const fileName = `${shiftId}_${user.id}_${Date.now()}.${fileExt}`
      const filePath = `check-ins/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('shift-photos')
        .upload(filePath, checkInData.photo, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('shift-photos')
        .getPublicUrl(filePath)

      // 2. Update shift_workers table
      const { error: updateError } = await supabase
        .from('shift_workers')
        .update({
          check_in_time: new Date().toISOString(),
          check_in_photo_url: publicUrl,
          check_in_lat: checkInData.latitude,
          check_in_lng: checkInData.longitude,
          check_in_address: checkInData.manualAddress || null,
          status: 'checked_in',
          updated_at: new Date().toISOString(),
        })
        .eq('shift_id', shiftId)
        .eq('worker_id', user.id)

      if (updateError) throw updateError

      // 3. Get worker name for notification
      const { data: workerData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      // 4. Send Telegram notification to client
      try {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: shift.client_id,
            type: 'worker_checked_in',
            data: {
              workerName: workerData?.full_name || 'Исполнитель',
              shiftTitle: shift.title,
              checkInTime: new Date().toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          }),
        })
      } catch (notifError) {
        console.error('Failed to send notification:', notifError)
        // Don't fail the whole operation if notification fails
      }

      // Success!
      toast.success('✅ Выход подтверждён!')

      setTimeout(() => {
        router.push(`/shift/${shiftId}`)
      }, 1500)

    } catch (err: any) {
      console.error('Check-in error:', err)
      toast.error(err.message || 'Не удалось подтвердить выход')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!shift) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-20">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-colors duration-200"
            aria-label="Назад"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-h2 text-white">Check-in на смену</h1>
            <p className="text-body-small text-gray-400">{shift.title}</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Time Validation Banner */}
        {!canCheckIn && (
          <motion.div
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body font-semibold text-yellow-400 mb-1">
                  Слишком рано
                </h3>
                <p className="text-body-small text-yellow-400/80">
                  {minutesUntilStart > 30
                    ? `Check-in будет доступен через ${minutesUntilStart - 30} минут`
                    : 'Check-in больше не доступен (смена началась более часа назад)'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shift Info Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <h3 className="text-h3 text-white mb-4">Информация о смене</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-body-small text-gray-400">Начало смены</p>
                <p className="text-body text-white">
                  {new Date(shift.date).toLocaleDateString('ru-RU')} в {shift.start_time.slice(0, 5)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-body-small text-gray-400">Адрес</p>
                <p className="text-body text-white">{shift.location_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <h3 className="text-h3 text-white mb-4">Местоположение</h3>

          {checkInData.latitude && checkInData.longitude ? (
            <div className="flex items-center gap-3 mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-body text-green-400">Местоположение определено</span>
            </div>
          ) : (
            <button
              onClick={requestLocation}
              disabled={gettingLocation || !canCheckIn}
              className="w-full h-14 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-semibold transition-colors duration-200 flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gettingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Определение местоположения...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Определить местоположение
                </>
              )}
            </button>
          )}

          {!checkInData.latitude && (
            <div>
              <label className="block text-body-small text-gray-400 mb-2">
                Или введите адрес вручную
              </label>
              <input
                type="text"
                value={checkInData.manualAddress}
                onChange={(e) => setCheckInData(prev => ({ ...prev, manualAddress: e.target.value }))}
                placeholder="Введите адрес объекта"
                disabled={!canCheckIn}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors duration-200 disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <h3 className="text-h3 text-white mb-2">Фото с объекта</h3>
          <p className="text-body-small text-gray-400 mb-4">Обязательное поле</p>

          {checkInData.photoPreview ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden">
                <Image
                  src={checkInData.photoPreview}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover"
                />
              </div>
              <button
                onClick={() => setCheckInData(prev => ({ ...prev, photo: null, photoPreview: null }))}
                disabled={!canCheckIn}
                className="w-full h-11 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Удалить фото
              </button>
            </div>
          ) : (
            <label className={`block ${canCheckIn ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                disabled={!canCheckIn}
                className="hidden"
              />
              <div className="w-full h-48 border-2 border-dashed border-white/20 rounded-xl hover:border-orange-500/50 transition-colors duration-200 flex flex-col items-center justify-center gap-3 bg-white/5">
                <Camera className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-body text-white mb-1">Сделать фото</p>
                  <p className="text-body-small text-gray-400">или выбрать из галереи</p>
                </div>
              </div>
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!canCheckIn || !checkInData.photo || submitting || (!checkInData.latitude && !checkInData.manualAddress)}
          className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl text-white font-bold text-body-large shadow-lg shadow-green-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Подтвердить выход на объект
            </>
          )}
        </button>

        {/* Help Text */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-body-small text-blue-400">
                <strong>Важно:</strong> Check-in доступен за 30 минут до начала смены.
              </p>
              <p className="text-body-small text-blue-400/80">
                После подтверждения заказчик получит уведомление о вашем прибытии.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
