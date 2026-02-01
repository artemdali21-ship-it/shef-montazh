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
  '/worker-categories',
  '/auth/login',
  '/auth/register',
  '/create-shift',
]

// Routes that have their own layout with navigation
const HAS_OWN_NAV = ['/shef/', '/client/', '/worker/']

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

        // Get user role from database (now async)
        const role = await getUserRole()
        setUserType(role)
      } catch (error) {
        console.error('Error initializing user:', error)
      } finally {
        setMounted(true)
      }
    }

    initUser()
  }, [])

  // Check if current page should show navigation
  const showNav = !isRootPage(pathname) &&
    !NO_NAV_PAGES.some(page => pathname.startsWith(page)) &&
    !HAS_OWN_NAV.some(route => pathname.startsWith(route))

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-dashboard overflow-y-auto">
        {children}
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-dashboard">
      <div className={showNav ? 'pb-24 min-h-screen' : 'min-h-screen'}>
        {children}
      </div>
      {showNav && <BottomNav userType={userType} userId={userId} />}
    </div>
  )
}
