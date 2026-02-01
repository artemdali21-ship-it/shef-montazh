'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Ban, Loader2, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { getBlockedUsers } from '@/lib/api/blocked'
import BlockButton from '@/components/user/BlockButton'
import Image from 'next/image'

export default function ClientBlockedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [blocked, setBlocked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadBlocked()
  }, [])

  const loadBlocked = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data } = await getBlockedUsers(user.id)
      setBlocked(data)
    } catch (error) {
      console.error('Error loading blocked users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = (targetUserId: string) => {
    setBlocked(prev => prev.filter(b => b.blocked_user?.id !== targetUserId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-dashboard pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-h1 text-white">Заблокированные пользователи</h1>
            <p className="text-body-small text-gray-400">
              {blocked.length} {blocked.length === 1 ? 'пользователь' : 'пользователей'}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Empty State */}
        {blocked.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Ban className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Нет заблокированных пользователей
            </h3>
            <p className="text-gray-400">
              Заблокированные пользователи появятся здесь
            </p>
          </div>
        ) : (
          /* List of Blocked Users */
          <div className="space-y-3">
            {blocked.map((block) => {
              const user = block.blocked_user
              if (!user) return null

              return (
                <div
                  key={block.id}
                  className="card-hover animate-fade-in bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative w-14 h-14 flex-shrink-0">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <h3 className="text-lg font-bold text-white mb-1 truncate">
                        {user.full_name}
                      </h3>

                      {/* Role Badge */}
                      <span className="inline-block px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400 mb-2">
                        {user.role === 'client' ? 'Клиент' : 'Исполнитель'}
                      </span>

                      {/* Reason */}
                      {block.reason && (
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          <span className="text-gray-500">Причина:</span> {block.reason}
                        </p>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Заблокирован {new Date(block.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Unblock Button */}
                    {userId && (
                      <div className="flex-shrink-0">
                        <BlockButton
                          userId={userId}
                          targetUserId={user.id}
                          targetUserName={user.full_name}
                          isBlocked={true}
                          onBlock={() => handleUnblock(user.id)}
                          variant="full"
                          size="md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
