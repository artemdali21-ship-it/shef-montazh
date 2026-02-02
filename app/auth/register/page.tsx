'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Briefcase, Building, HardHat, AlertCircle, CheckCircle, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import { Logo } from '@/components/ui/Logo'
import { useTelegram } from '@/lib/telegram'

type Role = 'worker' | 'client' | 'shef'

const roles = [
  {
    value: 'worker' as Role,
    label: 'Специалист',
    description: 'Работаю руками, выхожу на смены',
    icon: HardHat,
  },
  {
    value: 'shef' as Role,
    label: 'Шеф-монтаж',
    description: 'Управляю командой и отвечаю за монтаж',
    icon: Briefcase,
  },
  {
    value: 'client' as Role,
    label: 'Компания',
    description: 'Нанимаю специалистов и организую проекты',
    icon: Building,
  },
]

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tg = useTelegram()
  const supabase = createClient()

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

  // Check if user is from Telegram
  const isFromTelegram = Boolean(tg?.user?.id)

  // Pre-fill form from Telegram data
  useEffect(() => {
    if (tg?.user) {
      const firstName = tg.user.first_name || ''
      const lastName = tg.user.last_name || ''
      setFullName(`${firstName} ${lastName}`.trim())

      // Auto-generate email from telegram_id
      if (tg.user.id) {
        const autoEmail = `${tg.user.id}@telegram.user`
        setEmail(autoEmail)

        // Auto-generate password
        const autoPassword = `tg_${tg.user.id}_${process.env.NEXT_PUBLIC_TELEGRAM_AUTH_SECRET || 'secret'}`
        setPassword(autoPassword)
        setConfirmPassword(autoPassword)
      }
    }
  }, [tg])

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

  // Read role from URL query params on mount
  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam && (roleParam === 'worker' || roleParam === 'client' || roleParam === 'shef')) {
      setSelectedRole(roleParam as Role)
    }
  }, [searchParams])

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

    // Validation for Telegram users (only name and phone required)
    if (isFromTelegram) {
      if (!fullName || !phone) {
        setError('Пожалуйста, заполните имя и телефон')
        return
      }
    } else {
      // Validation for non-Telegram users (all fields required)
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
    }

    try {
      setLoading(true)

      // Get Telegram data
      const telegramId = tg?.user?.id
      const telegramUsername = tg?.user?.username

      // Normalize phone number (convert 89266035059 to +79266035059)
      let normalizedPhone = phone.trim()
      if (normalizedPhone.startsWith('8') && normalizedPhone.length === 11) {
        normalizedPhone = '+7' + normalizedPhone.slice(1)
      } else if (normalizedPhone.startsWith('9') && normalizedPhone.length === 10) {
        normalizedPhone = '+7' + normalizedPhone
      } else if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = '+' + normalizedPhone
      }

      console.log('[DEBUG] Phone normalized:', phone, '->', normalizedPhone)

      // Use consistent password generation pattern (same as auto-login)
      const finalEmail = telegramId ? `${telegramId}@telegram.user` : email
      const finalPassword = telegramId
        ? `tg_${telegramId}_${process.env.NEXT_PUBLIC_TELEGRAM_AUTH_SECRET || 'secret'}`
        : password

      // For Telegram users: Check if user with this phone already exists
      if (telegramId) {
        // Try multiple phone formats to find existing user
        const phoneVariants = [
          normalizedPhone,
          phone,
          phone.startsWith('+') ? phone.slice(1) : '+' + phone,
        ]

        let existingUser = null
        for (const phoneVariant of phoneVariants) {
          const { data } = await supabase
            .from('users')
            .select('id, telegram_id, email, profile_completed')
            .eq('phone', phoneVariant)
            .maybeSingle()

          if (data) {
            existingUser = data
            console.log('[DEBUG] Found existing user with phone variant:', phoneVariant)
            break
          }
        }

        if (existingUser) {
          console.log('[DEBUG] Found existing user with this phone:', existingUser)

          // Update telegram_id if not set
          if (!existingUser.telegram_id) {
            console.log('[DEBUG] Updating telegram_id for existing user...')
            await supabase
              .from('users')
              .update({
                telegram_id: telegramId.toString(),
                roles: [selectedRole],
                current_role: selectedRole,
              })
              .eq('id', existingUser.id)

            // Create role-specific profile if doesn't exist
            if (selectedRole === 'worker') {
              // Check if worker_profile exists
              const { data: workerProfile } = await supabase
                .from('worker_profiles')
                .select('user_id')
                .eq('user_id', existingUser.id)
                .maybeSingle()

              if (!workerProfile) {
                await supabase.from('worker_profiles').insert({
                  user_id: existingUser.id,
                })
              }
            } else if (selectedRole === 'client') {
              // Check if client_profile exists
              const { data: clientProfile } = await supabase
                .from('client_profiles')
                .select('user_id')
                .eq('user_id', existingUser.id)
                .maybeSingle()

              if (!clientProfile) {
                await supabase.from('client_profiles').insert({
                  user_id: existingUser.id,
                })
              }
            }
          }

          // Try to sign in with Telegram credentials
          let signInResult = await supabase.auth.signInWithPassword({
            email: finalEmail,
            password: finalPassword,
          })

          if (signInResult.error) {
            console.log('[DEBUG] Sign in failed, creating auth user...', signInResult.error.message)

            // Auth user doesn't exist - create it
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: finalEmail,
              password: finalPassword,
              options: {
                data: {
                  telegram_id: telegramId,
                  telegram_username: telegramUsername,
                },
              },
            })

            if (signUpError) {
              console.error('[DEBUG] Failed to create auth user:', signUpError)
              throw new Error(`Не удалось создать учётную запись: ${signUpError.message}`)
            }

            console.log('[DEBUG] Auth user created, signing in...')

            // Now sign in
            signInResult = await supabase.auth.signInWithPassword({
              email: finalEmail,
              password: finalPassword,
            })

            if (signInResult.error) {
              throw new Error(`Не удалось войти: ${signInResult.error.message}`)
            }
          }

          console.log('[DEBUG] Successfully signed in existing user')
          toast.success('Вход выполнен! Добро пожаловать обратно')

          // Redirect based on profile completion
          if (!existingUser.profile_completed) {
            router.push('/auth/complete-profile')
          } else {
            // Get user's current role and redirect
            const { data: userData } = await supabase
              .from('users')
              .select('current_role, roles')
              .eq('id', existingUser.id)
              .single()

            const role = userData?.current_role || userData?.roles?.[0] || 'worker'

            switch (role) {
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
                router.push('/worker/shifts')
            }
          }
          return
        }
      }

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: finalEmail,
        password: finalPassword,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: selectedRole,
            telegram_id: telegramId,
            telegram_username: telegramUsername,
          },
        },
      })

      if (signUpError) {
        // Handle specific errors
        if (signUpError.message.includes('already registered')) {
          throw new Error('Вы уже зарегистрированы')
        }
        if (signUpError.message.includes('Password')) {
          throw new Error('Пароль слишком слабый. Используйте минимум 6 символов')
        }
        throw signUpError
      }

      if (authData.user) {
        // Create user record in users table
        console.log('[DEBUG] Creating user record with ID:', authData.user.id)
        console.log('[DEBUG] User data:', { fullName, phone, email, selectedRole })

        const { data: userData, error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: fullName,
          phone: normalizedPhone,
          email: finalEmail,
          user_type: selectedRole,
          role: selectedRole,
          roles: [selectedRole], // Multi-role support
          current_role: selectedRole, // Set initial role
          profile_completed: false, // Profile needs to be completed
          rating: 0,
          total_shifts: 0,
          successful_shifts: 0,
          is_verified: false,
          gosuslugi_verified: false,
          telegram_id: telegramId?.toString() || null,
        }).select()

        console.log('[DEBUG] User insert result:', { userData, userError })

        if (userError) {
          console.error('[ERROR] User insert failed:', {
            message: userError.message,
            details: userError.details,
            hint: userError.hint,
            code: userError.code,
            full: JSON.stringify(userError)
          })
          throw new Error(`Не удалось создать профиль: ${userError.message || 'Unknown error'}`)
        }

        // Verify user record was actually created
        const { data: verifyUser, error: verifyError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle()

        if (verifyError || !verifyUser) {
          console.error('[ERROR] User record verification failed:', verifyError)
          throw new Error('Профиль не был создан. Попробуйте снова или обратитесь в поддержку.')
        }

        console.log('[DEBUG] User record verified:', verifyUser)

        // Create role-specific profile
        if (selectedRole === 'worker') {
          const { error: workerProfileError } = await supabase.from('worker_profiles').insert({
            user_id: authData.user.id,
          })
          if (workerProfileError) {
            console.error('[ERROR] Failed to create worker profile:', workerProfileError)
            // Don't throw - profile can be created later
          }
        } else if (selectedRole === 'client') {
          const { error: clientProfileError } = await supabase.from('client_profiles').insert({
            user_id: authData.user.id,
          })
          if (clientProfileError) {
            console.error('[ERROR] Failed to create client profile:', clientProfileError)
            // Don't throw - profile can be created later
          }
        }

        // Show success toast
        toast.success('Регистрация успешна! Теперь заполните профиль')

        // Save role to localStorage
        localStorage.setItem('userRole', selectedRole)

        // Redirect to profile completion page
        router.push('/auth/complete-profile')
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
          <p className="text-gray-200">Создайте новый аккаунт</p>
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
              <label className="block text-sm font-medium text-white mb-3">
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
                          : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">{role.label}</p>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-300 mt-2">
                {roles.find((r) => r.value === selectedRole)?.description}
              </p>
            </div>

            {/* Telegram Info */}
            {isFromTelegram && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-blue-400 font-semibold mb-1">Регистрация через Telegram</h3>
                    <p className="text-blue-300 text-sm">
                      Вы регистрируетесь через Telegram ID. Email и пароль не требуются!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Name / Company Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                {selectedRole === 'client' ? 'Название компании' : 'Полное имя'}
              </label>
              <div className="relative">
                {selectedRole === 'client' ? (
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  ref={fullNameRef}
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, emailRef)}
                  onFocus={() => scrollToField(fullNameRef)}
                  placeholder={selectedRole === 'client' ? 'ООО "Строймонтаж"' : 'Иван Петров'}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email - Hidden for Telegram users */}
            {!isFromTelegram && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
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
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
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
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password - Hidden for Telegram users */}
            {!isFromTelegram && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
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
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
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
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
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
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition ${
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
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!isFromTelegram && passwordsMatch === false)}
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
            <p className="text-gray-200 text-sm">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-semibold transition">
                Войти
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-gray-300 text-xs mt-8"
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dashboard flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
