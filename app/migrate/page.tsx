'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function MigrationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runMigration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/migrate-telegram-auth', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer migrate-2024',
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Ошибка миграции')
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Миграция на Telegram ID
        </h1>
        <p className="text-gray-400 mb-8">
          Эта страница переведёт всех существующих пользователей на авторизацию через Telegram ID
        </p>

        {/* Migration Button */}
        <button
          onClick={runMigration}
          disabled={loading || !!result}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Выполняется миграция...
            </>
          ) : result ? (
            <>
              <CheckCircle className="w-6 h-6" />
              Миграция завершена
            </>
          ) : (
            'Запустить миграцию'
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Ошибка</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="mt-6 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-green-400 font-semibold text-lg mb-1">
                  Миграция успешно завершена!
                </h3>
                <p className="text-green-300 text-sm">
                  {result.message}
                </p>
              </div>
            </div>

            {/* Results Stats */}
            {result.results && (
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Всего пользователей:</span>
                  <span className="text-white font-semibold">{result.results.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Мигрировано успешно:</span>
                  <span className="text-green-400 font-semibold">{result.results.migrated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Пропущено:</span>
                  <span className="text-yellow-400 font-semibold">{result.results.skipped}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ошибок:</span>
                  <span className="text-red-400 font-semibold">{result.results.errors?.length || 0}</span>
                </div>
              </div>
            )}

            {/* Error Details */}
            {result.results?.errors && result.results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white font-semibold mb-2">Детали ошибок:</h4>
                <div className="bg-white/5 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {result.results.errors.map((err: any, idx: number) => (
                    <div key={idx} className="text-sm text-red-300 mb-2">
                      User {err.userId}: {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">Что дальше?</h4>
              <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
                <li>Теперь пользователи могут входить по Telegram ID</li>
                <li>Автологин при открытии из Telegram работает</li>
                <li>Email/пароль больше не требуются</li>
                <li>Можно закрыть эту страницу и протестировать вход</li>
              </ul>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-yellow-300 text-sm">
            ⚠️ <strong>Внимание:</strong> Эту миграцию нужно запустить только один раз.
            После успешного выполнения все пользователи смогут входить через Telegram ID.
          </p>
        </div>
      </div>
    </div>
  )
}
