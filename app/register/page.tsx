import { Suspense } from 'react'
import RegistrationScreen from '@/components/RegistrationScreen'

export const metadata = {
  title: 'Регистрация — ШЕФ-МОНТАЖ',
  description: 'Создайте аккаунт на платформе ШЕФ-МОНТАЖ',
}

export default function RegisterPage() {
  return (
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] overflow-hidden">
      <Suspense fallback={<div className="w-screen h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]" />}>
        <RegistrationScreen />
      </Suspense>
    </div>
  )
}
