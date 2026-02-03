'use client'

import { Suspense } from 'react'
import { RolePickerContent } from '@/components/auth/RolePickerContent'

export default function RolePickerPage() {
  return (
    <Suspense fallback={<RolePickerLoading />}>
      <RolePickerContent />
    </Suspense>
  )
}

function RolePickerLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-white">Загрузка...</div>
    </div>
  )
}
