'use client'

import { useEffect, useState } from 'react'
import { getUserRole } from '@/lib/auth'
import WorkerDashboard from '@/components/dashboard/WorkerDashboard'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import ShefDashboardScreen from '@/components/ShefDashboardScreen'

export default function DashboardPage() {
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('worker')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const userRole = getUserRole()
    setRole(userRole)
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка дашборда...</p>
        </div>
      </div>
    )
  }

  // Show role-specific dashboard
  if (role === 'client') {
    return <ClientDashboard />
  } else if (role === 'shef') {
    return <ShefDashboardScreen />
  } else {
    return <WorkerDashboard />
  }
}
