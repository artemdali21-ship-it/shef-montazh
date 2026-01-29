'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { ShiftSearch } from '@/components/search/ShiftSearch'
import { WorkerSearch } from '@/components/search/WorkerSearch'
import { getUserRole } from '@/lib/auth'
import ClientLayout from '@/components/layouts/ClientLayout'
import WorkerLayout from '@/components/layouts/WorkerLayout'
import ShefLayout from '@/components/layouts/ShefLayout'

export default function SearchPage() {
  const userRole = getUserRole()

  const SearchContent = () => (
    <div className="w-full flex flex-col">
      {/* HEADER */}
      <Header 
        title={
          userRole === 'worker' 
            ? 'Поиск смен' 
            : userRole === 'shef'
            ? 'Поиск смен'
            : 'Поиск исполнителей'
        } 
        showBack={false} 
        showNotifications={true} 
      />

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-20 pb-4 px-4 font-sans">
        {/* WORKER & SHEF: SHIFT SEARCH */}
        {(userRole === 'worker' || userRole === 'shef') && <ShiftSearch />}
        
        {/* CLIENT: WORKER SEARCH */}
        {userRole === 'client' && <WorkerSearch />}
      </div>
    </div>
  )

  const Layout = userRole === 'worker' ? WorkerLayout : userRole === 'shef' ? ShefLayout : ClientLayout

  return (
    <Layout>
      <SearchContent />
    </Layout>
  )
}
