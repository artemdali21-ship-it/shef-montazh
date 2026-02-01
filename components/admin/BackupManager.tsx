'use client'

import { useState } from 'react'
import { Database, Download, Info } from 'lucide-react'

export default function BackupManager() {
  const [loading, setLoading] = useState(false)

  const handleBackup = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' })
      const data = await res.json()

      if (data.instructions) {
        alert(data.instructions.join('\n'))
      } else {
        alert('Backup initiated!')
      }
    } catch (err) {
      alert('Backup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Резервное копирование</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-2">Рекомендации:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-400">
              <li>Supabase Pro ($25/мес) — автобэкапы каждый день</li>
              <li>Хранение 7 последних копий</li>
              <li>Восстановление в 1 клик</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleBackup}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {loading ? 'Запрос бэкапа...' : 'Запросить бэкап (ручной)'}
        </button>
      </div>
    </div>
  )
}
