'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useTelegram } from '@/lib/telegram'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function DebugPage() {
  const supabase = createClient()
  const tg = useTelegram()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({})

  useEffect(() => {
    loadDebugInfo()
  }, [])

  const loadDebugInfo = async () => {
    try {
      setLoading(true)
      const debugInfo: any = {}

      // 1. Check Telegram
      debugInfo.telegram = {
        available: !!tg,
        userId: tg?.user?.id || null,
        username: tg?.user?.username || null,
        firstName: tg?.user?.first_name || null,
        lastName: tg?.user?.last_name || null,
      }

      // 2. Check Auth User
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      debugInfo.auth = {
        exists: !!authUser,
        id: authUser?.id || null,
        email: authUser?.email || null,
        error: authError?.message || null,
      }

      // 3. Check if user exists in public.users by telegram_id
      if (tg?.user?.id) {
        const telegramId = tg.user.id.toString()

        const { data: userByTgId } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', telegramId)
          .maybeSingle()

        debugInfo.userByTelegramId = {
          found: !!userByTgId,
          data: userByTgId || null,
        }
      }

      // 4. Check if user exists in public.users by auth id
      if (authUser) {
        const { data: userByAuthId } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

        debugInfo.userByAuthId = {
          exists: !!userByAuthId,
          data: userByAuthId,
        }

        // 5. Check worker_profile
        if (userByAuthId) {
          const { data: workerProfile } = await supabase
            .from('worker_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .maybeSingle()

          debugInfo.workerProfile = {
            exists: !!workerProfile,
            data: workerProfile,
          }
        }
      }

      setData(debugInfo)
    } catch (error) {
      console.error('Debug error:', error)
      setData({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <XCircle className="w-5 h-5 text-red-400" />
    )
  }

  const resetAccount = async () => {
    if (!confirm('Удалить все данные и начать заново?')) return

    try {
      const telegramId = tg?.user?.id
      if (!telegramId) {
        alert('Нет Telegram ID')
        return
      }

      await supabase.from('users').delete().eq('telegram_id', telegramId.toString())
      await supabase.auth.signOut()

      alert('Аккаунт удалён! Теперь можно зарегистрироваться заново')
      window.location.href = '/'
    } catch (error) {
      alert('Ошибка: ' + error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-4 overflow-y-auto pb-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">🔍 Диагностика</h1>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon status={data.telegram?.available} />
              <h2 className="text-lg font-semibold text-white">Telegram</h2>
            </div>
            <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded overflow-x-auto">
              {JSON.stringify(data.telegram, null, 2)}
            </pre>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon status={data.auth?.exists} />
              <h2 className="text-lg font-semibold text-white">Auth User</h2>
            </div>
            <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded overflow-x-auto">
              {JSON.stringify(data.auth, null, 2)}
            </pre>
          </div>

          {data.userByTelegramId && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={data.userByTelegramId?.found} />
                <h2 className="text-lg font-semibold text-white">User by Telegram ID</h2>
              </div>
              <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded overflow-x-auto">
                {JSON.stringify(data.userByTelegramId, null, 2)}
              </pre>
            </div>
          )}

          {data.userByAuthId && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={data.userByAuthId?.exists} />
                <h2 className="text-lg font-semibold text-white">User by Auth ID</h2>
              </div>
              <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded overflow-x-auto">
                {JSON.stringify(data.userByAuthId?.data, null, 2)}
              </pre>
            </div>
          )}

          {data.workerProfile && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={data.workerProfile?.exists} />
                <h2 className="text-lg font-semibold text-white">Worker Profile</h2>
              </div>
              <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded overflow-x-auto">
                {JSON.stringify(data.workerProfile, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={loadDebugInfo}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
            >
              <RefreshCw className="w-5 h-5" />
              Обновить
            </button>

            <button
              onClick={resetAccount}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
            >
              <AlertCircle className="w-5 h-5" />
              Удалить аккаунт и начать заново
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
