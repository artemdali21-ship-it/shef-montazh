'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { ShiftSearch } from '@/components/search/ShiftSearch'
import { WorkerSearch } from '@/components/search/WorkerSearch'
import { getUserRole } from '@/lib/auth'

export default function SearchPage() {
  const userRole = getUserRole()

  return (
    <div
      className="w-full h-screen flex flex-col"
      style={{
        backgroundImage: 'url(/images/gradient-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
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
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4 font-sans">
        {/* WORKER & SHEF: SHIFT SEARCH */}
        {(userRole === 'worker' || userRole === 'shef') && <ShiftSearch />}
        
        {/* CLIENT: WORKER SEARCH */}
        {userRole === 'client' && <WorkerSearch />}
      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomNav userType={userRole === 'worker' ? 'worker' : userRole === 'shef' ? 'shef' : 'client'} />
    </div>
  )
}
