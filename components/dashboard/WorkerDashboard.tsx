'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase, Calendar, MapPin, DollarSign, TrendingUp, Star,
  Clock, CheckCircle
} from 'lucide-react'

export default function WorkerDashboard() {
  const router = useRouter()

  const stats = {
    activeShifts: 2,
    completedShifts: 15,
    totalEarned: 45000,
    averageRating: 4.8,
  }

  const upcomingShifts = [
    {
      id: '1',
      title: 'Монтаж выставочного стенда',
      location: 'Crocus Expo, павильон 3',
      date: '28 января',
      time: '18:00 - 02:00',
      price: 2500,
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Демонтаж декораций',
      location: 'ЦВЗ Манеж',
      date: '29 января',
      time: '20:00 - 02:00',
      price: 3200,
      status: 'upcoming'
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-20">
        <div className="p-4">
          <h1 className="text-h1 text-white mb-1">Мой дашборд</h1>
          <p className="text-body-small text-gray-400">Ваши смены и статистика</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Shifts */}
          <div className="bg-orange-500/10 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stats.activeShifts}</p>
            <p className="text-xs text-gray-400">Активных смен</p>
          </div>

          {/* Completed Shifts */}
          <div className="bg-green-500/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stats.completedShifts}</p>
            <p className="text-xs text-gray-400">Завершено смен</p>
          </div>

          {/* Total Earned */}
          <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {stats.totalEarned.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-xs text-gray-400">Всего заработано</p>
          </div>

          {/* Average Rating */}
          <div className="bg-yellow-500/10 backdrop-blur-xl rounded-2xl border border-yellow-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stats.averageRating}</p>
            <p className="text-xs text-gray-400">Средний рейтинг</p>
          </div>
        </div>

        {/* Upcoming Shifts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Ближайшие смены</h2>
            <button
              onClick={() => router.push('/shifts')}
              className="text-orange-400 text-sm font-medium hover:text-orange-300 transition"
            >
              Все смены
            </button>
          </div>

          {upcomingShifts.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Нет ближайших смен</h3>
              <p className="text-gray-400 mb-6">Найдите смены в разделе "Смены"</p>
              <button
                onClick={() => router.push('/shifts')}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition shadow-lg shadow-orange-500/30"
              >
                Найти смены
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingShifts.map((shift) => (
                <div
                  key={shift.id}
                  onClick={() => router.push(`/shift/${shift.id}`)}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold text-lg">{shift.title}</h3>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                      Скоро
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{shift.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{shift.date} • {shift.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        {shift.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/shifts')}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition text-left"
            >
              <Briefcase className="w-8 h-8 text-orange-400 mb-2" />
              <p className="text-white font-semibold">Найти смены</p>
              <p className="text-xs text-gray-400 mt-1">Доступные вакансии</p>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition text-left"
            >
              <Star className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-white font-semibold">Мой профиль</p>
              <p className="text-xs text-gray-400 mt-1">Рейтинг и отзывы</p>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
