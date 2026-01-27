'use client'

import { useState } from 'react'
import { ArrowLeft, Phone, Mail, User, Eye, EyeOff, Shield } from 'lucide-react'
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

export default function RegistrationScreen() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<'worker' | 'client' | 'shef' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<any>({})

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
    router.push('/verify-phone')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <NoisePattern />
      {/* 3D decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        opacity: 0.15,
        pointerEvents: 'none',
      }}>
        <img src="/images/carabiner.png" alt="" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
      </div>
      <div style={{
        position: 'absolute',
        bottom: '-5%',
        left: '-8%',
        opacity: 0.15,
        pointerEvents: 'none',
      }}>
        <img src="/images/chain.png" alt="" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
      </div>
      <div className="relative z-10">
        <header className="h-16 flex items-center justify-between px-4">
          <button
            onClick={() => (step === 1 ? router.back() : setStep(1))}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-[#E85D2F]' : 'bg-white/20'}`}></div>
            <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-[#E85D2F]' : 'bg-white/20'}`}></div>
          </div>
          <div className="w-10"></div>
        </header>

        <div className="px-4 py-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Кто вы?</h1>
                <p className="text-[#9B9B9B] font-medium">Выберите роль, чтобы мы настроили интерфейс под вас</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    type: 'worker',
                    icon: User,
                    title: 'Я монтажник',
                    description: 'Ищу смены и зарабатываю',
                    color: '#BFFF00',
                  },
                  {
                    type: 'client',
                    icon: Shield,
                    title: 'Я заказчик',
                    description: 'Ищу проверенных исполнителей',
                    color: '#E85D2F',
                  },
                  {
                    type: 'shef',
                    icon: Shield,
                    title: 'Я шеф-монтажник',
                    description: 'Координирую бригады',
                    color: '#FFD60A',
                  },
                ].map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.type}
                      onClick={() => {
                        setUserType(option.type as any)
                        setStep(2)
                      }}
                      className={`w-full p-5 rounded-xl border-2 transition-all ${
                        userType === option.type ? 'bg-white/10 border-[#E85D2F]' : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${option.color}20` }}>
                          <Icon className="w-7 h-7" style={{ color: option.color }} />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-bold text-white mb-1">{option.title}</h3>
                          <p className="text-sm text-[#9B9B9B] font-medium">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 pb-32">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Создайте аккаунт</h1>
                <p className="text-[#9B9B9B] font-medium">Заполните данные для регистрации</p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Номер телефона *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" />
                    <input
                      type="tel"
                      placeholder="+7 (900) 123-45-67"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full h-14 bg-white/5 border rounded-xl pl-12 pr-4 text-white placeholder:text-[#6B6B6B] font-medium focus:outline-none ${
                        errors.phone ? 'border-red-500' : 'border-white/10 focus:border-[#E85D2F]/50'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full h-14 bg-white/5 border rounded-xl pl-12 pr-4 text-white placeholder:text-[#6B6B6B] font-medium focus:outline-none ${
                        errors.email ? 'border-red-500' : 'border-white/10 focus:border-[#E85D2F]/50'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Полное имя *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9B9B]" />
                    <input
                      type="text"
                      placeholder="Иван Иванов"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full h-14 bg-white/5 border rounded-xl pl-12 pr-4 text-white placeholder:text-[#6B6B6B] font-medium focus:outline-none ${
                        errors.fullName ? 'border-red-500' : 'border-white/10 focus:border-[#E85D2F]/50'
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Пароль *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Минимум 6 символов"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full h-14 bg-white/5 border rounded-xl px-4 pr-12 text-white placeholder:text-[#6B6B6B] font-medium focus:outline-none ${
                        errors.password ? 'border-red-500' : 'border-white/10 focus:border-[#E85D2F]/50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-[#9B9B9B]" /> : <Eye className="w-5 h-5 text-[#9B9B9B]" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Повторите пароль *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Повторите пароль"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full h-14 bg-white/5 border rounded-xl px-4 text-white placeholder:text-[#6B6B6B] font-medium focus:outline-none ${
                        errors.confirmPassword ? 'border-red-500' : 'border-white/10 focus:border-[#E85D2F]/50'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>}
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-[#9B9B9B] font-medium leading-relaxed">
                    Нажимая "Зарегистрироваться", вы соглашаетесь с{' '}
                    <button className="text-[#E85D2F] underline">Условиями использования</button> и{' '}
                    <button className="text-[#E85D2F] underline">Политикой конфиденциальности</button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>

        {step === 2 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#2A2A2A]/90 backdrop-blur-md border-t border-white/10">
            <button
              onClick={handleSubmit}
              className="w-full h-14 bg-[#E85D2F] hover:bg-[#D94D1F] active:scale-95 rounded-xl font-bold text-white transition-all"
            >
              Зарегистрироваться
            </button>

            <div className="text-center mt-3">
              <span className="text-sm text-[#9B9B9B] font-medium">Уже есть аккаунт? </span>
              <button onClick={() => router.push('/login')} className="text-sm text-[#E85D2F] font-bold underline">
                Войти
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
