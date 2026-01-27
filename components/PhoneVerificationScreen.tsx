'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
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

export default function PhoneVerificationScreen() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)

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
      router.push('/profile-setup')
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
        <header className="h-16 flex items-center px-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
        </header>

        <div className="px-4 py-8 flex flex-col justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">Подтверждение номера</h1>
            <p className="text-[#9B9B9B] font-medium">Мы отправили код подтверждения на ваш номер</p>
          </div>

          <div className="space-y-6 flex flex-col items-center">
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="w-12 h-14 bg-white/10 border-2 border-white/20 rounded-lg text-center text-xl font-bold text-white focus:outline-none focus:border-[#E85D2F] transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={code.join('').length !== 6 || loading}
              className="w-full max-w-xs h-14 bg-[#E85D2F] hover:bg-[#D94D1F] active:scale-95 disabled:opacity-50 rounded-xl font-bold text-white transition-all"
            >
              {loading ? 'Проверяем...' : 'Подтвердить'}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-[#9B9B9B] font-medium mb-2">Не получили код?</p>
              <button className="text-sm text-[#E85D2F] font-bold underline hover:text-[#FF8B4A]">Отправить заново (59 сек)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
