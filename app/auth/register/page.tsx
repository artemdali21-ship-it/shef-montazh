'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Briefcase, Building, HardHat, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Role = 'worker' | 'client' | 'shef'

const roles = [
  {
    value: 'worker' as Role,
    label: 'Работник',
    description: 'Ищу работу на смены',
    icon: HardHat,
  },
  {
    value: 'client' as Role,
    label: 'Заказчик',
    description: 'Нужны работники',
    icon: Building,
  },
  {
    value: 'shef' as Role,
    label: 'Шеф',
    description: 'Управляю бригадами',
    icon: Briefcase,
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('worker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    try {
      setLoading(true)

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: selectedRole,
          },
        },
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        // Create user record in users table
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: fullName,
          phone: phone,
          email: email,
          role: selectedRole,
          rating: 0,
          total_shifts: 0,
          successful_shifts: 0,
          is_verified: false,
          gosuslugi_verified: false,
        })

        if (userError) throw userError

        // Create role-specific profile
        if (selectedRole === 'worker') {
          await supabase.from('worker_profiles').insert({
            user_id: authData.user.id,
            status: 'active',
            experience_years: 0,
          })
        } else if (selectedRole === 'client') {
          await supabase.from('client_profiles').insert({
            user_id: authData.user.id,
            shifts_published: 0,
          })
        }

        setSuccess(true)

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Ошибка регистрации. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-green-500/10 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Регистрация успешна!</h2>
            <p className="text-gray-300 mb-4">
              Проверьте вашу почту для подтверждения email.
            </p>
            <p className="text-sm text-gray-400">
              Перенаправление на страницу входа...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Шеф-Монтаж</h1>
          <p className="text-gray-400">Создайте новый аккаунт</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Выберите роль
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-3 rounded-xl border transition ${
                        selectedRole === role.value
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">{role.label}</p>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {roles.find((r) => r.value === selectedRole)?.description}
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Полное имя
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Телефон
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>
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
                  Регистрация...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Зарегистрироваться
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-semibold transition">
                Войти
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          Регистрируясь, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  )
}
