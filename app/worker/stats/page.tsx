'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, DollarSign, Star, Calendar, Clock } from 'lucide-react'

export default function WorkerStatsPage() {
  const router = useRouter()

  // Demo stats
  const stats = {
    totalShifts: 24,
    totalEarnings: 48500,
    avgRating: 4.8,
    completedThisMonth: 12,
    hoursWorked: 144,
    earningsThisMonth: 24000,
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Статистика</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Shifts */}
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-300">Всего смен</p>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalShifts}</p>
            <p className="text-xs text-blue-300 mt-1">За всё время</p>
          </div>

          {/* Total Earnings */}
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-300">Заработок</p>
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalEarnings.toLocaleString()} ₽</p>
            <p className="text-xs text-green-300 mt-1">За всё время</p>
          </div>

          {/* This Month Shifts */}
          <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-orange-300">Смены этот месяц</p>
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.completedThisMonth}</p>
            <p className="text-xs text-orange-300 mt-1">{stats.hoursWorked} часов</p>
          </div>

          {/* Ratings */}
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-300">Рейтинг</p>
              <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
            <p className="text-xs text-purple-300 mt-1">Из 5 звёзд</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Заработок этого месяца</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-gray-300">Итого</p>
              <p className="text-xl font-bold text-green-400">{stats.earningsThisMonth.toLocaleString()} ₽</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
            <p className="text-xs text-gray-400">75% от потенциального максимума</p>
          </div>
        </div>

        {/* Performance Info */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">Совет</h3>
          <p className="text-sm text-blue-200">
            Полное заполнение профиля и своевременное прибытие на смены помогут вам получить больше предложений и повысить заработок!
          </p>
        </div>
      </div>
    </div>
  )
}
