'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Briefcase, Building, HardHat, AlertCircle, CheckCircle, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

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

  // Form refs for auto-focus
  const fullNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('worker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password validation states
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

  // Auto-focus and scroll to field on mobile
  const scrollToField = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ref.current.focus()
    }
  }

  // Check password match in real-time
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordsMatch(password === confirmPassword)
    } else {
      setPasswordsMatch(null)
    }
  }, [password, confirmPassword])

  // Check password strength
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(null)
      return
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak'

    if (password.length >= 8) {
      strength = 'medium'
    }

    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      strength = 'strong'
    }

    setPasswordStrength(strength)
  }, [password])

  // Enter key handler to move to next field
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (nextRef && nextRef.current) {
        nextRef.current.focus()
        scrollToField(nextRef)
      } else {
        // Last field - submit form
        handleRegister(e as any)
      }
    }
  }

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

      if (signUpError) {
        // Handle specific errors
        if (signUpError.message.includes('already registered')) {
          throw new Error('Этот email уже зарегистрирован')
        }
        if (signUpError.message.includes('Password')) {
          throw new Error('Пароль слишком слабый. Используйте минимум 6 символов')
        }
        throw signUpError
      }

      if (authData.user) {
        // Create user record in users table
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: fullName,
          phone: phone,
          email: email,
          user_type: selectedRole,
          role: selectedRole,
          rating: 0,
          total_shifts: 0,
          successful_shifts: 0,
          is_verified: false,
          gosuslugi_verified: false,
        })

        if (userError) {
          console.error('User insert error:', userError)
          throw new Error('Не удалось создать профиль')
        }

        // Create role-specific profile
        if (selectedRole === 'worker') {
          await supabase.from('worker_profiles').insert({
            user_id: authData.user.id,
          })
        } else if (selectedRole === 'client') {
          await supabase.from('client_profiles').insert({
            user_id: authData.user.id,
          })
        }

        // Show success toast
        toast.success('Регистрация успешна! Добро пожаловать!')

        // Redirect immediately based on role
        switch (selectedRole) {
          case 'worker':
            router.push('/feed')
            break
          case 'client':
            router.push('/dashboard')
            break
          case 'shef':
            router.push('/shef/dashboard')
            break
          default:
            router.push('/')
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage = err.message || 'Ошибка регистрации. Попробуйте снова.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return '33%'
      case 'medium': return '66%'
      case 'strong': return '100%'
      default: return '0%'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4 py-12">
      <motion.div
        className="w-full max-w-md"
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
          <h1 className="text-4xl font-bold text-white mb-2">Шеф-Монтаж</h1>
          <p className="text-gray-400">Создайте новый аккаунт</p>
        </motion.div>

        {/* Register Form */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
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
                      onClick={() => {
                        setSelectedRole(role.value)
                        // Auto-focus to next field after role selection
                        setTimeout(() => scrollToField(fullNameRef), 100)
                      }}
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
                  ref={fullNameRef}
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, emailRef)}
                  onFocus={() => scrollToField(fullNameRef)}
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
                  ref={emailRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, phoneRef)}
                  onFocus={() => scrollToField(emailRef)}
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
                  ref={phoneRef}
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                  onFocus={() => scrollToField(phoneRef)}
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
                  ref={passwordRef}
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => scrollToField(passwordRef)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Надёжность пароля:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'weak' ? 'text-red-400' :
                      passwordStrength === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength === 'weak' && 'Слабый'}
                      {passwordStrength === 'medium' && 'Средний'}
                      {passwordStrength === 'strong' && 'Сильный'}
                    </span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: getPasswordStrengthWidth() }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => scrollToField(confirmPasswordRef)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition ${
                    passwordsMatch === null
                      ? 'border-white/10 focus:border-orange-500'
                      : passwordsMatch
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-red-500 focus:border-red-500'
                  }`}
                  disabled={loading}
                />
                {/* Password Match Icon */}
                {passwordsMatch !== null && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Password Mismatch Error */}
              {passwordsMatch === false && confirmPassword.length > 0 && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Пароли не совпадают
                </p>
              )}

              {/* Password Match Success */}
              {passwordsMatch === true && (
                <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Пароли совпадают
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || passwordsMatch === false}
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
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-gray-500 text-xs mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          Регистрируясь, вы соглашаетесь с условиями использования
        </motion.p>
      </motion.div>
    </div>
  )
}
