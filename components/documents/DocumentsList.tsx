'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DocumentsListProps {
  userId: string
}

export default function DocumentsList({ userId }: DocumentsListProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)

  useEffect(() => {
    loadDocuments()
  }, [userId])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadDocument = (doc: any) => {
    const blob = new Blob([doc.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.document_number}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const documentTypeLabels = {
    completion_act: 'Акт выполненных работ',
    payment_receipt: 'Платежный документ',
    contract: 'Договор',
    other: 'Другое'
  }

  const documentTypeIcons = {
    completion_act: '📄',
    payment_receipt: '💳',
    contract: '📋',
    other: '📎'
  }

  if (loading) {
    return <LoadingSpinner text="Загрузка документов..." />
  }

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            У вас пока нет документов
          </h3>
          <p className="text-gray-600">
            Документы будут создаваться автоматически при завершении смен
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-4xl">
                    {documentTypeIcons[doc.type] || '📎'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {documentTypeLabels[doc.type] || doc.type}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      № {doc.document_number}
                    </p>
                    {doc.shift && (
                      <p className="text-sm text-gray-700 mb-1">
                        Смена: {doc.shift.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Создан: {new Date(doc.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    👁 Просмотр
                  </button>
                  <button
                    onClick={() => downloadDocument(doc)}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                  >
                    ⬇ Скачать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {documentTypeLabels[selectedDoc.type]} № {selectedDoc.document_number}
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                {selectedDoc.content}
              </pre>
            </div>

            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => downloadDocument(selectedDoc)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Скачать документ
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
