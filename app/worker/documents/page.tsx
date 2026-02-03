'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, FileText, Download, Plus } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

interface Document {
  id: string
  title: string
  type: 'акт' | 'смета' | 'контракт'
  date: string
  size: string
}

export default function WorkerDocumentsPage() {
  const router = useRouter()
  const [documents] = useState<Document[]>([])

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Документы</h1>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
            title="Добавить документ"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <div className="p-4">
        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Нет документов"
            description="Документы по смене будут отображаться здесь после её завершения"
          />
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{doc.title}</h3>
                  <p className="text-sm text-gray-400">
                    {doc.type} • {doc.date}
                  </p>
                </div>
                <button className="ml-2 p-2 hover:bg-white/10 rounded-lg transition">
                  <Download className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
