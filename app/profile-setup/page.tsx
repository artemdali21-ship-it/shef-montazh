'use client'

import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
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

export default function ProfileSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [userType, setUserType] = useState<'worker' | 'client' | 'shef' | null>(null)
  const [formData, setFormData] = useState({
    // Worker fields
    name: '',
    phone: '',
    city: '',
    experience: '',
    specialization: '',
    bio: '',
    avatar: null as File | null,
    certifications: [] as string[],
    
    // Client fields
    companyName: '',
    companyType: '',
    contactName: '',
    
    // Shef fields
    teamSize: '',
    equipment: [] as string[],
    portfolio: [] as string[],
  })

  const handleUserTypeSelect = (type: 'worker' | 'client' | 'shef') => {
    setUserType(type)
    setStep(1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file,
      }))
    }
  }

  const handleNext = () => {
    if (step < getMaxSteps()) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step === 1) {
      setUserType(null)
      setStep(0)
    } else {
      setStep(step - 1)
    }
  }

  const getMaxSteps = () => {
    if (!userType) return 0
    if (userType === 'worker') return 4
    if (userType === 'client') return 3
    if (userType === 'shef') return 4
    return 0
  }

  const handleComplete = async () => {
    console.log('[v0] Profile setup complete:', { userType, formData })
    // Redirect to appropriate dashboard
    if (userType === 'worker') {
      router.push('/feed')
    } else if (userType === 'client') {
      router.push('/dashboard')
    } else if (userType === 'shef') {
      router.push('/shef-dashboard')
    }
  }

  const renderStep = () => {
    if (!userType) {
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-700 text-white mb-8">Кто вы?</h2>
          <div className="space-y-4">
            <button
              onClick={() => handleUserTypeSelect('worker')}
              className="w-full p-6 bg-white/10 hover:bg-white/15 border-2 border-white/30 hover:border-brand-orange rounded-2xl text-left transition-all active:scale-95"
            >
              <h3 className="text-lg font-700 text-white mb-2">Монтажник / Исполнитель</h3>
              <p className="text-sm text-text-secondary font-500">Заполните профиль и найдите заказы</p>
            </button>
            
            <button
              onClick={() => handleUserTypeSelect('client')}
              className="w-full p-6 bg-white/10 hover:bg-white/15 border-2 border-white/30 hover:border-brand-orange rounded-2xl text-left transition-all active:scale-95"
            >
              <h3 className="text-lg font-700 text-white mb-2">Заказчик</h3>
              <p className="text-sm text-text-secondary font-500">Регистр компании или агентства</p>
            </button>
            
            <button
              onClick={() => handleUserTypeSelect('shef')}
              className="w-full p-6 bg-white/10 hover:bg-white/15 border-2 border-white/30 hover:border-brand-orange rounded-2xl text-left transition-all active:scale-95"
            >
              <h3 className="text-lg font-700 text-white mb-2">Шеф-монтажник / Бригадир</h3>
              <p className="text-sm text-text-secondary font-500">Управляйте бригадой и проектами</p>
            </button>
          </div>
        </div>
      )
    }

    // Worker profile steps
    if (userType === 'worker') {
      if (step === 1) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Базовая информация</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-white mb-2">Полное имя *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Иван Иванов"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-brand-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-600 text-white mb-2">Город *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Москва"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>
          </div>
        )
      }
      
      if (step === 2) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Специализация</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-white mb-2">Специальность *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-brand-orange"
                >
                  <option value="">Выберите специальность</option>
                  <option value="elektrik">Электрик</option>
                  <option value="santehnik">Сантехник</option>
                  <option value="molyar">Маляр</option>
                  <option value="kroveltschik">Кровельщик</option>
                  <option value="montazhnik">Монтажник</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-600 text-white mb-2">Опыт работы (лет) *</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-brand-orange"
                >
                  <option value="">Выберите опыт</option>
                  <option value="0-1">0-1 год</option>
                  <option value="1-3">1-3 года</option>
                  <option value="3-5">3-5 лет</option>
                  <option value="5+">5+ лет</option>
                </select>
              </div>
            </div>
          </div>
        )
      }
      
      if (step === 3) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Фото профиля</h2>
            
            <div className="flex justify-center">
              <label className="relative cursor-pointer">
                <div className="w-32 h-32 bg-white/10 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center hover:border-brand-orange transition-all">
                  {formData.avatar ? (
                    <span className="text-white text-sm font-600">✓ Загружено</span>
                  ) : (
                    <span className="text-text-secondary text-sm font-500">+</span>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-600 text-white mb-2">О себе</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Расскажите о своем опыте и навыках..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-tertiary font-500 focus:outline-none focus:border-brand-orange resize-none"
              />
            </div>
          </div>
        )
      }
      
      if (step === 4) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Подтверждение</h2>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-text-secondary font-500">Имя</p>
                <p className="text-white font-600">{formData.name || '-'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-text-secondary font-500">Город</p>
                <p className="text-white font-600">{formData.city || '-'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-text-secondary font-500">Специальность</p>
                <p className="text-white font-600">{formData.specialization || '-'}</p>
              </div>
            </div>
          </div>
        )
      }
    }

    // Client profile steps
    if (userType === 'client') {
      if (step === 1) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Информация компании</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-white mb-2">Название компании *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="ООО «Ремонт»"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-brand-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-600 text-white mb-2">Тип компании *</label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-brand-orange"
                >
                  <option value="">Выберите тип</option>
                  <option value="agency">Агентство</option>
                  <option value="producer">Продюсер</option>
                  <option value="company">Компания</option>
                </select>
              </div>
            </div>
          </div>
        )
      }
      
      if (step === 2) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Контактное лицо</h2>
            
            <div>
              <label className="block text-sm font-600 text-white mb-2">ФИО контактного лица *</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="Петр Петров"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>
        )
      }
      
      if (step === 3) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Готово!</h2>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
              <p className="text-white text-center font-500">Ваш профиль заказчика создан. Вы можете начать искать монтажников!</p>
            </div>
          </div>
        )
      }
    }

    // Shef profile steps
    if (userType === 'shef') {
      if (step === 1) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Информация бригады</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-white mb-2">Имя шефа *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Сергей Сергеев"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-brand-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-600 text-white mb-2">Размер бригады (человек) *</label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  placeholder="5"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>
          </div>
        )
      }
      
      if (step === 2) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Специализация</h2>
            
            <div>
              <label className="block text-sm font-600 text-white mb-2">Специальность</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="Кровельные работы, фасад, монтаж"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-text-tertiary focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>
        )
      }
      
      if (step === 3) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">О вас</h2>
            
            <div>
              <label className="block text-sm font-600 text-white mb-2">Опыт работы (лет)</label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-brand-orange"
              >
                <option value="">Выберите опыт</option>
                <option value="0-5">0-5 лет</option>
                <option value="5-10">5-10 лет</option>
                <option value="10+">10+ лет</option>
              </select>
            </div>
          </div>
        )
      }
      
      if (step === 4) {
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-700 text-white mb-8">Готово!</h2>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
              <p className="text-white text-center font-500">Профиль бригады создан. Начните принимать заказы!</p>
            </div>
          </div>
        )
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <NoisePattern />
      
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        opacity: 0.15,
        pointerEvents: 'none',
      }}>
        <img src="/images/helmet.png" alt="" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="h-16 flex items-center justify-between px-4">
          <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          {userType && (
            <div className="text-xs font-600 text-text-secondary">
              Шаг {step} из {getMaxSteps()}
            </div>
          )}
          
          <div className="w-10"></div>
        </header>

        <main className="flex-1 flex flex-col justify-center px-4 py-8">
          <div className="max-w-md mx-auto w-full">
            {renderStep()}
          </div>
        </main>

        <footer style={{
          background: 'rgba(42, 42, 42, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: 'none',
        }} className="h-24 flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-3">
            <button
              onClick={handleNext}
              disabled={
                (step === 0 && !userType) ||
                (step === 1 && userType === 'worker' && !formData.name) ||
                (step === 1 && userType === 'client' && !formData.companyName)
              }
              className="w-full h-14 bg-brand-orange hover:bg-brand-orange-dark active:scale-95 disabled:opacity-50 rounded-xl font-700 text-white transition-all"
            >
              {step === getMaxSteps() ? 'Завершить' : 'Далее'}
            </button>
            {step > 0 && (
              <p className="text-xs text-center text-text-tertiary font-500">Можно пропустить и заполнить позже</p>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
