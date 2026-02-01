'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, MapPin, DollarSign, Users, Clock,
  Briefcase, AlertCircle
} from 'lucide-react'

/**
 * Create Shift Page (MVP Version)
 *
 * Упрощенная версия wizard для быстрого запуска.
 * TODO: Заменить на full wizard с 6 шагами позже.
 */
export default function CreateShiftPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    category: 'Монтажник',
    description: '',
    date: '',
    start_time: '10:00',
    end_time: '18:00',
    location_address: '',
    location_city: 'Москва',
    pay_amount: '',
    required_workers: '1',
    requirements: '',
    contact_name: '',
    contact_phone: '',
  })

  const categories = [
    'Монтажник',
    'Грузчик',
    'Декоратор',
    'Техник по свету',
    'Техник по звуку',
    'Строитель',
    'Электрик',
    'Универсал'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Введите название смены')
      return
    }
    if (!formData.date) {
      setError('Выберите дату')
      return
    }
    if (!formData.location_address.trim()) {
      setError('Введите адрес')
      return
    }
    if (!formData.pay_amount || parseInt(formData.pay_amount) < 1000) {
      setError('Укажите оплату (минимум 1000 ₽)')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/shifts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description || null,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location_address: formData.location_address,
          location_city: formData.location_city,
          pay_amount: parseInt(formData.pay_amount),
          required_workers: parseInt(formData.required_workers),
          requirements: formData.requirements || null,
          contact_name: formData.contact_name || null,
          contact_phone: formData.contact_phone || null,
          status: 'open'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create shift')
      }

      const result = await response.json()

      // Redirect to shift page
      router.push(`/shift/${result.shiftId}`)

    } catch (err: any) {
      console.error('Error creating shift:', err)
      setError(err.message || 'Ошибка при создании смены')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <main className="min-h-screen bg-dashboard pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
          <h1 className="text-h1 text-white mb-1">Создать смену</h1>
          <p className="text-body-small text-gray-400">Заполните информацию о работе</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Основная информация */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-400" />
            Основная информация
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название смены *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Монтаж выставочного стенда"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Категория *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#2A2A2A]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Подробное описание работы..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition resize-none"
            />
          </div>
        </div>

        {/* Дата и время */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Дата и время
          </h2>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Дата смены *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition"
              required
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Начало
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Конец
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition"
                required
              />
            </div>
          </div>
        </div>

        {/* Локация */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" />
            Локация
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Адрес *
            </label>
            <input
              type="text"
              value={formData.location_address}
              onChange={(e) => handleChange('location_address', e.target.value)}
              placeholder="ул. Примерная, д. 1"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition"
              required
            />
          </div>
        </div>

        {/* Оплата */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Оплата
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ставка (₽) *
              </label>
              <input
                type="number"
                value={formData.pay_amount}
                onChange={(e) => handleChange('pay_amount', e.target.value)}
                placeholder="3000"
                min="1000"
                step="100"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Человек *
              </label>
              <input
                type="number"
                value={formData.required_workers}
                onChange={(e) => handleChange('required_workers', e.target.value)}
                min="1"
                max="50"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition"
                required
              />
            </div>
          </div>
        </div>

        {/* Требования */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Требования
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Особые требования
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              placeholder="Опыт работы, наличие инструмента, и т.д."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition resize-none"
            />
          </div>
        </div>

        {/* Контакты (опционально) */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Контакты на объекте
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Контактное лицо
            </label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={(e) => handleChange('contact_name', e.target.value)}
              placeholder="Иван Иванов"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl text-white font-bold text-lg transition-all duration-200 active:scale-95 hover:shadow-lg shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Создание...
            </>
          ) : (
            'Создать смену'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          После создания смена будет видна всем воркерам
        </p>
      </form>
    </main>
  )
}
