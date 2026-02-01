'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CreateTeamForm from '@/components/teams/CreateTeamForm'

export default function CreateTeamPage() {
  return (
    <div className="min-h-screen bg-dashboard pb-24">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/shef/teams"
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Создать бригаду</h1>
            <p className="text-gray-400">Соберите команду исполнителей</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <CreateTeamForm />
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-300">
            💡 После создания бригады вы сможете добавить в неё исполнителей и назначать всю бригаду на смены одним кликом.
          </p>
        </div>
      </div>
    </div>
  )
}
