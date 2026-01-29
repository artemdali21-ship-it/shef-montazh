import LoginScreen from '@/components/LoginScreen'

export const metadata = {
  title: 'Вход — ШЕФ-МОНТАЖ',
  description: 'Войдите в аккаунт на платформе ШЕФ-МОНТАЖ',
}

export default function LoginPage() {
  return (
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] overflow-hidden">
      <LoginScreen />
    </div>
  )
}
