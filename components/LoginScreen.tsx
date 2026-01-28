'use client'

import { useState } from 'react'
import { ArrowLeft, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react'
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

export default function LoginScreen() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    if (!phone || !password) {
      setError('Заполните все поля')
      setLoading(false)
      return
    }

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
        <header className="h-16 flex items-center px-5">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
        </header>

        <div className="px-5 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">С возвращением!</h1>
            <p className="text-gray-300 text-base font-normal">Войдите, чтобы продолжить работу</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
              <div className="flex gap-3">
                <AlertCircle size={20} strokeWidth={2} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300 font-semibold">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div>
              <label className="block text-sm font-semibold text-white mb-3">Номер телефона</label>
              <div className="relative">
                <Phone size={20} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+7 (900) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-gray-400 text-base font-normal focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-white">Пароль</label>
                <button type="button" onClick={() => router.push('/forgot-password')} className="text-xs text-[#E85D2F] font-semibold">
                  Забыли пароль?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 pr-12 text-white placeholder:text-gray-400 text-base font-normal focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all duration-300"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff size={20} strokeWidth={2} className="text-gray-400" /> : <Eye size={20} strokeWidth={2} className="text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#E85D2F] hover:bg-[#D04D1F] active:scale-95 disabled:opacity-50 rounded-lg font-semibold text-white transition-all duration-300 mt-8"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <div className="text-center mt-8">
            <span className="text-sm text-gray-300 font-normal">Нет аккаунта? </span>
            <button onClick={() => router.push('/register')} className="text-sm text-[#E85D2F] font-semibold hover:underline">
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
