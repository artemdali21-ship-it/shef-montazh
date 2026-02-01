'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowInstall(false)
    }

    setDeferredPrompt(null)
  }

  if (!showInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white/10 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 z-50">
      <button
        onClick={() => setShowInstall(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <Download className="w-6 h-6 text-orange-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Установить приложение</h3>
          <p className="text-sm text-gray-300 mb-3">
            Добавьте на домашний экран для быстрого доступа
          </p>
          <button
            onClick={handleInstall}
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition"
          >
            Установить
          </button>
        </div>
      </div>
    </div>
  )
}
