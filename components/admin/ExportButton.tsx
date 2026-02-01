'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

interface Props {
  payments: Array<{
    amount: number
    platform_fee: number
    created_at: string
  }>
}

export default function ExportButton({ payments }: Props) {
  const [exporting, setExporting] = useState(false)

  const exportToCSV = () => {
    setExporting(true)

    try {
      // Create CSV header
      const headers = ['Дата', 'Сумма (₽)', 'Комиссия (₽)', 'Выплата исполнителю (₽)']

      // Create CSV rows
      const rows = payments.map(payment => {
        const date = new Date(payment.created_at).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
        const amount = payment.amount
        const fee = payment.platform_fee
        const payout = amount - fee

        return [date, amount, fee, payout]
      })

      // Add totals row
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
      const totalFees = payments.reduce((sum, p) => sum + p.platform_fee, 0)
      const totalPayouts = payments.reduce((sum, p) => sum + (p.amount - p.platform_fee), 0)

      rows.push([''])
      rows.push(['ИТОГО', totalAmount, totalFees, totalPayouts])

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

      // Create download link
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      const timestamp = new Date().toISOString().split('T')[0]

      link.setAttribute('href', url)
      link.setAttribute('download', `finance_report_${timestamp}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Ошибка при экспорте отчёта')
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={exportToCSV}
      disabled={exporting || payments.length === 0}
      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <Download size={20} />
      {exporting ? 'Экспорт...' : 'Скачать отчёт'}
    </button>
  )
}
