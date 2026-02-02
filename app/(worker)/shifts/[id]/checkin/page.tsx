'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import { MapPin, Camera, CheckCircle } from 'lucide-react'

export default function CheckInPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const toast = useToast()

  const shiftId = params.id as string

  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    loadShift()
    requestLocation()
  }, [])

  const loadShift = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: shiftData, error } = await supabase
        .from('shifts')
        .select('*, shift_assignments(id, status, check_in_time)')
        .eq('id', shiftId)
        .single()

      if (error) throw error

      setShift(shiftData)

      // Check if already checked in
      const assignment = shiftData.shift_assignments?.[0]
      if (assignment?.check_in_time) {
        toast.success('Вы уже отметились!')
        router.push(`/worker/shifts/${shiftId}`)
      }
    } catch (error) {
      console.error('Error loading shift:', error)
      toast.error('Не удалось загрузить смену')
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation не поддерживается вашим браузером')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        console.log('Location obtained:', position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocationError('Не удалось получить местоположение. Разрешите доступ к геолокации.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (minimum 100kb)
    if (file.size < 100 * 1024) {
      toast.error('Фото должно быть не менее 100 КБ')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
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

  const handleCheckIn = async () => {
    if (!latitude || !longitude) {
      toast.error('Ожидание геолокации...')
      return
    }

    if (!photoFile) {
      toast.error('Пожалуйста, загрузите фото')
      return
    }

    try {
      setCheckingIn(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload photo to Supabase Storage
      const fileName = `${shiftId}-${user.id}-${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('check-in-photos')
        .upload(fileName, photoFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('check-in-photos')
        .getPublicUrl(fileName)

      // Submit check-in
      const response = await fetch('/api/shifts/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          workerId: user.id,
          latitude,
          longitude,
          photoUrl: publicUrl
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Check-in failed')
      }

      toast.success('Вы успешно отметились!')
      router.push(`/worker/shifts/${shiftId}`)
    } catch (error: any) {
      console.error('Check-in error:', error)
      toast.error(error.message || 'Ошибка при отметке')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Check-in на смену</h1>

        {shift && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">{shift.title}</h2>
            <p className="text-gray-400 text-sm mb-4">{shift.location_address}</p>
            <p className="text-gray-400 text-sm">
              🕐 {shift.start_time} - {shift.end_time}
            </p>
          </div>
        )}

        {/* Location Status */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className={`w-6 h-6 ${latitude && longitude ? 'text-green-400' : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold text-white">Геолокация</h3>
          </div>

          {locationError ? (
            <div>
              <p className="text-red-400 text-sm mb-3">{locationError}</p>
              <button
                onClick={requestLocation}
                className="w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                Попробовать снова
              </button>
            </div>
          ) : latitude && longitude ? (
            <div>
              <p className="text-green-400 text-sm">
                ✓ Местоположение определено
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Определяем ваше местоположение...</p>
          )}
        </div>

        {/* Photo Upload */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Camera className={`w-6 h-6 ${photoFile ? 'text-green-400' : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold text-white">Фото</h3>
          </div>

          {photoPreview ? (
            <div className="mb-4">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
          ) : null}

          <label className="block w-full py-3 bg-white/10 text-white rounded-xl text-center cursor-pointer hover:bg-white/20 transition">
            <span>{photoFile ? 'Изменить фото' : 'Загрузить фото'}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>

          <p className="text-gray-500 text-xs mt-2">
            Минимум 100 КБ. Сделайте фото объекта или рабочего места.
          </p>
        </div>

        {/* Check-in Button */}
        <button
          onClick={handleCheckIn}
          disabled={checkingIn || !latitude || !longitude || !photoFile}
          className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {checkingIn ? (
            'Отмечаем...'
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Я вышел на объект
            </>
          )}
        </button>
      </div>
    </div>
  )
}
