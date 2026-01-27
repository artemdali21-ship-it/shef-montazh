'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface NavigationTest {
  name: string;
  path: string;
  status: 'working' | 'broken' | 'warning';
  description: string;
}

export default function NavigationTestPage() {
  const router = useRouter();
  const [tested, setTested] = useState<Set<string>>(new Set());

  const tests: NavigationTest[] = [
    // Основные переходы
    { name: 'Главная → Выбор роли', path: '/role-select', status: 'working', description: '/ → /role-select' },
    { name: 'Вход', path: '/login', status: 'working', description: '/role-select → /login' },
    { name: 'Регистрация', path: '/register', status: 'working', description: '/login → /register' },
    
    // Основные разделы
    { name: 'Лента смен', path: '/feed', status: 'working', description: 'После входа' },
    { name: 'Мои заявки', path: '/applications', status: 'working', description: 'Нижняя навигация' },
    { name: 'Профиль', path: '/profile', status: 'working', description: 'Нижняя навигация' },
    
    // Вспомогательные
    { name: 'Подтверждение заявки', path: '/application', status: 'working', description: 'Модальный экран' },
    { name: 'Активная смена', path: '/shift', status: 'working', description: 'Мониторинг смены' },
    { name: 'Рейтинг', path: '/rating', status: 'working', description: 'После завершения смены' },
    { name: 'Платежи', path: '/payment-details', status: 'working', description: 'Детали платежа' },
    
    // Настройки
    { name: 'Настройки', path: '/settings', status: 'working', description: 'Главное меню настроек' },
    { name: 'Редактирование профиля', path: '/settings/edit-profile', status: 'working', description: 'Из настроек' },
    { name: 'Безопасность', path: '/settings/security', status: 'working', description: 'Из настроек' },
    { name: 'Платежи (настройки)', path: '/settings/payment', status: 'working', description: 'Из настроек' },
    { name: 'Уведомления', path: '/settings/notifications', status: 'working', description: 'Из настроек' },
    
    // Проблемные маршруты
    { name: 'Забыли пароль', path: '/forgot-password', status: 'broken', description: '❌ Маршрут не создан' },
    { name: 'Уведомления (Header)', path: '/notifications', status: 'broken', description: '❌ Маршрут не создан' },
    { name: 'Деталь смены', path: '/job/1', status: 'working', description: 'Динамический маршрут' },
    
    // Dashboard
    { name: 'Шеф Дашборд', path: '/shef-dashboard', status: 'warning', description: '⚠️ Не связан с основной навигацией' },
    { name: 'Мониторинг', path: '/monitoring', status: 'warning', description: '⚠️ Существует но не доступен' },
    { name: 'Создать смену', path: '/create-shift', status: 'warning', description: '⚠️ Нет кнопки в интерфейсе' },
  ];

  const handleTest = (path: string) => {
    setTested(new Set(tested).add(path));
    router.push(path);
  };

  const workingCount = tests.filter(t => t.status === 'working').length;
  const brokenCount = tests.filter(t => t.status === 'broken').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;
  const successRate = Math.round((workingCount / tests.length) * 100);

  return (
    <div className="w-full min-h-screen overflow-y-auto bg-gradient-to-br from-[#A0A0A0] via-[#8B8B8B] to-[#7A7A7A] p-6 pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h1 className="text-4xl font-bold text-white mb-2">Тест навигации</h1>
          <p className="text-white/70">Проверка всех переходов между экранами</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto mb-8 grid grid-cols-4 gap-4">
        <div className="bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">{workingCount}</div>
          <div className="text-sm text-white/70">Работают</div>
        </div>
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-red-400">{brokenCount}</div>
          <div className="text-sm text-white/70">Сломаны</div>
        </div>
        <div className="bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
          <div className="text-sm text-white/70">Предупреждения</div>
        </div>
        <div className="bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">{successRate}%</div>
          <div className="text-sm text-white/70">Успех</div>
        </div>
      </div>

      {/* Tests List */}
      <div className="max-w-4xl mx-auto space-y-3">
        {tests.map((test) => (
          <button
            key={test.path}
            onClick={() => handleTest(test.path)}
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {test.status === 'working' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {test.status === 'broken' && <AlertCircle className="w-5 h-5 text-red-400" />}
                  {test.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  <h3 className="font-bold text-white">{test.name}</h3>
                </div>
                <p className="text-sm text-white/60 ml-8">{test.description}</p>
                <p className="text-xs text-white/40 ml-8 font-mono mt-1">{test.path}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Back Button */}
      <div className="max-w-4xl mx-auto mt-8 text-center pb-8">
        <button
          onClick={() => router.push('/debug')}
          className="inline-block px-8 py-4 bg-gradient-to-r from-[#E85D2F] to-[#FF7043] rounded-2xl font-bold text-white hover:shadow-lg transition-all"
        >
          Вернуться к диагностике
        </button>
      </div>
    </div>
  );
}
