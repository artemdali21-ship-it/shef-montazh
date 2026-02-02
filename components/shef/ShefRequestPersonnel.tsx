'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'

interface ShefRequestPersonnelProps {
  shefId: string
}

export default function ShefRequestPersonnel({ shefId }: ShefRequestPersonnelProps) {
  const supabase = createClient()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    quantity: 1,
    date: '',
    location: '',
    pay_amount: '',
    notes: ''
  })

  const categories = [
    'Монтажник декораций',
    'Грузчик / Стейдж-грузчик',
    'Промышленный альпинист',
    'Декоратор / Маляр',
    'Светотехник',
    'Звукотехник',
    'Электрик (ивент/сцена)',
    'Видео / LED-техник',
    'Водитель',
    'Курьер / Раннер',
    'Клининг'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('personnel_requests').insert([
        {
          shef_id: shefId,
          category: formData.category,
          quantity: formData.quantity,
          date: formData.date,
          location: formData.location,
          pay_amount: parseInt(formData.pay_amount),
          notes: formData.notes,
          status: 'pending'
        }
      ])

      if (error) throw error

      toast.success('Запрос отправлен')
      setFormData({
        category: '',
        quantity: 1,
        date: '',
        location: '',
        pay_amount: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error creating request:', error)
      toast.error('Ошибка при создании запроса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Запросить персонал</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Категория */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Категория *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Количество */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Количество *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Дата */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Дата *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Локация */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Локация *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Адрес объекта"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Оплата */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Оплата (₽) *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.pay_amount}
              onChange={(e) => setFormData({ ...formData, pay_amount: e.target.value })}
              placeholder="Сумма за смену"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Примечания */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Примечания</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Кнопка */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {loading ? 'Отправка...' : 'Отправить запрос'}
          </button>
        </form>
      </div>
    </div>
  )
}
