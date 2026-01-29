'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

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

export default function PhoneVerificationScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams?.get('role') as 'worker' | 'client' | 'shef' | null
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(59)

  useEffect(() => {
    if (role) {
      localStorage.setItem('userRole', role)
    }
  }, [role])

  useEffect(() => {
    if (countdown <= 0) return
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [countdown])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) return

    setLoading(true)
    setTimeout(() => {
      // Route based on role
      if (role === 'worker') {
        router.push('/worker-categories')
      } else if (role === 'client') {
        router.push('/dashboard')
      } else if (role === 'shef') {
        router.push('/shef-dashboard')
      } else {
        router.push('/profile-setup')
      }
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

        <div className="px-5 py-8 flex flex-col justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-white mb-3">Подтверждение номера</h1>
            <p className="text-gray-300 text-base font-normal">Мы отправили код подтверждения на ваш номер</p>
          </div>

          <div className="space-y-8 flex flex-col items-center">
            <div className="flex gap-3 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="w-12 h-12 bg-white/10 border-2 border-white/20 rounded-lg text-center text-2xl font-bold text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={code.join('').length !== 6 || loading}
              className="w-full max-w-xs h-12 bg-[#E85D2F] hover:bg-[#D04D1F] active:scale-95 disabled:opacity-50 rounded-lg font-semibold text-white transition-all duration-300"
            >
              {loading ? 'Проверяем...' : 'Подтвердить'}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-300 font-normal mb-3">Не получили код?</p>
              <button 
                disabled={countdown > 0}
                className="text-sm text-[#E85D2F] font-semibold hover:text-[#FF8B4A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Отправить заново ({countdown} сек)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
