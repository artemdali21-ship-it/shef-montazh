'use client'

import { useParams } from 'next/navigation'
import Onboarding from '@/components/auth/Onboarding'
import type { UserRole } from '@/types/session'

export default function OnboardingPage() {
  const params = useParams()
  const role = params.role as UserRole

  // Validate role
  const validRoles: UserRole[] = ['worker', 'client', 'shef']
  if (!validRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Неверная роль</h1>
          <p className="text-gray-400">Пожалуйста, вернитесь назад и выберите роль</p>
        </div>
      </div>
    )
  }

  return <Onboarding role={role} />
}
