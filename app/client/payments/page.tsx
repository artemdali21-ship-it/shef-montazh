'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Wallet, Download, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import {
  getClientPayments,
  getClientPaymentsSummary,
  getPaymentById,
  exportPaymentsData,
  PaymentFilters,
  Payment
} from '@/lib/api/payments'
import PaymentCard from '@/components/payments/PaymentCard'
import PaymentFilters from '@/components/payments/PaymentFilters'
import PaymentStatusBadge from '@/components/payments/PaymentStatusBadge'

export default function ClientPaymentsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [clientId, setClientId] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState({
    totalSpent: 0,
    toPay: 0,
    overdue: 0
  })
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1
  })
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Modal for payment details
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadClientData()
  }, [])

  useEffect(() => {
    if (clientId) {
      loadPayments()
    }
  }, [clientId, filters])

  const loadClientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setClientId(user.id)

      // Load summary
      const summaryData = await getClientPaymentsSummary(user.id)
      setSummary({
        totalSpent: summaryData.totalSpent || 0,
        toPay: summaryData.toPay || 0,
        overdue: summaryData.overdue || 0
      })
    } catch (error) {
      console.error('Error loading client data:', error)
    }
  }

  const loadPayments = async () => {
    if (!clientId) return

    try {
      setLoading(true)
      const result = await getClientPayments(clientId, filters)
      setPayments(result.data)
      setTotalPages(result.totalPages)
      setTotalCount(result.count)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: PaymentFilters) => {
    setFilters(newFilters)
  }

  const handleReset = () => {
    setFilters({
      status: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1
    })
  }

  const handlePaymentClick = async (paymentId: string) => {
    try {
      const { data } = await getPaymentById(paymentId)
      if (data) {
        setSelectedPayment(data)
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error loading payment details:', error)
    }
  }

  const handleExportToExcel = async () => {
    if (!clientId) return

    try {
      // Dynamic import of xlsx to avoid build errors
      const XLSX = await import('xlsx')

      const { data } = await exportPaymentsData(clientId, 'client')

      const excelData = data.map(p => ({
        'Дата создания': new Date(p.created_at).toLocaleDateString('ru-RU'),
        'Смена': p.shift?.title || '-',
        'Дата смены': p.shift?.date ? new Date(p.shift.date).toLocaleDateString('ru-RU') : '-',
        'Исполнитель': p.worker?.full_name || '-',
        'Сумма': p.amount,
        'Комиссия': p.platform_fee,
        'Статус': p.status,
        'Оплачено': p.paid_at ? new Date(p.paid_at).toLocaleDateString('ru-RU') : '-',
      }))

      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Платежи')
      XLSX.writeFile(wb, `payments_${Date.now()}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Для экспорта в Excel необходимо установить пакет xlsx: npm install xlsx')
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽'
  }

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-dashboard pb-24">
      {/* Header with Summary */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-h1 text-white">История платежей</h1>
              <p className="text-body-small text-gray-400">
                {totalCount} {totalCount === 1 ? 'платеж' : 'платежей'}
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <p className="text-xs text-blue-400/60 mb-1">Всего потрачено</p>
              <p className="text-blue-400 font-bold text-lg">
                {formatCurrency(summary.totalSpent)}
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
              <p className="text-xs text-orange-400/60 mb-1">К оплате</p>
              <p className="text-orange-400 font-bold text-lg">
                {formatCurrency(summary.toPay)}
              </p>
            </div>
            {summary.overdue > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-xs text-red-400/60 mb-1">Просрочено</p>
                <p className="text-red-400 font-bold text-lg">
                  {formatCurrency(summary.overdue)}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <PaymentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        {/* Export Button */}
        {payments.length > 0 && (
          <button
            onClick={handleExportToExcel}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Скачать Excel
          </button>
        )}

        {/* Payments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              У вас пока нет платежей
            </h3>
            <p className="text-gray-400">
              История платежей появится после создания смен
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                role="client"
                onClick={() => handlePaymentClick(payment.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              disabled={filters.page === 1}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition"
            >
              Назад
            </button>
            <span className="px-4 py-2 text-white">
              {filters.page} / {totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={filters.page === totalPages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A2A] rounded-2xl border border-white/10 max-w-lg w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Детали платежа</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <PaymentStatusBadge status={selectedPayment.status} size="lg" />
              </div>

              {/* Shift Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Смена</h4>
                <p className="text-white font-bold mb-1">{selectedPayment.shift?.title}</p>
                {selectedPayment.shift?.date && (
                  <p className="text-sm text-gray-400">
                    {new Date(selectedPayment.shift.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
                {selectedPayment.shift?.address && (
                  <p className="text-sm text-gray-400 mt-1">{selectedPayment.shift.address}</p>
                )}
              </div>

              {/* Worker Info */}
              {selectedPayment.worker && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Исполнитель</h4>
                  <p className="text-white">{selectedPayment.worker.full_name}</p>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Сумма</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Оплата исполнителю:</span>
                    <span className="text-white font-bold">{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Комиссия платформы:</span>
                    <span className="text-gray-400">{formatCurrency(selectedPayment.platform_fee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Итого к оплате:</span>
                    <span className="text-orange-400 font-bold text-lg">
                      {formatCurrency(selectedPayment.amount + selectedPayment.platform_fee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Даты</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Создано:</span>
                    <span className="text-white">
                      {new Date(selectedPayment.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  {selectedPayment.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Оплачено:</span>
                      <span className="text-white">
                        {new Date(selectedPayment.paid_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction ID */}
              {selectedPayment.yukassa_payment_id && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">ID транзакции</h4>
                  <p className="text-white text-sm font-mono">{selectedPayment.yukassa_payment_id}</p>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {selectedPayment.status === 'pending' && (
                  <button
                    onClick={() => alert('Функция оплаты будет реализована')}
                    className="col-span-2 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition"
                  >
                    Оплатить
                  </button>
                )}
                {selectedPayment.status === 'paid' && (
                  <>
                    <button
                      onClick={() => alert('Функция скачивания чека будет реализована')}
                      className="py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-orange-400 font-semibold transition"
                    >
                      Скачать чек
                    </button>
                    <button
                      onClick={() => alert('Функция отправки сообщения о проблеме будет реализована')}
                      className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition"
                    >
                      Сообщить о проблеме
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
