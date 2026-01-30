'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Settings, CheckCircle, Circle, User, Briefcase, Star, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  rating: number;
  stats: {
    shiftsCompleted: number;
    rating: number;
    reliability: number;
  };
  skills: Array<{ name: string; level: string }>;
  recentShifts: Array<{ id: number; title: string; date: string; price: number; status: string }>;
}

export default function WorkerProfile() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [isGosuslugiVerified, setIsGosuslugiVerified] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'SHF-0001',
    name: 'Загрузка...',
    rating: 4.9,
    stats: {
      shiftsCompleted: 127,
      rating: 4.9,
      reliability: 98,
    },
    skills: [
      { name: 'Сварка', level: 'advanced' },
      { name: 'Электрика', level: 'intermediate' },
      { name: 'Слесарь', level: 'advanced' },
      { name: 'Кровельщик', level: 'intermediate' },
      { name: 'Маляр', level: 'beginner' },
      { name: 'Монтаж', level: 'advanced' },
    ],
    recentShifts: [
      { id: 1, title: 'Демонтаж дверей', date: '25 января', price: 2500, status: 'completed' },
      { id: 2, title: 'Установка окон', date: '24 января', price: 3500, status: 'completed' },
      { id: 3, title: 'Электромонтажные работы', date: '22 января', price: 4000, status: 'completed' },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        // Get current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Try to get full_name from user metadata or profiles table
          let userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Пользователь';

          // Try to fetch from worker_profiles table
          const { data: profileData } = await supabase
            .from('worker_profiles')
            .select('full_name, rating')
            .eq('user_id', user.id)
            .single();

          if (profileData?.full_name) {
            userName = profileData.full_name;
          }

          setUserProfile(prev => ({
            ...prev,
            id: user.id.slice(0, 8).toUpperCase(),
            name: userName,
            rating: profileData?.rating || 4.9,
          }));
        } else {
          // Fallback to mock data if no user
          setUserProfile(prev => ({
            ...prev,
            name: 'Иван Петров'
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile(prev => ({
          ...prev,
          name: 'Иван Петров'
        }));
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  const toggleSkill = (skillName) => {
    const newSkills = new Set(selectedSkills);
    if (newSkills.has(skillName)) {
      newSkills.delete(skillName);
    } else {
      newSkills.add(skillName);
    }
    setSelectedSkills(newSkills);
  };

  const availableSkills = [
    'Монтаж',
    'Декоратор',
    'Альпинист',
    'Электрик',
    'Сварщик',
    'Бутафор',
    'Разнорабочий'
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'black',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          WebkitOverflowScrolling: 'touch',
        }}
      >
      {/* Profile Header */}
      <div className="p-5 text-center relative bg-cover bg-center border border-white/10" style={{ backgroundImage: 'url(/images/bg-main-splash.jpg)' }}>
        <div className="absolute inset-0 bg-black/20 z-0" />
        
        <div className="relative z-10">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mx-auto mb-4">
            <User size={48} color="white" strokeWidth={2} />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-lime-300 border-4 border-white flex items-center justify-center">
              <CheckCircle size={18} color="black" strokeWidth={2.5} />
            </div>
          </div>

          {/* User Info */}
          <h2 className="text-2xl font-bold text-white mb-1">{userProfile.name}</h2>
          <p className="text-sm text-white/70">ID: {userProfile.id}</p>

          {/* Stats */}
          <div className="flex gap-6 justify-center mt-5">
            <div className="flex flex-col items-center gap-1">
              <Briefcase size={20} color="#E85D2F" />
              <span className="text-xl font-bold text-white">127</span>
              <span className="text-xs text-white/70">Смен</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Star size={20} color="#E85D2F" />
              <span className="text-xl font-bold text-white">4.9</span>
              <span className="text-xs text-white/70">Рейтинг</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield size={20} color="#E85D2F" />
              <span className="text-xl font-bold text-white">98%</span>
              <span className="text-xs text-white/70">Надёжность</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="p-5">
        <h3 className="text-base font-bold text-white mb-4">Компетенции</h3>
        <div className="flex flex-wrap gap-2">
          {userProfile.skills.map((skill, idx) => {
            const isSelected = selectedSkills.has(skill.name);
            return (
              <button
                key={idx}
                onClick={() => toggleSkill(skill.name)}
                className={`inline-flex gap-1.5 items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-lime-300/25 border border-lime-300 text-lime-300'
                    : 'bg-white/5 border border-white/15 text-white hover:bg-white/10'
                }`}
              >
                {isSelected ? (
                  <CheckCircle size={14} strokeWidth={2.5} color="#BFFF00" />
                ) : (
                  <Circle size={14} strokeWidth={2} />
                )}
                <span>{skill.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Shifts Section */}
      <div className="px-5 pb-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-white">Последние смены</h3>
          <button className="text-sm font-semibold text-orange-500 hover:text-orange-400">
            Все смены →
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {userProfile.recentShifts.map((shift) => (
            <div
              key={shift.id}
              className="p-3 rounded-lg bg-neutral-900/40 border border-white/8 flex justify-between items-center"
            >
              <div className="text-left">
                <div className="text-sm font-semibold text-white">{shift.title}</div>
                <div className="text-xs text-white/60">{shift.date}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-orange-500">₽{shift.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
