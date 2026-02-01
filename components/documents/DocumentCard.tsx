'use client'

import { FileText, Receipt, FileSignature, Download, Calendar } from 'lucide-react'

interface Document {
  id: string
  type: 'act' | 'receipt' | 'contract'
  title: string
  file_url: string | null
  created_at: string
  shift_id: string | null
}

interface DocumentCardProps {
  document: Document
}

const documentIcons = {
  act: FileText,
  receipt: Receipt,
  contract: FileSignature
}

const documentTypes = {
  act: 'Акт',
  receipt: 'Чек',
  contract: 'Договор'
}

const documentColors = {
  act: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  receipt: 'bg-green-500/10 text-green-400 border-green-500/20',
  contract: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
}

export default function DocumentCard({ document }: DocumentCardProps) {
  const Icon = documentIcons[document.type]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleDownload = () => {
    if (document.file_url) {
      window.open(document.file_url, '_blank')
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-200">
      {/* Header with icon and badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${documentColors[document.type]} flex items-center justify-center border`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${documentColors[document.type]}`}>
          {documentTypes[document.type]}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
        {document.title}
      </h3>

      {/* Date */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(document.created_at)}</span>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={!document.file_url}
        className="
          w-full flex items-center justify-center gap-2 px-4 py-2.5
          bg-orange-500/10 hover:bg-orange-500/20 text-orange-400
          border border-orange-500/20 rounded-xl
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 font-medium
        "
      >
        <Download className="w-4 h-4" />
        Скачать
      </button>
    </div>
  )
}
