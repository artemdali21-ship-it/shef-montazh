import { Suspense } from 'react'
import RegistrationScreen from '@/components/RegistrationScreen'

export const metadata = {
  title: 'Регистрация — ШЕФ-МОНТАЖ',
  description: 'Создайте аккаунт на платформе ШЕФ-МОНТАЖ',
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#1A1A1A]" />}>
      <RegistrationScreen />
    </Suspense>
  )
}
