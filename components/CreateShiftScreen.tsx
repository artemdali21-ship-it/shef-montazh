'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Briefcase, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { hapticLight, hapticSuccess, hapticError } from '@/lib/haptic';
import toast from 'react-hot-toast';

interface CreateShiftScreenProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function CreateShiftScreen({ onClose, onSuccess }: CreateShiftScreenProps) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    workers: 1,
    rate: 2500,
    description: '',
  });

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    try {
      hapticLight();
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Необходимо войти в систему');
        router.push('/auth/login');
        return;
      }

      // Validate form
      if (!formData.title || !formData.category || !formData.location || !formData.date || !formData.startTime || !formData.endTime) {
        hapticError();
        toast.error('Пожалуйста, заполните все обязательные поля');
        return;
      }

      // Verify user has a client profile (for RLS policy check)
      const { data: clientProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      console.log('Client profile fetch result:', { clientProfile, profileError, userId: user.id });

      if (profileError || !clientProfile) {
        console.error('Error fetching client profile:', profileError);
        hapticError();
        toast.error('Профиль клиента не найден. Зарегистрируйтесь как клиент.');
        return;
      }

      console.log('Creating shift with data:', {
        client_id: user.id,
        title: formData.title,
        category: formData.category,
        location_address: formData.location,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        workers_needed: formData.workers,
        price: formData.rate,
        description: formData.description,
        status: 'published'
      });

      // Create shift in database
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          client_id: user.id,
          title: formData.title,
          category: formData.category,
          location_address: formData.location,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          required_workers: formData.workers,
          pay_amount: formData.rate,
          description: formData.description,
          status: 'published'
        })
        .select()
        .single();

      console.log('Shift creation result:', { data, error });

      if (error) throw error;

      hapticSuccess();
      toast.success('Смена успешно создана!');

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/client/shifts');
      }
    } catch (error: any) {
      console.error('Error creating shift:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        fullError: JSON.stringify(error, null, 2)
      });
      hapticError();
      toast.error(error?.message || error?.details || 'Не удалось создать смену');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between px-5 z-50">
        <button
          onClick={() => {
            if (onClose) onClose();
            else router.back();
          }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} color="#FFFFFF" />
        </button>

        <h1 className="text-base font-bold text-white flex-1 text-center">
          Создать смену
        </h1>

        <div className="text-xs text-gray-500 w-10 text-right">
          {step} / 2
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-white/5 z-50">
        <div
          className="h-full bg-[#E85D2F] transition-all duration-300"
          style={{ width: `${(step / 2) * 100}%` }}
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 px-5">
        {step === 1 ? (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Название работы
              </label>
              <input
                type="text"
                placeholder="Например: Монтаж стенда"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#E85D2F] transition-colors"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Категория
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E85D2F] transition-colors"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Выберите категорию</option>
                <option value="mounting">Монтаж</option>
                <option value="repair">Ремонт</option>
                <option value="assembly">Сборка</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Место проведения
              </label>
              <input
                type="text"
                placeholder="Адрес или описание места"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#E85D2F] transition-colors"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Дата
              </label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E85D2F] transition-colors"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-2">
                  Начало
                </label>
                <input
                  type="time"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2.5 text-sm text-white focus:border-[#E85D2F] transition-colors"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white mb-2">
                  Конец
                </label>
                <input
                  type="time"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2.5 text-sm text-white focus:border-[#E85D2F] transition-colors"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Workers */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Количество рабочих
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFormData({ ...formData, workers: Math.max(1, formData.workers - 1) })}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-white w-12 text-center">
                  {formData.workers}
                </span>
                <button
                  onClick={() => setFormData({ ...formData, workers: formData.workers + 1 })}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rate */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Тариф за смену (₽)
              </label>
              <input
                type="number"
                min="500"
                step="100"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E85D2F] transition-colors"
                value={formData.rate}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, rate: isNaN(val) ? 0 : val });
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Описание работы
              </label>
              <textarea
                placeholder="Опишите задачу подробнее..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#E85D2F] transition-colors resize-none"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Total */}
            <div className="bg-white/5 border border-[#E85D2F]/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Итого к оплате:</span>
                <span className="text-2xl font-bold text-[#E85D2F]">
                  ₽{(formData.rate * formData.workers).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>

            {/* Legal agreement notice */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300">
              <p>
                Создавая смену, вы подтверждаете что ознакомлены с{' '}
                <Link href="/legal/offer" className="text-[#E85D2F] underline hover:no-underline">
                  договором оферты
                </Link>
                {' '}и{' '}
                <Link href="/legal/terms" className="text-[#E85D2F] underline hover:no-underline">
                  условиями использования
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CTA */}
      <div className="fixed bottom-24 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 p-5 z-50 rounded-t-2xl">
        <div className="flex gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Назад
            </button>
          )}
          <button
            onClick={step === 1 ? handleNext : handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#E85D2F] rounded-lg text-white font-semibold hover:bg-[#d94d1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-press"
          >
            {loading ? 'Создание...' : step === 1 ? 'Далее' : 'Создать смену'}
          </button>
        </div>
      </div>
    </div>
  );
}
