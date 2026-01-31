'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  MessageCircle,
  Star,
} from 'lucide-react';
import { getClientActiveShifts, getClientCompletedShifts } from '@/lib/api/profiles';
import { supabase } from '@/lib/supabase';


export default function ClientProfile({
  userId: initialUserId = 'CL-47821',
  companyName: initialCompanyName = 'ООО Экспо Сервис',
  companyId: initialCompanyId = 'SHEF-12345',
  isPremium = true,
}: {
  userId?: string;
  companyName?: string;
  companyId?: string;
  isPremium?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeShifts, setActiveShifts] = useState<any[]>([]);
  const [completedShifts, setCompletedShifts] = useState<any[]>([]);
  const [userId, setUserId] = useState(initialUserId);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [companyId, setCompanyId] = useState(initialCompanyId);

  useEffect(() => {
    async function loadClientData() {
      try {
        setLoading(true);
        setError(null);

        // Get current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Try to get company name from user metadata or profiles table
          let userCompanyName = user.user_metadata?.company_name ||
                                user.user_metadata?.full_name ||
                                user.email?.split('@')[0] ||
                                'Компания';

          // Try to fetch from client_profiles table
          const { data: profileData } = await supabase
            .from('client_profiles')
            .select('company_name, company_id')
            .eq('user_id', user.id)
            .single();

          if (profileData?.company_name) {
            userCompanyName = profileData.company_name;
          }

          setUserId(user.id.slice(0, 8).toUpperCase());
          setCompanyName(userCompanyName);
          if (profileData?.company_id) {
            setCompanyId(profileData.company_id);
          }

          // Load shifts for this user
          const { data: activeData } = await getClientActiveShifts(user.id);
          const { data: completedData } = await getClientCompletedShifts(user.id);

          setActiveShifts(activeData || []);
          setCompletedShifts(completedData || []);
        } else {
          // Fallback to initial props if no user
          const { data: activeData } = await getClientActiveShifts(initialUserId);
          const { data: completedData } = await getClientCompletedShifts(initialUserId);

          setActiveShifts(activeData || []);
          setCompletedShifts(completedData || []);
        }

      } catch (err) {
        console.error('Error loading client profile:', err);
        setError('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    }

    loadClientData();
  }, [initialUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-lg">Загрузка профиля...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md">
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 transition"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const totalPosted = activeShifts.length + completedShifts.length;

  return (
    <div className="min-h-screen pb-24">
      <div className="w-full">
      {/* PROFILE INFO SECTION */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          margin: '16px',
          padding: '16px',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '4px', fontSize: '16px' }}>
            {companyName || 'ООО "Компания"'}
          </h2>
          <p style={{ color: '#FFFFFF', opacity: 0.7, fontSize: '12px' }}>
            ID: {companyId || 'CLIENT-001'}
          </p>
          <span style={{ color: '#BFFF00', fontSize: '11px', marginTop: '8px', display: 'inline-block' }}>
            {isPremium ? '✓ Проверен' : '○ Не проверен'}
          </span>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="px-4 py-6 grid grid-cols-3 gap-3">
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Briefcase size={24} className="text-[#E85D2F] mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{totalPosted}</div>
          <div className="text-xs text-gray-400">Опубликовано</div>
        </div>

        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Clock size={24} className="text-[#BFFF00] mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{activeShifts.length}</div>
          <div className="text-xs text-gray-400">Активных</div>
        </div>

        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CheckCircle size={24} className="text-[#4ADE80] mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{completedShifts.length}</div>
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
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}
              />
            ))}
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

        {activeShifts.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Clock size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Нет активных смен</p>
            <p className="text-gray-500 text-sm mt-2">
              Создайте новую смену, чтобы найти исполнителей
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeShifts.slice(0, 3).map((shift) => (
              <div
                key={shift.id}
                onClick={() => router.push(`/shift/${shift.id}`)}
                className="rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{shift.title}</h3>
                    <p className="text-gray-400 text-sm">{shift.location_address || 'Адрес не указан'}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shift.status === 'open'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {shift.status === 'open' ? 'Открыта' : 'В работе'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {shift.applications_count || 0} откликов
                    </span>
                  </div>
                  <span className="text-white font-bold">
                    {(shift.pay_amount || 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
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

        {completedShifts.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <CheckCircle size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Нет завершенных смен</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedShifts.slice(0, 2).map((shift) => (
              <div
                key={shift.id}
                onClick={() => router.push(`/shift/${shift.id}`)}
                className="rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{shift.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {shift.created_at ? new Date(shift.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : shift.date || 'Дата не указана'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-medium">5.0</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-sm text-gray-400">{shift.location_address || 'Адрес не указан'}</span>
                  <span className="text-white font-bold">
                    {(shift.pay_amount || 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
