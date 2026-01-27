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
      
      {/* 3D decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        opacity: 0.15,
        pointerEvents: 'none',
      }}>
        <img src="/images/wrench.png" alt="" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
      </div>
      <div style={{
        position: 'absolute',
        bottom: '-5%',
        left: '-8%',
        opacity: 0.15,
        pointerEvents: 'none',
      }}>
        <img src="/images/bolts.png" alt="" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
      </div>

      <div className="relative z-10">
        <header className="h-16 flex items-center px-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </header>

        <div className="px-4 py-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">С возвращением!</h1>
            <p className="text-[#9B9B9B] font-medium">Войдите, чтобы продолжить работу</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-500 font-semibold">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Номер телефона</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" />
                <input
                  type="tel"
                  placeholder="+7 (900) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-[#6B6B6B] font-medium focus:outline-none focus:border-[#E85D2F]/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-white">Пароль</label>
                <button type="button" onClick={() => router.push('/forgot-password')} className="text-xs text-[#E85D2F] font-bold">
                  Забыли пароль?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 pr-12 text-white placeholder:text-[#6B6B6B] font-medium focus:outline-none focus:border-[#E85D2F]/50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-5 h-5 text-[#9B9B9B]" /> : <Eye className="w-5 h-5 text-[#9B9B9B]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#E85D2F] hover:bg-[#D94D1F] active:scale-95 disabled:opacity-50 rounded-xl font-bold text-white transition-all mt-6"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-sm text-[#9B9B9B] font-medium">Нет аккаунта? </span>
            <button onClick={() => router.push('/register')} className="text-sm text-[#E85D2F] font-bold underline">
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
