'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Wallet, Download, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import {
  getWorkerPayments,
  getWorkerPaymentsSummary,
  getPaymentById,
  exportPaymentsData,
  PaymentFilters,
  Payment
} from '@/lib/api/payments'
import PaymentCard from '@/components/payments/PaymentCard'
import PaymentFilters from '@/components/payments/PaymentFilters'
import PaymentStatusBadge from '@/components/payments/PaymentStatusBadge'
import * as XLSX from 'xlsx'

export default function WorkerPaymentsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [workerId, setWorkerId] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState({
    totalReceived: 0,
    pending: 0,
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
    loadWorkerData()
  }, [])

  useEffect(() => {
    if (workerId) {
      loadPayments()
    }
  }, [workerId, filters])

  const loadWorkerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setWorkerId(user.id)

      // Load summary
      const summaryData = await getWorkerPaymentsSummary(user.id)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading worker data:', error)
    }
  }

  const loadPayments = async () => {
    if (!workerId) return

    try {
      setLoading(true)
      const result = await getWorkerPayments(workerId, filters)
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
    if (!workerId) return

    try {
      const { data } = await exportPaymentsData(workerId, 'worker')

      const excelData = data.map(p => ({
        'Дата создания': new Date(p.created_at).toLocaleDateString('ru-RU'),
        'Смена': p.shift?.title || '-',
        'Дата смены': p.shift?.date ? new Date(p.shift.date).toLocaleDateString('ru-RU') : '-',
        'Клиент': p.client?.full_name || '-',
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
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽'
  }

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-24">
      {/* Header with Summary */}
      <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-20">
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
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <p className="text-xs text-green-400/60 mb-1">Всего получено</p>
              <p className="text-green-400 font-bold text-lg">
                {formatCurrency(summary.totalReceived)}
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
              <p className="text-xs text-orange-400/60 mb-1">Ожидает</p>
              <p className="text-orange-400 font-bold text-lg">
                {formatCurrency(summary.pending)}
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-xs text-red-400/60 mb-1">Просрочено</p>
              <p className="text-red-400 font-bold text-lg">
                {formatCurrency(summary.overdue)}
              </p>
            </div>
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
              История платежей появится после завершения смен
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                role="worker"
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

              {/* Client Info */}
              {selectedPayment.client && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Клиент</h4>
                  <p className="text-white">{selectedPayment.client.full_name}</p>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Сумма</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">К получению:</span>
                    <span className="text-white font-bold">{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Комиссия:</span>
                    <span className="text-gray-400">{formatCurrency(selectedPayment.platform_fee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Итого:</span>
                    <span className="text-green-400 font-bold text-lg">
                      {formatCurrency(selectedPayment.amount - selectedPayment.platform_fee)}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
