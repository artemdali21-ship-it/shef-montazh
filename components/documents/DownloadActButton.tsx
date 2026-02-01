'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

interface Props {
  shiftId: string
  shiftTitle: string
  clientName: string
  workerName: string
  amount: number
  date: string
}

export default function DownloadActButton({
  shiftId,
  shiftTitle,
  clientName,
  workerName,
  amount,
  date
}: Props) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setDownloading(true)

      const response = await fetch('/api/documents/generate-act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          shiftTitle,
          date,
          clientName,
          workerName,
          amount,
          platformFee: 1200,
          workDescription: shiftTitle
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `act-${shiftId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Не удалось скачать акт. Попробуйте снова.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="
        flex items-center justify-center gap-2 px-4 py-2.5
        bg-orange-500 text-white rounded-xl
        hover:bg-orange-600 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 font-medium
      "
    >
      <Download size={20} />
      {downloading ? 'Генерация...' : 'Скачать акт'}
    </button>
  )
}
