'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { hapticLight } from '@/lib/haptic'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  badge?: number
}

interface BottomNavProps {
  userType: 'worker' | 'client'
  userId?: string
}

export function BottomNav({ userType, userId }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread messages count
  useEffect(() => {
    if (!userId) return

    const fetchUnreadCount = async () => {
      try {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('read', false)

        setUnreadCount(count || 0)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const workerNavItems: NavItem[] = [
    { icon: Home, label: 'Главная', href: '/worker/shifts' },
    { icon: Search, label: 'Поиск', href: '/worker/search' },
    { icon: MessageCircle, label: 'Сообщения', href: '/worker/messages', badge: unreadCount },
    { icon: User, label: 'Профиль', href: '/worker/profile' },
  ]

  const clientNavItems: NavItem[] = [
    { icon: Home, label: 'Главная', href: '/client/shifts' },
    { icon: Plus, label: 'Создать', href: '/create-shift' },
    { icon: MessageCircle, label: 'Сообщения', href: '/client/messages', badge: unreadCount },
    { icon: User, label: 'Профиль', href: '/client/profile' },
  ]

  const navItems = userType === 'worker' ? workerNavItems : clientNavItems

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t-2 border-white/30"
      style={{
        background: 'rgba(255, 255, 255, 0.25)',
        height: '64px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="max-w-screen-md mx-auto h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <button
              key={item.href}
              onClick={() => {
                hapticLight();
                router.push(item.href);
              }}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] px-2 py-1 transition-colors duration-200"
            >
              <div className="relative flex items-center justify-center w-6 h-6">
                <Icon
                  className={`w-6 h-6 transition-colors duration-200 ${
                    active ? 'text-[#E85D2F]' : 'text-white'
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white leading-none">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  </div>
                )}
              </div>
              <span
                className={`text-[12px] font-medium transition-colors duration-200 ${
                  active ? 'text-[#E85D2F]' : 'text-white'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
