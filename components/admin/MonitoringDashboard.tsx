'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function MonitoringDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('day')
  const [filterType, setFilterType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadMonitoringData()

    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [timeRange, filterType, autoRefresh])

  const loadMonitoringData = async () => {
    try {
      const type = filterType === 'all' ? '' : `&type=${filterType}`
      const response = await fetch(
        `/api/admin/monitoring?timeRange=${timeRange}${type}`
      )

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Загрузка мониторинга..." />
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Период:</span>
          {(['hour', 'day', 'week'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'hour' ? 'Час' : range === 'day' ? 'День' : 'Неделя'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Автообновление
          </label>
          <button
            onClick={loadMonitoringData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            🔄 Обновить
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="📊"
            label="API запросов"
            value={stats.totalApiCalls.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon="❌"
            label="Ошибок"
            value={stats.totalErrors.toLocaleString()}
            color="red"
          />
          <StatCard
            icon="🔐"
            label="Auth событий"
            value={stats.authEvents.toLocaleString()}
            color="green"
          />
          <StatCard
            icon="⚡"
            label="Ср. время ответа"
            value={`${stats.avgResponseTime} мс`}
            color="yellow"
          />
        </div>
      )}

      {/* Error Rate Alert */}
      {stats && stats.errorRate > 5 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-semibold text-red-900">
                Высокий процент ошибок
              </div>
              <div className="text-sm text-red-700">
                {stats.errorRate.toFixed(2)}% запросов завершились с ошибкой
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Последние логи</h2>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Все типы</option>
            <option value="error">Ошибки</option>
            <option value="api_call">API запросы</option>
            <option value="auth">Аутентификация</option>
            <option value="payment_created">Платежи</option>
            <option value="shift_created">Смены</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Время
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Тип
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Действие
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Детали
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Нет логов
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('ru-RU')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            log.type === 'error'
                              ? 'bg-red-100 text-red-800'
                              : log.type === 'auth'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.details && (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-700">
                              Показать
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: string
  label: string
  value: string
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
