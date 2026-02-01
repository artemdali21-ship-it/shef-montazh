'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import RoleSelector from '@/components/onboarding/RoleSelector'
import CategorySelector from '@/components/onboarding/CategorySelector'
import TelegramPrompt from '@/components/onboarding/TelegramPrompt'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('worker')
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUserId(user.id)
  }

  const handleComplete = async () => {
    if (!userId) return

    try {
      setLoading(true)

      // Update user role and user_type
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role,
          user_type: role
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // If worker, save categories (TODO: implement categories table)
      // if (role === 'worker' && categories.length > 0) {
      //   await supabase
      //     .from('worker_profiles')
      //     .insert({
      //       user_id: userId,
      //       categories
      //     })
      // }

      toast.success('Добро пожаловать в Шеф-Монтаж!')

      // Redirect based on role
      if (role === 'worker') {
        router.push('/shift')
      } else if (role === 'client') {
        router.push('/shifts')
      } else {
        router.push('/') // shef
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error)
      toast.error(error.message || 'Не удалось завершить регистрацию')
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    // Skip step 2 if not worker
    if (step === 1 && role !== 'worker') {
      setStep(3)
    } else {
      setStep(step + 1)
    }
  }

  const totalSteps = role === 'worker' ? 3 : 2

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber <= (role === 'worker' ? step : step === 3 ? 2 : step)

            return (
              <div
                key={index}
                className={`
                  h-1.5 flex-1 rounded-full transition-all duration-300
                  ${isActive ? 'bg-orange-500' : 'bg-white/10'}
                `}
              />
            )
          })}
        </div>

        {/* Step content */}
        {step === 1 && (
          <RoleSelector
            selected={role}
            onSelect={setRole}
            onNext={handleNextStep}
          />
        )}

        {step === 2 && role === 'worker' && (
          <CategorySelector
            selected={categories}
            onSelect={setCategories}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <TelegramPrompt
            onComplete={handleComplete}
            onBack={() => setStep(role === 'worker' ? 2 : 1)}
          />
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#2A2A2A] rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-medium">Завершаем настройку...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
