'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Wrench, Palette, Zap, Flame, Mountain, Paintbrush, HardHat, CheckCircle, ArrowRight, Loader2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const CATEGORIES: Category[] = [
  { id: 'montazhnik', name: 'Монтажник', icon: Wrench, color: 'text-blue-400' },
  { id: 'dekorator', name: 'Декоратор', icon: Palette, color: 'text-purple-400' },
  { id: 'elektrik', name: 'Электрик', icon: Zap, color: 'text-yellow-400' },
  { id: 'svarshik', name: 'Сварщик', icon: Flame, color: 'text-orange-400' },
  { id: 'alpinist', name: 'Альпинист', icon: Mountain, color: 'text-cyan-400' },
  { id: 'butafor', name: 'Бутафор', icon: Paintbrush, color: 'text-pink-400' },
  { id: 'raznorabochiy', name: 'Разнорабочий', icon: HardHat, color: 'text-gray-400' },
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSubmit = async () => {
    // Validation
    if (selectedCategories.length === 0) {
      toast.error('Выберите хотя бы одну категорию')
      return
    }

    try {
      setSubmitting(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get category names
      const categoryNames = selectedCategories.map(
        id => CATEGORIES.find(cat => cat.id === id)?.name
      ).filter(Boolean)

      // Update worker_profiles
      const { error } = await supabase
        .from('worker_profiles')
        .update({
          categories: categoryNames,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Профиль настроен!')

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/feed')
      }, 1000)

    } catch (err: any) {
      console.error('Error saving categories:', err)
      toast.error(err.message || 'Не удалось сохранить категории')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      {/* Header */}
      <motion.header
        className="p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-h1 text-white mb-2">Выберите специализацию</h1>
        <p className="text-body text-gray-400">Можно выбрать несколько категорий</p>
      </motion.header>

      <div className="px-4 space-y-3">
        {CATEGORIES.map((category, index) => {
          const Icon = category.icon
          const isSelected = selectedCategories.includes(category.id)

          return (
            <motion.button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`w-full min-h-[72px] p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                isSelected
                  ? 'bg-[#E85D2F]/10 border-[#E85D2F] shadow-lg shadow-[#E85D2F]/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-[#E85D2F]/20' : 'bg-white/5'
              }`}>
                <Icon className={`w-7 h-7 ${isSelected ? 'text-[#E85D2F]' : category.color}`} />
              </div>

              {/* Name */}
              <span className={`flex-1 text-left text-body-large font-semibold ${
                isSelected ? 'text-white' : 'text-gray-300'
              }`}>
                {category.name}
              </span>

              {/* Checkmark */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#E85D2F] scale-100'
                  : 'bg-white/10 scale-0'
              }`}>
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Selected Count */}
      {selectedCategories.length > 0 && (
        <motion.div
          className="px-4 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-body text-green-400">
              Выбрано: <strong>{selectedCategories.length}</strong> {
                selectedCategories.length === 1 ? 'категория' :
                selectedCategories.length < 5 ? 'категории' : 'категорий'
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#2A2A2A]/95 backdrop-blur-xl border-t border-white/10 max-w-screen-md mx-auto z-20">
        <button
          onClick={handleSubmit}
          disabled={selectedCategories.length === 0 || submitting}
          className="w-full min-h-[56px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-white font-bold text-body-large shadow-lg shadow-orange-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {submitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              Продолжить
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
    </main>
  )
}
