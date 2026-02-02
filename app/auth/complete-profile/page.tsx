'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useTelegram } from '@/lib/telegram'
import { User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'

export default function CompleteProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const tg = useTelegram()

  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [hasManuallyEdited, setHasManuallyEdited] = useState(false)

  useEffect(() => {
    // Pre-fill with Telegram data if available (only once, and only if user hasn't edited)
    if (tg?.user && !hasManuallyEdited && !fullName) {
      const telegramFullName = [tg.user.first_name, tg.user.last_name].filter(Boolean).join(' ')
      if (telegramFullName) {
        setFullName(telegramFullName)
      }
    }
  }, [tg, hasManuallyEdited, fullName])

  const validateFullName = (name: string): boolean => {
    // Check if contains Cyrillic characters (ФИО должно быть на русском)
    const cyrillicRegex = /[а-яА-ЯёЁ]/
    if (!cyrillicRegex.test(name)) {
      setError('ФИО должно быть на русском языке (кириллицей)')
      return false
    }

    // Check if has at least 2 words (Имя Фамилия minimum)
    const words = name.trim().split(/\s+/)
    if (words.length < 2) {
      setError('Укажите минимум Имя и Фамилию')
      return false
    }

    return true
  }

  const validatePhone = (phoneNum: string): boolean => {
    // Basic Russian phone validation
    const phoneRegex = /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/
    if (!phoneRegex.test(phoneNum)) {
      setError('Неверный формат телефона. Пример: +7 999 123 45 67')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!fullName.trim() || !phone.trim()) {
      setError('Заполните все поля')
      return
    }

    if (!validateFullName(fullName)) {
      return
    }

    if (!validatePhone(phone)) {
      return
    }

    try {
      setLoading(true)

      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        toast.error('Ошибка авторизации')
        router.push('/auth/login')
        return
      }

      console.log('[CompleteProfile] Auth user:', authUser.id)

      // Check if user record exists in public.users
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      console.log('[CompleteProfile] Existing user:', existingUser, 'Error:', fetchError)

      if (!existingUser) {
        console.log('[CompleteProfile] No user record found, creating one...')

        // Extract telegram_id from email (format: 232922222@telegram.user)
        const telegramId = authUser.email?.includes('@telegram.user')
          ? authUser.email.split('@')[0]
          : null

        // Create user record
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: fullName.trim(),
            phone: phone.trim(),
            telegram_id: telegramId,
            user_type: 'worker',
            role: 'worker',
            roles: ['worker'],
            current_role: 'worker',
            profile_completed: true,
            rating: 0,
            total_shifts: 0,
            successful_shifts: 0,
            is_verified: false,
            gosuslugi_verified: false,
          })

        if (createError) {
          console.error('[CompleteProfile] Error creating user:', createError)
          throw new Error(`Не удалось создать профиль: ${createError.message}`)
        }

        // Create worker_profile
        const { error: profileError } = await supabase
          .from('worker_profiles')
          .insert({ user_id: authUser.id })

        if (profileError) {
          console.error('[CompleteProfile] Error creating worker profile:', profileError)
          // Don't throw - profile can be created later
        }

        console.log('[CompleteProfile] User record created successfully')
      } else {
        console.log('[CompleteProfile] User record exists, updating...')

        // Update existing user profile
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: fullName.trim(),
            phone: phone.trim(),
            profile_completed: true,
          })
          .eq('id', authUser.id)

        if (updateError) {
          console.error('[CompleteProfile] Error updating user:', updateError)
          throw updateError
        }
      }

      // Get updated user data with role
      const { data: userData } = await supabase
        .from('users')
        .select('current_role, roles')
        .eq('id', authUser.id)
        .single()

      console.log('[CompleteProfile] User data after save:', userData)

      toast.success('Профиль успешно заполнен!')

      // Redirect based on role
      const role = userData?.current_role || userData?.roles?.[0] || 'worker'
      console.log('[CompleteProfile] Redirecting to role:', role)

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

    } catch (err: any) {
      console.error('[CompleteProfile] Error:', err)
      setError(err.message || 'Ошибка сохранения профиля')
      toast.error('Ошибка сохранения профиля')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] p-4 overflow-y-auto" style={{ paddingBottom: '400px', minHeight: '100vh' }}>
      <div className="max-w-md w-full mx-auto" style={{ marginTop: '2rem' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Logo size="lg" showText={true} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Завершите регистрацию
          </h1>
          <p className="text-gray-400">
            Для работы на платформе необходимо заполнить профиль
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Info Banner */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-blue-400 text-sm">
                <p className="font-semibold mb-1">Требования к профилю:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>ФИО на русском языке (кириллица)</li>
                  <li>Действующий номер телефона</li>
                </ul>
              </div>
            </div>

            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                ФИО <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    setHasManuallyEdited(true)
                  }}
                  onFocus={(e) => {
                    // Scroll input into view when keyboard appears
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 300)
                  }}
                  placeholder="Иванов Иван Иванович"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Укажите полное ФИО кириллицей (как в паспорте)
              </p>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Телефон <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={(e) => {
                    // Scroll input into view when keyboard appears
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 300)
                  }}
                  placeholder="+7 999 123 45 67"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Используется для связи по смене
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition shadow-lg shadow-orange-500/30"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Сохранение...
                </div>
              ) : (
                'Завершить регистрацию'
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          После заполнения профиля вы получите доступ ко всем функциям платформы
        </p>
      </div>
    </div>
  )
}
