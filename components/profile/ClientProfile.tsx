'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Clock,
  CheckCircle,
  Settings,
  Plus,
  ArrowRight,
  MessageCircle,
  Star,
} from 'lucide-react';
import { StarRating } from '../rating/StarRating';

interface ClientProfileProps {
  userId?: string;
  companyName?: string;
  companyId?: string;
  isPremium?: boolean;
}

interface ActiveShift {
  id: string;
  title: string;
  location: string;
  date: string;
  status: 'open' | 'in_progress';
  responsesCount: number;
  price: number;
}

interface CompletedShift {
  id: string;
  workerName: string;
  title: string;
  rating: number;
  date: string;
}

const mockStats = {
  totalPosted: 47,
  activeShifts: 3,
  completed: 44,
};

const mockActiveShifts: ActiveShift[] = [
  {
    id: '1',
    title: 'Монтаж выставочного стенда',
    location: 'Москва, Центр',
    date: '28 января, 18:00',
    status: 'open',
    responsesCount: 5,
    price: 2500,
  },
  {
    id: '2',
    title: 'Демонтаж конструкции',
    location: 'Санкт-Петербург',
    date: '29 января, 10:00',
    status: 'in_progress',
    responsesCount: 2,
    price: 3000,
  },
  {
    id: '3',
    title: 'Сборка декораций',
    location: 'Москва, ВДНХ',
    date: '30 января, 14:00',
    status: 'open',
    responsesCount: 8,
    price: 1800,
  },
];

const mockCompletedShifts: CompletedShift[] = [
  {
    id: '1',
    workerName: 'Иван Петров',
    title: 'Монтаж выставки',
    rating: 5,
    date: '24 января 2026',
  },
  {
    id: '2',
    workerName: 'Сергей Волков',
    title: 'Демонтаж конструкции',
    rating: 4.5,
    date: '22 января 2026',
  },
];

export default function ClientProfile({
  userId = 'CL-47821',
  companyName = 'ООО Экспо Сервис',
  companyId = 'SHEF-12345',
  isPremium = true,
}: ClientProfileProps) {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col">
      {/* HEADER SECTION */}
      <header
        className="relative pt-6 px-4 pb-8 text-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          zIndex: 10,
        }}
      >
        {/* Settings Icon */}
        <button className="absolute top-6 right-4 p-2 hover:bg-white/10 rounded-lg transition-all">
          <Settings size={24} className="text-white" />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto pt-24 pb-24">
        {/* STATS ROW */}
        <div className="px-4 py-6 grid grid-cols-3 gap-3">
        {/* Briefcase - Total Posted */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Briefcase size={24} className="text-[#E85D2F] mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{mockStats.totalPosted}</div>
          <div className="text-xs text-gray-400">Опубликовано</div>
        </div>

        {/* Clock - Active Shifts */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Clock size={24} className="text-[#BFFF00] mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{mockStats.activeShifts}</div>
          <div className="text-xs text-gray-400">Активных</div>
        </div>

        {/* CheckCircle - Completed */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{mockStats.completed}</div>
          <div className="text-xs text-gray-400">Завершено</div>
        </div>
      </div>

      {/* RATING SECTION */}
      <div className="px-4 py-6">
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'rgba(232, 93, 47, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(232, 93, 47, 0.3)',
          }}
        >
          <div className="text-4xl font-bold text-white mb-2">4.7</div>
          <p className="text-gray-300 text-sm mb-3">Средняя оценка от исполнителей</p>
          <p className="text-gray-500 text-xs mb-4">(23 отзыва)</p>
          <div className="flex justify-center">
            <StarRating rating={4.7} size="lg" showNumber={false} />
          </div>
        </div>
      </div>

      {/* ACTIVE SHIFTS SECTION */}
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Активные смены</h2>
          <button className="text-[#E85D2F] text-sm font-semibold flex items-center gap-1 hover:text-[#FF8855]">
            Все
            <ArrowRight size={16} />
          </button>
        </div>

        {mockActiveShifts.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Briefcase size={32} className="text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-3">Нет активных смен</p>
            <button className="text-[#E85D2F] font-semibold hover:text-[#FF8855]">
              Создать первую смену
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mockActiveShifts.map((shift) => (
              <button
                key={shift.id}
                onClick={() => router.push(`/job/${shift.id}`)}
                className="w-full text-left rounded-xl p-4 hover:bg-white/10 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold">{shift.title}</h3>
                  <span className="text-[#E85D2F] font-bold">{shift.price}₽</span>
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  📍 {shift.location} • {shift.date}
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background:
                        shift.status === 'open'
                          ? 'rgba(191, 255, 0, 0.2)'
                          : 'rgba(72, 187, 120, 0.2)',
                      color: shift.status === 'open' ? '#BFFF00' : '#48BB78',
                    }}
                  >
                    {shift.status === 'open' ? 'Открыта' : 'В работе'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Откликов: <span className="text-white font-semibold">{shift.responsesCount}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-4 py-6 space-y-3">
        <button
          onClick={() => router.push('/create-shift')}
          className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #E85D2F 0%, #C44A20 100%)',
          }}
        >
          <Plus size={20} />
          Создать смену
        </button>

        <button
          className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Star size={20} />
          Избранные исполнители
        </button>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-white mb-4">Последние завершённые</h2>

        {mockCompletedShifts.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <CheckCircle size={32} className="text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Ещё нет завершённых смен</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockCompletedShifts.map((shift) => (
              <div
                key={shift.id}
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{shift.workerName}</h3>
                    <p className="text-sm text-gray-400">{shift.title}</p>
                  </div>
                  <StarRating rating={shift.rating} size="sm" showNumber={true} />
                </div>
                <p className="text-xs text-gray-500">{shift.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { ClientProfile };
