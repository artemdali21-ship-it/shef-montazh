'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, MapPin, Calendar, Clock, DollarSign, Users,
  Briefcase, AlertCircle, CheckCircle, FileText, Wrench
} from 'lucide-react'
import { createShift } from '@/lib/api/shifts'

const categories = [
  'Монтажник',
  'Декоратор',
  'Электрик',
  'Сварщик',
  'Альпинист',
  'Разнорабочий',
  'Грузчик',
  'Другое'
]

export default function CreateShiftPage() {
  const router = useRouter()

  // Mock client ID - in production, get from auth context
  const MOCK_CLIENT_ID = 'client-123'

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [locationAddress, setLocationAddress] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [requiredWorkers, setRequiredWorkers] = useState('1')
  const [toolsRequired, setToolsRequired] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = () => {
    // Required fields
    if (!title.trim()) {
      setError('Введите название смены')
      return false
    }

    if (!locationAddress.trim()) {
      setError('Введите адрес')
      return false
    }

    if (!date) {
      setError('Выберите дату')
      return false
    }

    if (!startTime || !endTime) {
      setError('Укажите время начала и окончания')
      return false
    }

    if (!payAmount || parseFloat(payAmount) <= 0) {
      setError('Укажите корректную оплату')
      return false
    }

    // Date validation - must be today or future
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError('Дата не может быть в прошлом')
      return false
    }

    // Time validation - end time must be after start time
    if (endTime <= startTime) {
      setError('Время окончания должно быть позже времени начала')
      return false
    }

    // Workers validation
    const workers = parseInt(requiredWorkers)
    if (workers < 1 || workers > 100) {
      setError('Количество работников должно быть от 1 до 100')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Parse tools required
      const toolsArray = toolsRequired
        .split(',')
        .map(tool => tool.trim())
        .filter(tool => tool.length > 0)

      const shiftData = {
        client_id: MOCK_CLIENT_ID,
        title: title.trim(),
        description: description.trim() || null,
        category,
        location_address: locationAddress.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        pay_amount: parseFloat(payAmount),
        required_workers: parseInt(requiredWorkers),
        required_rating: 0,
        tools_required: toolsArray.length > 0 ? toolsArray : null,
        status: 'open',
      }

      const { data, error: createError } = await createShift(shiftData)

      if (createError) throw createError

      if (data) {
        // Redirect to the new shift detail page
        router.push(`/shift/${data.id}`)
      }
    } catch (err: any) {
      console.error('Error creating shift:', err)
      setError(err.message || 'Ошибка создания смены. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-dashboard pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Создать смену</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <label htmlFor="title" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Название смены *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Монтаж стенда на выставке"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <label htmlFor="description" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Описание
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробное описание работы..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <label htmlFor="category" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-400" />
              Категория *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#2A2A2A]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <label htmlFor="location" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              Адрес *
            </label>
            <input
              id="location"
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Москва, ул. Примерная, д. 1"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              disabled={loading}
            />
          </div>

          {/* Date and Time */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  Дата *
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>

              {/* Start Time */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  Начало *
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  Окончание *
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Pay and Workers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pay Amount */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <label htmlFor="payAmount" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Оплата (₽) *
              </label>
              <input
                id="payAmount"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="5000"
                min="0"
                step="100"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                disabled={loading}
              />
            </div>

            {/* Required Workers */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <label htmlFor="requiredWorkers" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Работников *
              </label>
              <input
                id="requiredWorkers"
                type="number"
                value={requiredWorkers}
                onChange={(e) => setRequiredWorkers(e.target.value)}
                placeholder="1"
                min="1"
                max="100"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Tools Required */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
            <label htmlFor="toolsRequired" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-400" />
              Требуемые инструменты (необязательно)
            </label>
            <textarea
              id="toolsRequired"
              value={toolsRequired}
              onChange={(e) => setToolsRequired(e.target.value)}
              placeholder="Перечислите через запятую: отвёртка, молоток, дрель"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Укажите инструменты через запятую
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Создание...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Создать смену
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 bg-blue-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-4">
          <p className="text-sm text-blue-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Поля, отмеченные звёздочкой (*), обязательны для заполнения.
              После создания смена будет опубликована и доступна для откликов работников.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
