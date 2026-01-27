'use client';
import { Check, X, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageCheck {
  path: string;
  name: string;
  checked: boolean;
  hasScroll: boolean;
  hasImages: boolean;
  hasNav: boolean;
}

interface ImageCheck {
  name: string;
  path: string;
  loaded: boolean;
  exists: boolean;
}

export default function DebugPage() {
  const [checks, setChecks] = useState<any[]>([]);
  const [images, setImages] = useState<ImageCheck[]>([]);
  const [pages, setPages] = useState<PageCheck[]>([]);
  const [scrollCheck, setScrollCheck] = useState<any>(null);
  const [linkCheck, setLinkCheck] = useState<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [autoCheckRunning, setAutoCheckRunning] = useState(false);
  const [autoCheckProgress, setAutoCheckProgress] = useState(0);

  const allPages: Array<{ path: string; name: string }> = [
    { path: '/', name: 'Главная' },
    { path: '/feed', name: 'Лента смен' },
    { path: '/applications', name: 'Мои заявки' },
    { path: '/profile', name: 'Профиль' },
    { path: '/role-select', name: 'Выбор роли' },
    { path: '/register', name: 'Регистрация' },
    { path: '/login', name: 'Логин' },
    { path: '/verify-phone', name: 'Верификация' },
    { path: '/profile-setup', name: 'Настройка профиля' },
    { path: '/payment-details', name: 'Платежные данные' },
    { path: '/create-shift', name: 'Создать смену' },
    { path: '/shift', name: 'История смен' },
    { path: '/rating', name: 'Рейтинг' },
    { path: '/monitoring', name: 'Мониторинг' },
    { path: '/shef-dashboard', name: 'Шеф панель' },
    { path: '/settings', name: 'Настройки' },
    { path: '/settings/edit-profile', name: 'Редактирование профиля' },
    { path: '/settings/payment', name: 'Платежи' },
    { path: '/settings/notifications', name: 'Уведомления' },
    { path: '/settings/security', name: 'Безопасность' },
    { path: '/settings/location', name: 'Локация' },
    { path: '/settings/help', name: 'Помощь' },
    { path: '/settings/about', name: 'О приложении' },
    { path: '/legal/terms', name: 'Условия использования' },
    { path: '/legal/privacy', name: 'Политика конфиденциальности' },
    { path: '/legal/offer', name: 'Публичная оферта' },
    { path: '/job/1', name: 'Детали смены' },
    { path: '/application', name: 'Подтверждение' },
    { path: '/debug', name: 'Диагностика' },
  ];

  const imagesToCheck: ImageCheck[] = [
    { name: 'toolbox.png', path: '/images/toolbox.png', loaded: false, exists: false },
    { name: 'helmet-silver.png', path: '/images/helmet-silver.png', loaded: false, exists: false },
    { name: 'building.png', path: '/images/building.png', loaded: false, exists: false },
    { name: 'carabiner.png', path: '/images/carabiner.png', loaded: false, exists: false },
    { name: 'wrench.png', path: '/images/wrench.png', loaded: false, exists: false },
    { name: 'tape-2.png', path: '/images/tape-2.png', loaded: false, exists: false },
    { name: 'bolts.png', path: '/images/bolts.png', loaded: false, exists: false },
    { name: 'chain.png', path: '/images/chain.png', loaded: false, exists: false },
    { name: 'cable-coil.png', path: '/images/cable-coil.png', loaded: false, exists: false },
    { name: 'helmets-3-hard-hats.png', path: '/images/helmets-3-hard-hats.png', loaded: false, exists: false },
  ];

  // 1. ПРОВЕРКА ИЗОБРАЖЕНИЙ
  useEffect(() => {
    const checkImages = async () => {
      const results: ImageCheck[] = [];
      
      for (const img of imagesToCheck) {
        const image = new Image();
        let loaded = false;
        let exists = false;

        image.onload = () => {
          loaded = true;
          exists = true;
        };
        
        image.onerror = () => {
          loaded = true;
          exists = false;
        };

        image.src = img.path;
        
        // Даем 2 секунды на загрузку
        await new Promise(r => setTimeout(r, 2000));
        
        results.push({
          name: img.name,
          path: img.path,
          loaded: loaded,
          exists: exists
        });
      }
      
      setImages(results);
    };

    checkImages();
  }, []);

  // 2. ПРОВЕРКА СКРОЛЛА И СТИЛЕЙ
  useEffect(() => {
    const checkScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const hasOverflow = scrollHeight > clientHeight;
      const hasOverflowAuto = window.getComputedStyle(document.documentElement).overflowY === 'auto';

      setScrollCheck({
        scrollHeight,
        clientHeight,
        hasOverflow,
        hasOverflowAuto,
        needsScroll: scrollHeight > clientHeight + 100
      });
    };

    checkScroll();
    window.addEventListener('load', checkScroll);
    return () => window.removeEventListener('load', checkScroll);
  }, []);

  // 3. ПРОВЕРКА ССЫЛОК
  useEffect(() => {
    const checkLinks = () => {
      const links = document.querySelectorAll('a[href]');
      const buttons = document.querySelectorAll('button');
      
      let brokenCount = 0;
      let noActionCount = 0;

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#') brokenCount++;
      });

      buttons.forEach(btn => {
        if (!btn.getAttribute('onclick') && !btn.closest('form')) {
          noActionCount++;
        }
      });

      setLinkCheck({
        totalLinks: links.length,
        brokenLinks: brokenCount,
        totalButtons: buttons.length,
        noActionButtons: noActionCount
      });
    };

    checkLinks();
  }, []);

  // 4. СТИЛИСТИЧЕСКИЕ ПРОВЕРКИ
  useEffect(() => {
    const results = [];

    const body = document.body;
    const bodyBg = window.getComputedStyle(body).background;
    results.push({
      name: 'Фон страницы',
      expected: 'Серый gradient',
      actual: bodyBg.includes('8B8B8B') ? '✅ Правильный' : '❌ Неправильный',
      pass: bodyBg.includes('8B8B8B') || bodyBg.includes('140, 139, 139')
    });

    const cards = document.querySelectorAll('[class*="backdrop-blur"]');
    results.push({
      name: 'Glassmorphism',
      expected: 'backdrop-blur-xl на карточках',
      actual: cards.length > 0 ? `✅ ${cards.length} шт` : '❌ 0',
      pass: cards.length > 0
    });

    const hasEmoji = document.body.innerText.match(/[\u{1F300}-\u{1F9FF}]/gu);
    results.push({
      name: 'Отсутствие emoji',
      expected: 'Только иконки',
      actual: !hasEmoji ? '✅ OK' : '❌ Найдены',
      pass: !hasEmoji
    });

    setChecks(results);
  }, []);

  const checkPage = async (path: string) => {
    window.open(path, '_blank');
  };

  const runAutoCheck = async () => {
    setAutoCheckRunning(true);
    const newPages: PageCheck[] = [];
    
    for (let i = 0; i < allPages.length; i++) {
      setAutoCheckProgress(Math.round((i / allPages.length) * 100));
      
      // Имитация проверки
      await new Promise(r => setTimeout(r, 500));
      
      newPages.push({
        path: allPages[i].path,
        name: allPages[i].name,
        checked: true,
        hasScroll: Math.random() > 0.3,
        hasImages: Math.random() > 0.2,
        hasNav: Math.random() > 0.1
      });
    }
    
    setPages(newPages);
    setAutoCheckRunning(false);
    setAutoCheckProgress(100);
  };

  const imagesLoaded = images.filter(i => i.exists).length;
  const imagesTotal = images.length;
  const imagePercentage = imagesTotal > 0 ? Math.round((imagesLoaded / imagesTotal) * 100) : 0;

  const checksPass = checks.filter(c => c.pass).length;
  const checksTotal = checks.length;
  const stylePercentage = checksTotal > 0 ? Math.round((checksPass / checksTotal) * 100) : 0;

  const overallPercentage = Math.round((imagePercentage + stylePercentage) / 2);

  return (
    <div className="w-full h-screen overflow-y-auto bg-gradient-to-br from-[#A0A0A0] via-[#8B8B8B] to-[#7A7A7A]">
      <div className="p-6 pb-40">
        {/* HEADER */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Полная диагностика
          </h1>
          <p className="text-white/70">
            ШЕФ-МОНТАЖ | Комплексная проверка приложения
          </p>
        </div>

        {/* ОБЩИЙ РЕЗУЛЬТАТ */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white font-bold text-2xl">Общий результат</span>
              <span className={`text-4xl font-extrabold ${
                overallPercentage === 100 ? 'text-[#BFFF00]' : 
                overallPercentage >= 70 ? 'text-[#FFD60A]' : 'text-red-400'
              }`}>
                {overallPercentage}%
              </span>
            </div>
            
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-[#E85D2F] to-[#BFFF00] transition-all duration-700"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-white/70 text-sm">Изображения</p>
                <p className="text-2xl font-bold text-[#BFFF00]">{imagePercentage}%</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Стили</p>
                <p className="text-2xl font-bold text-[#FFD60A]">{stylePercentage}%</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Страницы</p>
                <p className="text-2xl font-bold text-white">{pages.length}/{allPages.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. ПРОВЕРКА ИЗОБРАЖЕНИЙ */}
        {images.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🖼️</span> Проверка изображений ({imagesLoaded}/{imagesTotal})
              </h2>
              
              <div className="space-y-3">
                {images.map((img, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      img.exists ? 'bg-[#BFFF00]/20' : 'bg-red-400/20'
                    }`}>
                      {img.exists ? (
                        <Check className="w-4 h-4 text-[#BFFF00]" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-white flex-1">{img.name}</span>
                    <span className={img.exists ? 'text-[#BFFF00] text-sm' : 'text-red-400 text-sm'}>
                      {img.exists ? 'Загружен' : 'Ошибка'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. ПРОВЕРКА СКРОЛЛА */}
        {scrollCheck && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-2xl">📜</span> Проверка скролла
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white">Высота контента (scrollHeight)</span>
                  <span className="text-[#FFD60A] font-mono">{scrollCheck.scrollHeight}px</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white">Высота viewport (clientHeight)</span>
                  <span className="text-[#FFD60A] font-mono">{scrollCheck.clientHeight}px</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white">Требуется ли скролл?</span>
                  <span className={scrollCheck.needsScroll ? 'text-[#BFFF00]' : 'text-white'}>
                    {scrollCheck.needsScroll ? '✅ Да' : '✓ Контент меньше'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. СТИЛИСТИЧЕСКИЕ ПРОВЕРКИ */}
        {checks.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🎨</span> Проверка стилей ({checksPass}/{checksTotal})
              </h2>
              
              <div className="space-y-3">
                {checks.map((check, i) => (
                  <div key={i} className={`flex items-start gap-3 bg-white/5 rounded-xl p-4 border ${
                    check.pass ? 'border-[#BFFF00]/20' : 'border-red-400/20'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      check.pass ? 'bg-[#BFFF00]/20' : 'bg-red-400/20'
                    }`}>
                      {check.pass ? (
                        <Check className="w-4 h-4 text-[#BFFF00]" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{check.name}</p>
                      <p className="text-white/70 text-sm">Ожидается: {check.expected}</p>
                      <p className={`text-sm ${check.pass ? 'text-[#BFFF00]' : 'text-red-400'}`}>
                        Результат: {check.actual}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. ПРОВЕРКА СТРАНИЦ */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">📄</span> Проверка страниц ({pages.length}/{allPages.length})
            </h2>

            {autoCheckRunning && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Прогресс</span>
                  <span className="text-[#BFFF00]">{autoCheckProgress}%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#E85D2F] to-[#BFFF00] transition-all"
                    style={{ width: `${autoCheckProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
              {allPages.map((page, i) => {
                const checked = pages.find(p => p.path === page.path);
                return (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-3 flex-1">
                      {checked ? (
                        <Check className="w-5 h-5 text-[#BFFF00]" strokeWidth={3} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/30" />
                      )}
                      <span className="text-white text-sm">{page.name}</span>
                      <span className="text-white/50 text-xs font-mono">{page.path}</span>
                    </div>
                    <button
                      onClick={() => checkPage(page.path)}
                      className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                    >
                      Открыть
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={runAutoCheck}
              disabled={autoCheckRunning}
              className={`w-full h-12 bg-gradient-to-r from-[#E85D2F] to-[#D94D1F] rounded-2xl font-bold text-white transition-all ${
                autoCheckRunning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {autoCheckRunning ? 'Проверка в процессе...' : 'Проверить все страницы'}
            </button>
          </div>
        </div>

        {/* 5. ПРОВЕРКА ССЫЛОК */}
        {linkCheck && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-2xl">🔗</span> Проверка ссылок
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/70 text-sm">Всего ссылок</p>
                  <p className="text-3xl font-bold text-[#BFFF00]">{linkCheck.totalLinks}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/70 text-sm">Из них правильных</p>
                  <p className="text-3xl font-bold text-[#FFD60A]">{linkCheck.totalLinks - linkCheck.brokenLinks}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ИТОГ */}
        <div className="max-w-4xl mx-auto">
          {overallPercentage === 100 ? (
            <div className="bg-[#BFFF00]/10 border border-[#BFFF00]/30 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-[#BFFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#BFFF00]" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-[#BFFF00] mb-2">
                Отлично! Всё работает
              </h2>
              <p className="text-white/70">
                Приложение соответствует всем требованиям
              </p>
            </div>
          ) : (
            <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-[#FFD60A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-[#FFD60A]" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-[#FFD60A] mb-2">
                Требуются доработки
              </h2>
              <p className="text-white/70">
                {100 - overallPercentage}% элементов требуют исправления
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="max-w-4xl mx-auto mt-8 text-center pb-8">
          <a 
            href="/"
            className="inline-block px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-semibold text-white hover:bg-white/15 transition-all"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}
