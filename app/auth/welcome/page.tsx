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
        {/* 3D Helmet - top right */}
        <img
          src="/images/helmet.png"
          alt=""
          className="absolute opacity-20 animate-pulse"
          style={{
            top: '8%',
            right: '5%',
            width: 'auto',
            height: '160px',
            objectFit: 'contain'
          }}
        />

        {/* Wrench - bottom left */}
        <img
          src="/images/wrench.png"
          alt=""
          className="absolute opacity-15 animate-pulse"
          style={{
            bottom: '15%',
            left: '5%',
            width: 'auto',
            height: '100px',
            objectFit: 'contain',
            animationDelay: '1s'
          }}
        />

        {/* Concrete - bottom right */}
        <img
          src="/images/concrete-3.png"
          alt=""
          className="absolute opacity-25"
          style={{
            bottom: '5%',
            right: '8%',
            width: 'auto',
            height: '120px',
            objectFit: 'contain',
            transform: 'rotate(-15deg)'
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
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            Войти в аккаунт
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
