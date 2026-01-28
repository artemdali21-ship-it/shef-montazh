'use client'

import React from "react"

import { useState } from 'react'
import { ArrowLeft, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'

const NoisePattern = () => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: 0.03,
    }}
  >
    <defs>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2" />
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
)

export default function ProfileSetupScreen() {
  const router = useRouter()
  const [avatar, setAvatar] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatar(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setTimeout(() => {
      router.push('/feed')
      setLoading(false)
    }, 1500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <NoisePattern />
      
      {/* 3D decorative elements - HIDDEN FOR TELEGRAM MINI APP */}
      {/* Removed to prevent overflow issues in Telegram Mini App */}

      <div className="relative z-10">
        <header className="h-16 flex items-center justify-between px-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <span className="text-xs text-gray-300 font-semibold">Шаг 3 из 3</span>
          <div className="w-10"></div>
        </header>

        <div className="px-5 py-8 pb-32">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-3">Завершите профиль</h1>
            <p className="text-gray-300 text-base font-normal">Добавьте информацию о себе</p>
          </div>

          <form className="space-y-6">
            <div className="flex justify-center">
              <label className="relative cursor-pointer">
                <div className="w-24 h-24 bg-white/10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center hover:border-white/40 transition-all duration-300">
                  {avatar ? (
                    <img src={avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Camera size={20} strokeWidth={2} className="text-gray-300" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">Биография</label>
              <textarea
                placeholder="Расскажите о себе..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 text-base font-normal focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all duration-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">Город</label>
              <input
                type="text"
                placeholder="Москва"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-400 text-base font-normal focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">Опыт работы (лет)</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-base font-normal focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all duration-300"
              >
                <option value="">Выберите опыт</option>
                <option value="0-1">0-1 год</option>
                <option value="1-3">1-3 года</option>
                <option value="3-5">3-5 лет</option>
                <option value="5+">5+ лет</option>
              </select>
            </div>
          </form>
        </div>

        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'rgba(42, 42, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full h-12 bg-[#E85D2F] hover:bg-[#D04D1F] active:scale-95 disabled:opacity-50 rounded-lg font-semibold text-white transition-all duration-300"
          >
            {loading ? 'Завершаем...' : 'Завершить'}
          </button>
          <p className="text-xs text-center text-gray-300 font-normal mt-4">Вы можете заполнить это позже</p>
        </div>
      </div>
    </div>
  )
}
