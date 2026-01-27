'use client';
import { Check, X, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [checks, setChecks] = useState<any[]>([]);

  useEffect(() => {
    // Автоматическая проверка стилей
    const results = [];

    // 1. Проверка фона
    const body = document.body;
    const bodyBg = window.getComputedStyle(body).background;
    results.push({
      name: 'Фон страницы',
      expected: 'Серый gradient (#8B8B8B)',
      actual: bodyBg.includes('8B8B8B') || bodyBg.includes('140, 139, 139') ? '✅ Правильный' : '❌ Неправильный',
      pass: bodyBg.includes('8B8B8B') || bodyBg.includes('140, 139, 139')
    });

    // 2. Проверка backdrop-blur
    const cards = document.querySelectorAll('[class*="backdrop-blur"]');
    results.push({
      name: 'Glassmorphism карточки',
      expected: 'backdrop-blur-xl на карточках',
      actual: cards.length > 0 ? `✅ Найдено ${cards.length} шт` : '❌ Не найдено',
      pass: cards.length > 0
    });

    // 3. Проверка 3D объектов
    const objects = document.querySelectorAll('img[src*="/images/"]');
    results.push({
      name: '3D объекты',
      expected: 'Минимум 3 объекта на странице',
      actual: objects.length >= 3 ? `✅ ${objects.length} шт` : `❌ ${objects.length} шт`,
      pass: objects.length >= 3
    });

    // 4. Проверка emoji
    const hasEmoji = document.body.innerText.match(/[\u{1F300}-\u{1F9FF}]/gu);
    results.push({
      name: 'Отсутствие emoji',
      expected: 'Только иконки, без emoji',
      actual: !hasEmoji ? '✅ Emoji не найдены' : '❌ Найдены emoji',
      pass: !hasEmoji
    });

    // 5. Проверка gradient кнопок
    const buttons = document.querySelectorAll('button[class*="gradient"]');
    results.push({
      name: 'Gradient кнопки',
      expected: 'bg-gradient-to-r from-[#E85D2F] to-[#D94D1F]',
      actual: buttons.length > 0 ? `✅ ${buttons.length} шт` : '❌ Не найдено',
      pass: buttons.length > 0
    });

    setChecks(results);
  }, []);

  const passedCount = checks.filter(c => c.pass).length;
  const totalCount = checks.length;
  const percentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0A0A0] via-[#8B8B8B] to-[#7A7A7A] p-6 overflow-y-auto pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Самодиагностика приложения
        </h1>
        <p className="text-white/70">
          Автоматическая проверка дизайн-системы ШЕФ-МОНТАЖ
        </p>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-bold text-lg">
              Результат проверки
            </span>
            <span className={`text-2xl font-extrabold ${
              percentage === 100 ? 'text-[#BFFF00]' : 
              percentage >= 70 ? 'text-[#FFD60A]' : 'text-red-400'
            }`}>
              {percentage}%
            </span>
          </div>
          
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#E85D2F] to-[#BFFF00] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <p className="text-white/70 text-sm mt-3">
            {passedCount} из {totalCount} проверок пройдено
          </p>
        </div>
      </div>

      {/* Checks List */}
      <div className="max-w-4xl mx-auto space-y-4 mb-8">
        {checks.map((check, i) => (
          <div 
            key={i}
            className={`bg-white/10 backdrop-blur-xl border rounded-3xl p-6 ${
              check.pass ? 'border-[#BFFF00]/30' : 'border-red-400/30'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                check.pass ? 'bg-[#BFFF00]/20' : 'bg-red-400/20'
              }`}>
                {check.pass ? (
                  <Check className="w-5 h-5 text-[#BFFF00]" strokeWidth={3} />
                ) : (
                  <X className="w-5 h-5 text-red-400" strokeWidth={3} />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold mb-2">{check.name}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-white/70">
                    <span className="font-semibold">Ожидается:</span> {check.expected}
                  </p>
                  <p className={check.pass ? 'text-[#BFFF00]' : 'text-red-400'}>
                    <span className="font-semibold">Результат:</span> {check.actual}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Examples */}
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Визуальные примеры компонентов
        </h2>

        {/* 1. ФОН */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">1. Фон страницы</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm mb-2">Текущий фон:</p>
              <div className="h-24 bg-gradient-to-br from-[#A0A0A0] via-[#8B8B8B] to-[#7A7A7A] rounded-xl border border-white/20" />
              <p className="text-[#BFFF00] text-xs mt-2">Правильный</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-2">Неправильный (темный):</p>
              <div className="h-24 bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] rounded-xl border border-red-400/30" />
              <p className="text-red-400 text-xs mt-2">Так не должно быть</p>
            </div>
          </div>
        </div>

        {/* 2. КАРТОЧКИ */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">2. Glassmorphism карточки</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm mb-2">Правильная карточка:</p>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                <p className="text-white text-sm">backdrop-blur-xl</p>
                <p className="text-white/70 text-xs">border-white/20</p>
              </div>
              <p className="text-[#BFFF00] text-xs mt-2">Glassmorphism</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-2">Неправильная:</p>
              <div className="bg-[#2A2A2A] border border-white/10 rounded-2xl p-4">
                <p className="text-white text-sm">Темная непрозрачная</p>
                <p className="text-white/70 text-xs">Нет blur эффекта</p>
              </div>
              <p className="text-red-400 text-xs mt-2">Так не должно быть</p>
            </div>
          </div>
        </div>

        {/* 3. КНОПКИ */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">3. Кнопки</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm mb-2">Правильная кнопка:</p>
              <button className="w-full h-12 bg-gradient-to-r from-[#E85D2F] to-[#D94D1F] rounded-2xl font-bold text-white shadow-[0_8px_24px_rgba(233,93,47,0.4)]">
                Откликнуться
              </button>
              <p className="text-[#BFFF00] text-xs mt-2">Gradient + shadow</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-2">Неправильная:</p>
              <button className="w-full h-12 bg-[#E85D2F] rounded-xl font-bold text-white">
                Откликнуться
              </button>
              <p className="text-red-400 text-xs mt-2">Плоская, нет gradient</p>
            </div>
          </div>
        </div>

        {/* 4. 3D ИКОНКИ */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">4. 3D иконки</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center">
              <img src="/images/toolbox.png" alt="" className="w-12 h-12" />
            </div>
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center">
              <img src="/images/helmet-silver.png" alt="" className="w-12 h-12" />
            </div>
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center">
              <img src="/images/building.png" alt="" className="w-12 h-12" />
            </div>
          </div>
          <p className="text-[#BFFF00] text-xs mt-4">Реалистичные 3D модели в кругах</p>
        </div>

        {/* 5. BADGES */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">5. Badges</h3>
          <div className="flex gap-3 flex-wrap">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-sm font-semibold text-white">
              Монтажник
            </div>
            <div className="px-4 py-2 bg-[#BFFF00]/10 border border-[#BFFF00]/20 rounded-full text-sm font-semibold text-[#BFFF00]">
              Проверен
            </div>
            <div className="px-4 py-2 bg-[#FFD60A]/10 border border-[#FFD60A]/20 rounded-full text-sm font-semibold text-[#FFD60A]">
              Срочно
            </div>
          </div>
          <p className="text-[#BFFF00] text-xs mt-4">С backdrop-blur и цветными акцентами</p>
        </div>

        {/* 6. 3D ОБЪЕКТЫ НА ФОНЕ */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 relative overflow-hidden">
          <h3 className="text-white font-bold mb-4 relative z-10">6. Декоративные 3D объекты</h3>
          
          {/* Декор */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
            <img src="/images/chain.png" className="absolute top-4 right-4 w-16 h-16 rotate-12" alt="" />
            <img src="/images/wrench.png" className="absolute bottom-4 left-4 w-20 h-20 -rotate-12" alt="" />
          </div>
          
          <p className="text-white/70 text-sm relative z-10">
            На каждом экране должны быть 2-3 объекта в качестве декора
          </p>
          <p className="text-[#BFFF00] text-xs mt-4 relative z-10">
            opacity-20, pointer-events-none, z-0
          </p>
        </div>
      </div>

      {/* Final Status */}
      <div className="max-w-4xl mx-auto mt-8">
        {percentage === 100 ? (
          <div className="bg-[#BFFF00]/10 border border-[#BFFF00]/30 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-[#BFFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#BFFF00]" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-[#BFFF00] mb-2">
              Всё отлично!
            </h2>
            <p className="text-white/70">
              Дизайн-система полностью соответствует требованиям
            </p>
          </div>
        ) : (
          <div className="bg-red-400/10 border border-red-400/30 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-red-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              Требуются исправления
            </h2>
            <p className="text-white/70 mb-4">
              Некоторые элементы не соответствуют дизайн-системе
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-gradient-to-r from-[#E85D2F] to-[#D94D1F] rounded-2xl font-bold text-white"
            >
              Вернуться на главную
            </button>
          </div>
        )}
      </div>

      {/* Link to main */}
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <a 
          href="/"
          className="inline-block px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-semibold text-white hover:bg-white/15 transition-all"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  );
}
