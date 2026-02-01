'use client'

import { useState, useEffect } from 'react'
import { MapPin, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface LocationPickerProps {
  onLocationChange: (location: { lat: number; lng: number } | null) => void
  showAddress?: boolean
}

export default function LocationPicker({ onLocationChange, showAddress = true }: LocationPickerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    requestLocation()
  }, [])

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const newLocation = { lat: latitude, lng: longitude }

        setLocation(newLocation)
        onLocationChange(newLocation)
        setLoading(false)

        // Get address if enabled
        if (showAddress) {
          await getAddress(latitude, longitude)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Не удалось получить вашу геопозицию. Разрешите доступ к местоположению.')
        setLoading(false)
        onLocationChange(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const getAddress = async (lat: number, lng: number) => {
    try {
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

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            location ? 'bg-green-500/20' : 'bg-blue-500/20'
          }`}>
            <MapPin className={`w-5 h-5 ${location ? 'text-green-400' : 'text-blue-400'}`} />
          </div>
          <h3 className="text-lg font-semibold text-white">Ваше местоположение</h3>
        </div>
        {!loading && (
          <button
            onClick={requestLocation}
            className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Определение местоположения...</span>
        </div>
      )}

      {error && (
        <div>
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
          <button
            onClick={requestLocation}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium transition text-sm"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {location && !loading && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium text-sm">Местоположение определено</span>
          </div>

          {showAddress && address && (
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">{address}</p>
          )}

          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>Широта: {location.lat.toFixed(6)}</span>
            <span>Долгота: {location.lng.toFixed(6)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
