'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { CATEGORIES } from '@/lib/constants/categories'
import toast from 'react-hot-toast'

export default function ProfileSetupPage() {
  const router = useRouter()
  const supabase = createClient()
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

      // Update worker_profiles with category IDs
      const { error } = await supabase
        .from('worker_profiles')
        .update({
          categories: selectedCategories,
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
    <main className="min-h-screen bg-dashboard pb-24">
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
                isSelected ? category.bgColor : 'bg-white/5'
              }`}>
                <Icon className={`w-7 h-7 ${category.color}`} />
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

      {/* Submit Button - Fixed at bottom above BottomNav */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-[#2A2A2A]/95 backdrop-blur-xl border-t border-white/10 max-w-screen-md mx-auto z-40">
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
