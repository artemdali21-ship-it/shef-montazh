'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  platform_fee: number
  status: string
  created_at: string
  shift: {
    title: string
  } | null
  client: {
    full_name: string
  } | null
  worker: {
    full_name: string
  } | null
}

export default function TransactionsTable() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          platform_fee,
          status,
          created_at,
          shift:shift_id (
            title
          ),
          client:client_id (
            full_name
          ),
          worker:worker_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setTransactions(data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'succeeded':
        return 'text-green-400 bg-green-500/10'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10'
      case 'failed':
        return 'text-red-400 bg-red-500/10'
      default:
        return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
      case 'succeeded':
        return 'Оплачено'
      case 'pending':
        return 'Ожидает'
      case 'failed':
        return 'Отклонено'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Последние транзакции</h3>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Последние транзакции</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Дата</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Смена</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Клиент</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Исполнитель</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Сумма</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Комиссия</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Статус</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 px-4 text-sm text-white">
                    {new Date(tx.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm text-white">
                    {tx.shift?.title || '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight size={14} className="text-red-400" />
                      {tx.client?.full_name || '—'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft size={14} className="text-green-400" />
                      {tx.worker?.full_name || '—'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-white">
                    {tx.amount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-orange-400">
                    {tx.platform_fee.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {getStatusText(tx.status)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  Транзакции не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
