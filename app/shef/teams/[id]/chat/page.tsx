import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Users, MessageCircle } from 'lucide-react'
import TeamChat from '@/components/teams/TeamChat'

export default async function TeamChatPage({
  params
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get team details
  const { data: team } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        worker:users (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!team) {
    return (
      <div className="min-h-screen bg-dashboard flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Бригада не найдена</p>
          <Link
            href="/shef/teams"
            className="text-orange-400 hover:text-orange-500"
          >
            Вернуться к бригадам
          </Link>
        </div>
      </div>
    )
  }

  // Get messages
  const { data: messages } = await supabase
    .from('team_messages')
    .select(`
      *,
      sender:users (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('team_id', params.id)
    .order('created_at', { ascending: true })
    .limit(100) // Last 100 messages

  const memberCount = team.team_members?.length || 0

  return (
    <div className="min-h-screen bg-dashboard">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/shef/teams/${params.id}`}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ArrowLeft size={24} className="text-white" />
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-orange-400" />
                <h1 className="text-xl font-semibold text-white">{team.name}</h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <Users size={16} />
                <span>
                  {memberCount + 1} {memberCount === 0 ? 'участник' : memberCount < 4 ? 'участника' : 'участников'}
                </span>
              </div>
            </div>

            <Link
              href={`/shef/teams/${params.id}`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition"
            >
              Инфо
            </Link>
          </div>
        </div>

        {/* Chat */}
        <TeamChat
          teamId={params.id}
          initialMessages={messages || []}
        />
      </div>
    </div>
  )
}
