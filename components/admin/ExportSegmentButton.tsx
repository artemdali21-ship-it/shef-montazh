'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

interface Props {
  users: any[]
  segmentName: string
}

export default function ExportSegmentButton({ users, segmentName }: Props) {
  const [exporting, setExporting] = useState(false)

  const exportToCSV = () => {
    if (users.length === 0) {
      alert('Нет пользователей для экспорта')
      return
    }

    setExporting(true)

    try {
      // CSV headers
      const headers = [
        'ID',
        'Имя',
        'Email',
        'Телефон',
        'Роль',
        'Рейтинг',
        'Дата регистрации'
      ]

      // CSV rows
      const rows = users.map(user => [
        user.id,
        user.full_name || '',
        user.email || '',
        user.phone || '',
        user.role || '',
        user.rating?.toFixed(1) || '',
        user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : ''
      ])

      // Combine
      const csvContent = [
        headers.join(','),
        ...rows.map(row =>
          row.map(cell => {
            // Escape cells with commas or quotes
            const cellStr = String(cell)
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          }).join(',')
        )
      ].join('\n')

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

      // Download
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `segment_${segmentName.replace(/\s+/g, '_')}_${timestamp}.csv`

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export error:', error)
      alert('Ошибка при экспорте')
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={exportToCSV}
      disabled={exporting || users.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={20} />
      {exporting ? 'Экспорт...' : 'Экспорт CSV'}
    </button>
  )
}
