'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatWindow from '@/components/messages/ChatWindow'
import { createClient } from '@/lib/supabase-client'

export default function ClientChatPage({ params }: { params: { userId: string } }) {
  const router = useRouter()
  const supabase = createClient()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [partnerName, setPartnerName] = useState<string>('')
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [params.userId])

  const loadUserData = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setCurrentUserId(user.id)

      // Get partner data
      const { data: partnerData, error: partnerError } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', params.userId)
        .single()

      if (partnerError) {
        console.error('Error loading partner data:', partnerError)
        return
      }

      setPartnerName(partnerData.full_name || 'Пользователь')
      setPartnerAvatar(partnerData.avatar_url || null)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!currentUserId) {
    return null
  }

  return (
    <ChatWindow
      currentUserId={currentUserId}
      partnerId={params.userId}
      partnerName={partnerName}
      partnerAvatar={partnerAvatar}
      userType="client"
    />
  )
}
