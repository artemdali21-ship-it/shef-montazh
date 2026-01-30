'use client'

import { useState } from 'react'

export default function PaymentsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTestPayment = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId: 'shift-123',
          workerId: 'worker-456',
          amount: 2500,
          description: 'Payment for shift work',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Payment creation failed')
        return
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Тестирование платежей</h1>

        <button
          onClick={handleTestPayment}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold mb-6"
        >
          {loading ? 'Создание платежа...' : 'Создать платёж'}
        </button>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-4">
            Ошибка: {error}
          </div>
        )}

        {result && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg">
            <h2 className="font-bold mb-2">Платёж успешно создан</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
