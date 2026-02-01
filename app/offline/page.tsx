import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center space-y-4">
        <WifiOff className="w-16 h-16 text-gray-400 mx-auto" />
        <h1 className="text-2xl font-bold text-white">Нет подключения</h1>
        <p className="text-gray-400">
          Проверьте интернет-соединение и попробуйте снова
        </p>
      </div>
    </div>
  )
}
