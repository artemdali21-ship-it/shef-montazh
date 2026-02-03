'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Logo } from '@/components/ui/Logo'
import { LogIn, UserPlus } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check if user has active Supabase session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        console.log('[HomePage] Active session found, checking API...')
        
        // Verify with API
        const apiResponse = await fetch('/api/auth/me')
        
        if (apiResponse.ok) {
          const data = await apiResponse.json()
          console.log('[HomePage] API confirmed, redirecting to dashboard...')
          
          // Redirect to dashboard
          const dashboardPaths: Record<string, string> = {
            worker: '/worker/shifts',
            client: '/client/shifts',
            shef: '/shef/dashboard',
          }
          
          const role = data.user?.current_role || data.user?.roles?.[0]
          router.push(dashboardPaths[role] || '/worker/shifts')
          return
        }
      }

      console.log('[HomePage] No active session, showing welcome screen')
      setHasSession(false)
      setLoading(false)
    } catch (error) {
      console.error('[HomePage] Error checking auth:', error)
      setHasSession(false)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="mb-6 opacity-90">
            <Logo size="lg" showText={true} />
          </div>
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="lg" showText={true} />
        </div>

        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Добро пожаловать!
          </h1>
          <p className="text-gray-400 text-base">
            Выберите, что вы хотите сделать
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Login Button */}
          <button
            onClick={() => router.push('/auth/welcome')}
            className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 group shadow-lg"
          >
            <LogIn className="w-5 h-5 group-hover:animate-pulse" />
            <span>Вход в аккаунт</span>
          </button>

          {/* Register Button */}
          <button
            onClick={() => router.push('/auth/register')}
            className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 group"
          >
            <UserPlus className="w-5 h-5 group-hover:animate-pulse" />
            <span>Создать аккаунт</span>
          </button>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center">
          Приложение работает только в Telegram Mini App
        </p>
      </div>
    </div>
  )
}
