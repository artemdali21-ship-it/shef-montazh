'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Camera, MapPin, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { getShiftById } from '@/lib/api/shifts'
import { checkInWorker, getWorkerShiftStatus } from '@/lib/api/shift-workers'
import type { Tables } from '@/lib/supabase-types'

type Shift = Tables<'shifts'>

export default function CheckInPage() {
  const params = useParams()
  const router = useRouter()
  const shiftId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock worker ID - in production, get from auth context
  const MOCK_WORKER_ID = 'worker-123'

  const [shift, setShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Geolocation state
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState<string>('')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    loadShiftData()
    requestGeolocation()
  }, [shiftId])

  const loadShiftData = async () => {
    try {
      setLoading(true)

      // Load shift
      const { data: shiftData, error: shiftError } = await getShiftById(shiftId)
      if (shiftError) throw shiftError
      if (!shiftData) throw new Error('Смена не найдена')

      setShift(shiftData)

      // Check if worker is assigned to this shift
      const { data: workerStatus, error: statusError } = await getWorkerShiftStatus(
        shiftId,
        MOCK_WORKER_ID
      )

      if (statusError || !workerStatus) {
        setError('Вы не назначены на эту смену')
        return
      }

      if (workerStatus.status === 'checked_in') {
        setError('Вы уже отметились на этой смене')
        setTimeout(() => router.push(`/shift/${shiftId}`), 2000)
        return
      }
    } catch (err: any) {
      console.error('Error loading shift:', err)
      setError(err.message || 'Не удалось загрузить данные смены')
    } finally {
      setLoading(false)
    }
  }

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Геолокация не поддерживается вашим браузером')
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
        setLoadingLocation(false)

        // Reverse geocode to get address
        await getAddressFromCoordinates(latitude, longitude)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocationError('Не удалось получить вашу геолокацию. Разрешите доступ к геолокации.')
        setLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`
      )
      const data = await response.json()

      if (data.display_name) {
        setAddress(data.display_name)
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Размер файла не должен превышать 10MB')
        return
      }

      setPhotoFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCheckIn = async () => {
    if (!photoFile) {
      alert('Пожалуйста, загрузите фото с объекта')
      return
    }

    if (!location) {
      alert('Не удалось получить вашу геолокацию. Попробуйте еще раз.')
      requestGeolocation()
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const { error: checkInError } = await checkInWorker(
        shiftId,
        MOCK_WORKER_ID,
        photoFile,
        location.lat,
        location.lng
      )

      if (checkInError) {
        throw new Error('Не удалось отметиться на смене')
      }

      // Success - redirect to shift page
      router.push(`/shift/${shiftId}`)
    } catch (err: any) {
      console.error('Check-in error:', err)
      setError(err.message || 'Произошла ошибка при отметке')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error && !shift) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition font-semibold"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Отметка на объекте</h1>
            {shift && (
              <p className="text-sm text-gray-400 truncate">{shift.title}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Geolocation Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Ваше местоположение</h2>
          </div>

          {loadingLocation ? (
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Определение местоположения...</span>
            </div>
          ) : locationError ? (
            <div>
              <p className="text-red-400 text-sm mb-3">{locationError}</p>
              <button
                onClick={requestGeolocation}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-medium transition text-sm"
              >
                Попробовать снова
              </button>
            </div>
          ) : location ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Местоположение определено</span>
              </div>
              {address && (
                <p className="text-sm text-gray-300 mt-2 leading-relaxed">{address}</p>
              )}
              <div className="mt-3 flex gap-3 text-xs text-gray-500">
                <span>Широта: {location.lat.toFixed(6)}</span>
                <span>Долгота: {location.lng.toFixed(6)}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Photo Upload Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Фото с объекта *</h2>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {photoPreview ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition"
              >
                Изменить фото
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-12 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-xl transition flex flex-col items-center gap-3"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="text-white font-medium mb-1">Загрузить фото</p>
                <p className="text-sm text-gray-400">Сделайте фото или выберите из галереи</p>
              </div>
            </button>
          )}

          <p className="text-xs text-gray-500 mt-3">
            Фото должно подтверждать ваше присутствие на объекте
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Check In Button */}
        <button
          onClick={handleCheckIn}
          disabled={submitting || !photoFile || !location}
          className="w-full py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-2xl text-white font-bold text-lg transition shadow-lg shadow-green-500/30 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Отправка...
            </>
          ) : (
            <>
              <CheckCircle className="w-6 h-6" />
              Я вышел на объект
            </>
          )}
        </button>

        {(!photoFile || !location) && (
          <p className="text-center text-sm text-gray-500">
            {!location && 'Ожидание геолокации'}
            {location && !photoFile && 'Загрузите фото для продолжения'}
          </p>
        )}
      </div>
    </div>
  )
}
