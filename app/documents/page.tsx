'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DocumentsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-dashboard">
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-h1 text-white">Документы</h1>
        </div>
      </header>

      <div className="p-4">
        <p className="text-gray-400 text-center mt-20">Страница в разработке</p>
      </div>
    </div>
  )
}
