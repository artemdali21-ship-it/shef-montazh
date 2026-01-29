'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Phone, Mail, User, Eye, EyeOff, Shield } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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

export default function RegistrationScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromQuery = searchParams?.get('role') as 'worker' | 'client' | 'shef' | null
  
  const [step, setStep] = useState(roleFromQuery ? 2 : 1)
  const [userType, setUserType] = useState<'worker' | 'client' | 'shef' | null>(roleFromQuery || null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<any>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (roleFromQuery) {
      setUserType(roleFromQuery)
      localStorage.setItem('userRole', roleFromQuery)
      setStep(2)
    }
  }, [roleFromQuery])

  const scrollToField = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current && scrollContainerRef.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/
    return phoneRegex.test(phone)
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.phone) {
      newErrors.phone = 'Введите номер телефона'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона'
    }

    if (!formData.email) {
      newErrors.email = 'Введите email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }

    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = 'Введите полное имя'
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Минимум 6 символов'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    // Save role and redirect to phone verification with role parameter
    localStorage.setItem('userRole', userType || 'worker')
    router.push(`/verify-phone?role=${userType || 'worker'}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <NoisePattern />
      
      <header style={{
        position: 'relative',
        flexShrink: 0,
        height: '4rem',
        zIndex: 20,
      }} className="flex items-center justify-between px-4">
        <button
          onClick={() => (step === 1 ? router.back() : setStep(1))}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-[#E85D2F]' : 'bg-white/20'}`}></div>
          <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-[#E85D2F]' : 'bg-white/20'}`}></div>
        </div>
        <div className="w-10"></div>
      </header>

      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 10,
          WebkitOverflowScrolling: 'touch',
        }}
        className="px-4 py-6"
      >
        <div className="max-w-md mx-auto pb-32">
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Регистрация</h1>
                <p className="text-[#9B9B9B] font-medium">Введите ваши контактные данные</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none text-white placeholder:text-white/40 font-500"
                    placeholder="Номер телефона"
                  />
                  <Phone className="absolute top-1/2 left-4 transform -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none text-white placeholder:text-white/40 font-500"
                    placeholder="Email"
                  />
                  <Mail className="absolute top-1/2 left-4 transform -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none text-white placeholder:text-white/40 font-500"
                    placeholder="Полное имя"
                  />
                  <User className="absolute top-1/2 left-4 transform -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => scrollToField(passwordInputRef)}
                    className="w-full pl-4 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none text-white placeholder:text-white/40 font-500"
                    placeholder="Пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <Eye className="w-5 h-5" strokeWidth={1.5} /> : <EyeOff className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    ref={confirmPasswordInputRef}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onFocus={() => scrollToField(confirmPasswordInputRef)}
                    className="w-full pl-4 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none text-white placeholder:text-white/40 font-500"
                    placeholder="Подтвердите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5" strokeWidth={1.5} /> : <EyeOff className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSubmit}
                  className="w-full p-4 rounded-xl bg-[#E85D2F] text-white font-bold hover:bg-[#E85D2F]/80"
                >
                  Продолжить
                </button>

                {/* Legal documents acceptance */}
                <label className="flex items-start gap-3 mt-4 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    required
                    className="mt-1 w-4 h-4 accent-[#E85D2F]"
                  />
                  <span className="text-gray-300 leading-relaxed">
                    Я согласен с{' '}
                    <Link 
                      href="/legal/terms"
                      className="text-[#E85D2F] underline hover:no-underline"
                    >
                      условиями использования
                    </Link>
                    {', '}
                    <Link 
                      href="/legal/privacy"
                      className="text-[#E85D2F] underline hover:no-underline"
                    >
                      политикой конфиденциальности
                    </Link>
                    {' '}и{' '}
                    <Link 
                      href="/legal/offer"
                      className="text-[#E85D2F] underline hover:no-underline"
                    >
                      договором оферты
                    </Link>
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
