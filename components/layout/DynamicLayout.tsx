'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { supabase } from '@/lib/supabase'
import { getUserRole } from '@/lib/auth'

interface DynamicLayoutProps {
  children: React.ReactNode
}

// Pages that should NOT show bottom navigation
const NO_NAV_PAGES = [
  '/login',
  '/register',
  '/onboarding',
  '/role-select',
  '/verify-phone',
  '/profile-setup',
  '/auth/login',
  '/auth/register',
]

// Special check for exact root path
const isRootPage = (path: string) => path === '/'

export function DynamicLayout({ children }: DynamicLayoutProps) {
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [userType, setUserType] = useState<'worker' | 'client' | 'shef'>('worker')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initUser = async () => {
      try {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
        }

        // Get user role
        const role = getUserRole()
        setUserType(role === 'shef' ? 'worker' : role) // Shef uses worker navigation for now
      } catch (error) {
        console.error('Error initializing user:', error)
      } finally {
        setMounted(true)
      }
    }

    initUser()
  }, [])

  // Check if current page should show navigation
  const showNav = !isRootPage(pathname) && !NO_NAV_PAGES.some(page => pathname.startsWith(page))

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] overflow-y-auto">
        {children}
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A]">
      <div className={showNav ? 'pb-24 min-h-screen' : 'min-h-screen'}>
        {children}
      </div>
      {showNav && <BottomNav userType={userType} userId={userId} />}
    </div>
  )
}
