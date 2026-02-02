'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, AlertCircle, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useTelegram } from '@/lib/telegram'
import toast from 'react-hot-toast'
import { Logo } from '@/components/ui/Logo'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const tg = useTelegram()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is from Telegram
  const isFromTelegram = Boolean(tg?.user?.id)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    try {
      setLoading(true)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Handle specific errors
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Неверный email или пароль')
        }
        if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Пожалуйста, подтвердите ваш email')
        }
        throw signInError
      }

      if (data.user) {
        // Fetch user role from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (userError) {
          throw new Error('Не удалось загрузить профиль')
        }

        // Show success toast
        toast.success('Вход выполнен успешно!')

        // Redirect based on role
        switch (userData.role) {
          case 'worker':
            router.push('/worker/shifts')
            break
          case 'client':
            router.push('/client/shifts')
            break
          case 'shef':
            router.push('/shef/dashboard')
            break
          default:
            router.push('/')
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMessage = err.message || 'Ошибка входа. Проверьте email и пароль.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dashboard flex items-start justify-center p-4 py-8 overflow-y-auto">
      <motion.div
        className="w-full max-w-md my-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Logo/Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Logo size="lg" showText={true} />
          </div>
          <p className="text-gray-400">Войдите в свой аккаунт</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Telegram User Message */}
          {isFromTelegram ? (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-blue-400 font-semibold text-lg mb-2">
                      Вход через Telegram
                    </h3>
                    <p className="text-blue-300 text-sm mb-3">
                      Вы используете Telegram! Вход происходит автоматически.
                    </p>
                    <p className="text-blue-300 text-sm">
                      Если у вас уже есть аккаунт - вы будете авторизованы автоматически.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/auth/register')}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-bold transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                Зарегистрироваться
              </button>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Нет аккаунта? Зарегистрируйтесь, это займёт меньше минуты!
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-orange-400 hover:text-orange-300 transition"
              >
                Забыли пароль?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Вход...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Войти
                </>
              )}
            </button>
          </form>

          {/* Register Link - Only for non-Telegram users */}
          {!isFromTelegram && (
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                Нет аккаунта?{' '}
                <Link href="/auth/register" className="text-orange-400 hover:text-orange-300 font-semibold transition">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-gray-500 text-xs mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          Входя в систему, вы соглашаетесь с условиями использования
        </motion.p>
      </motion.div>
    </div>
  )
}
