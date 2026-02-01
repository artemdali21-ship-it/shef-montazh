'use client'

import { useRouter } from 'next/navigation'
import { LogIn, UserPlus } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { hapticLight } from '@/lib/haptic'

export const dynamic = 'force-dynamic'

export default function AuthWelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/images/helmet-silver.png"
          alt=""
          className="absolute top-10 right-10 opacity-25 animate-pulse"
          style={{
            width: '140px',
            height: '140px',
            objectFit: 'contain'
          }}
        />
        <img
          src="/images/wrench.png"
          alt=""
          className="absolute bottom-20 left-10 opacity-20 animate-pulse"
          style={{
            width: '100px',
            height: '100px',
            objectFit: 'contain',
            animationDelay: '1s'
          }}
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Logo size="lg" showText={true} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Добро пожаловать!
          </h1>
          <p className="text-gray-400">
            Войдите или создайте новый аккаунт
          </p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-4">
          {/* Login button */}
          <button
            onClick={() => {
              hapticLight()
              router.push('/auth/login')
            }}
            className="w-full py-4 bg-[#E85D2F] hover:bg-[#D04D1F] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95"
          >
            <LogIn className="w-6 h-6" />
            Войти
          </button>

          {/* Register button */}
          <button
            onClick={() => {
              hapticLight()
              router.push('/auth/register')
            }}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-200 active:scale-95"
          >
            <UserPlus className="w-6 h-6" />
            Зарегистрироваться
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Продолжая, вы соглашаетесь с{' '}
          <a href="/legal/terms" className="text-orange-400 hover:text-orange-300">
            условиями использования
          </a>
        </p>
      </div>
    </div>
  )
}
