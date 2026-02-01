'use client'

import { useState } from 'react'
import { ChevronDown, User, Filter } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  } | null
}

interface Props {
  logs: AuditLog[]
}

export default function AuditLogTable({ logs }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<string>('all')

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'text-green-400 bg-green-500/10 border-green-500/20'
    if (action.includes('banned') || action.includes('deleted') || action.includes('failed')) {
      return 'text-red-400 bg-red-500/10 border-red-500/20'
    }
    if (action.includes('resolved') || action.includes('completed') || action.includes('processed')) {
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
    if (action.includes('updated')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  }

  const getActionIcon = (action: string) => {
    if (action.includes('created')) return '✨'
    if (action.includes('banned')) return '🚫'
    if (action.includes('unbanned')) return '✅'
    if (action.includes('deleted')) return '🗑️'
    if (action.includes('completed')) return '✔️'
    if (action.includes('resolved')) return '🤝'
    if (action.includes('assigned')) return '👤'
    if (action.includes('payment')) return '💳'
    if (action.includes('message')) return '💬'
    return '📝'
  }

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.action.startsWith(filter))

  const actionTypes = [
    { value: 'all', label: 'Все действия' },
    { value: 'user', label: 'Пользователи' },
    { value: 'shift', label: 'Смены' },
    { value: 'payment', label: 'Платежи' },
    { value: 'rating', label: 'Рейтинги' },
    { value: 'dispute', label: 'Споры' },
    { value: 'team', label: 'Бригады' }
  ]

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <Filter size={20} className="text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {actionTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-400">
          {filteredLogs.length} записей
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Время
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Пользователь
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Действие
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                Объект
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                Детали
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4 text-sm text-white whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div className="flex items-center gap-3">
                          {log.user.avatar_url ? (
                            <img
                              src={log.user.avatar_url}
                              alt={log.user.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-semibold">
                              {log.user.full_name[0] || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white text-sm">
                              {log.user.full_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {log.user.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <span className="text-gray-400 text-sm">System</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getActionColor(log.action)}`}>
                        <span>{getActionIcon(log.action)}</span>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.entity_type && (
                        <div className="text-sm">
                          <div className="text-white font-medium capitalize">
                            {log.entity_type}
                          </div>
                          {log.entity_id && (
                            <div className="text-xs text-gray-500 font-mono">
                              {log.entity_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(log.metadata || log.ip_address || log.user_agent) && (
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition"
                        >
                          <ChevronDown
                            size={16}
                            className={`transform transition-transform ${expandedRows.has(log.id) ? 'rotate-180' : ''}`}
                          />
                          {expandedRows.has(log.id) ? 'Скрыть' : 'Показать'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRows.has(log.id) && (
                    <tr className="border-b border-white/5 bg-white/3">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="space-y-3">
                          {log.metadata && (
                            <div>
                              <div className="text-sm font-medium text-gray-400 mb-2">
                                Метаданные:
                              </div>
                              <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded-lg overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.ip_address && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">IP:</span>
                              <span className="text-white font-mono">{log.ip_address}</span>
                            </div>
                          )}
                          {log.user_agent && (
                            <div className="flex items-start gap-2 text-sm">
                              <span className="text-gray-400 whitespace-nowrap">User Agent:</span>
                              <span className="text-gray-300 text-xs break-all">{log.user_agent}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  Логи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-sm text-gray-400 text-center">
        Показаны последние {filteredLogs.length} записей
      </div>
    </div>
  )
}
