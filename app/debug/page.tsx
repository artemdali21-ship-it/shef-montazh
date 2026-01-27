'use client';
import { useState, useEffect } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';

export default function DebugPage() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [imageResults, setImageResults] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const pages = [
    '/', '/role-select', '/register', '/login', '/verify-phone',
    '/feed', '/job/1', '/shift', '/application', '/applications',
    '/profile', '/profile-setup', '/rating', '/payment-details',
    '/dashboard', '/create-shift', '/monitoring', '/shef-dashboard',
    '/settings', '/settings/about', '/settings/edit-profile',
    '/settings/help', '/settings/location', '/settings/notifications',
    '/settings/payment', '/settings/security',
    '/legal/terms', '/legal/privacy', '/legal/offer'
  ];

  const images = [
    'toolbox.png', 'helmet-silver.png', 'building.png',
    'carabiner.png', 'wrench.png', 'tape-2.png',
    'bolts.png', 'chain.png', 'cable-coil.png',
    'helmets-3-hard-hats.png'
  ];

  // Проверка изображений
  const checkImages = async () => {
    const imgResults = [];
    for (const img of images) {
      const result = await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve({ name: img, loaded: true });
        image.onerror = () => resolve({ name: img, loaded: false });
        image.src = `/images/${img}`;
      });
      imgResults.push(result);
    }
    setImageResults(imgResults);
    return imgResults.filter((r: any) => r.loaded).length;
  };

  // Проверка страницы в iframe
  const checkPage = async (url: string) => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      iframe.onload = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) {
            resolve({ url, error: 'No access' });
            document.body.removeChild(iframe);
            return;
          }

          const body = doc.body;
          const html = doc.documentElement;
          const checks: any = {
            background: false,
            glassmorphism: false,
            gradient: false,
            objects: false,
            scroll: false,
            emoji: false,
            font: false,
            rounded: false
          };

          // Фон
          const bodyBg = window.getComputedStyle(body).background || '';
          const htmlBg = window.getComputedStyle(html).background || '';
          checks.background = bodyBg.includes('139') || htmlBg.includes('139') || bodyBg.includes('8B8B8B');

          // Glassmorphism
          checks.glassmorphism = doc.querySelectorAll('[class*="backdrop-blur"]').length > 0;

          // Gradient кнопки
          checks.gradient = doc.querySelectorAll('[class*="gradient"]').length > 0 || 
                           doc.querySelectorAll('[class*="from-"]').length > 0;

          // 3D объекты
          checks.objects = doc.querySelectorAll('img[src*="/images/"]').length >= 2;

          // Скролл
          checks.scroll = html.scrollHeight > html.clientHeight;

          // Emoji
          const bodyText = body.innerText || '';
          checks.emoji = !bodyText.match(/[\u{1F300}-\u{1F9FF}]/gu);

          // Font
          const bodyFont = window.getComputedStyle(body).fontFamily || '';
          checks.font = bodyFont.includes('Montserrat') || bodyFont.includes('sans-serif');

          // Rounded
          checks.rounded = doc.querySelectorAll('[class*="rounded-2xl"], [class*="rounded-3xl"]').length > 0;

          const score = Object.values(checks).filter(Boolean).length;
          const total = Object.values(checks).length;

          document.body.removeChild(iframe);
          resolve({ url, checks, score, total });
        } catch (e) {
          document.body.removeChild(iframe);
          resolve({ url, error: 'Access denied' });
        }
      };

      iframe.onerror = () => {
        document.body.removeChild(iframe);
        resolve({ url, error: 'Load failed' });
      };

      document.body.appendChild(iframe);
    });
  };

  // Запуск полной проверки
  const runFullCheck = async () => {
    setChecking(true);
    setResults([]);
    setCurrentPageIndex(0);
    
    // 1. Изображения
    const imgScore = await checkImages();
    
    // 2. Страницы
    const pageResults = [];
    for (let i = 0; i < pages.length; i++) {
      setCurrentPageIndex(i + 1);
      const result = await checkPage(pages[i]);
      pageResults.push(result);
      setResults([...pageResults]);
    }
    
    // 3. Считаем общий процент
    const totalChecks = pageResults.reduce((sum: number, r: any) => sum + (r.total || 0), 0) + images.length;
    const passedChecks = pageResults.reduce((sum: number, r: any) => sum + (r.score || 0), 0) + imgScore;
    const percent = Math.round((passedChecks / totalChecks) * 100);
    
    setTotalScore(percent);
    setChecking(false);
  };

  return (
    <div className="w-full h-screen overflow-y-auto bg-gradient-to-br from-[#A0A0A0] via-[#8B8B8B] to-[#7A7A7A] p-6">
      <div className="max-w-4xl mx-auto pb-32">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Полная проверка 360°
          </h1>
          <p className="text-white/70">
            Автоматическая проверка всех страниц, изображений и стилей
          </p>
        </div>

        {/* Прогресс */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-lg">Результат</span>
              <span className={`text-3xl font-extrabold ${
                totalScore === 100 ? 'text-[#BFFF00]' : 
                totalScore >= 80 ? 'text-[#FFD60A]' : 'text-red-400'
              }`}>
                {totalScore}%
              </span>
            </div>
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#E85D2F] to-[#BFFF00] transition-all duration-500"
                style={{ width: `${totalScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Кнопка запуска */}
        {!checking && results.length === 0 && (
          <div className="mb-8">
            <button
              onClick={runFullCheck}
              className="w-full h-16 bg-gradient-to-r from-[#E85D2F] to-[#D94D1F] rounded-2xl font-bold text-white text-lg shadow-[0_8px_24px_rgba(233,93,47,0.4)] hover:shadow-[0_12px_32px_rgba(233,93,47,0.5)] active:scale-[0.98] transition-all"
            >
              Запустить полную проверку
            </button>
          </div>
        )}

        {/* Процесс */}
        {checking && (
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white font-semibold text-lg mb-2">Проверяю...</p>
              <p className="text-white/70 text-sm">
                {currentPageIndex} из {pages.length} страниц проверено
              </p>
            </div>
          </div>
        )}

        {/* Результаты изображений */}
        {imageResults.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">🖼️ Изображения</h3>
              <div className="space-y-2">
                {imageResults.map((img: any, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {img.loaded ? (
                      <Check className="w-5 h-5 text-[#BFFF00]" strokeWidth={3} />
                    ) : (
                      <X className="w-5 h-5 text-red-400" strokeWidth={3} />
                    )}
                    <span className={img.loaded ? 'text-white/70' : 'text-red-400'}>
                      {img.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Результаты страниц */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xl mb-4">📄 Страницы</h3>
            {results.map((result: any, i) => {
              const percent = result.total ? Math.round((result.score / result.total) * 100) : 0;
              return (
                <div 
                  key={i}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">{result.url}</span>
                    <span className={`text-lg font-bold ${
                      percent === 100 ? 'text-[#BFFF00]' : 
                      percent >= 75 ? 'text-[#FFD60A]' : 'text-red-400'
                    }`}>
                      {percent}%
                    </span>
                  </div>
                  {result.error && (
                    <p className="text-red-400 text-sm">❌ {result.error}</p>
                  )}
                  {result.checks && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(result.checks).map(([key, val]: any) => (
                        <div key={key} className="flex items-center gap-2">
                          {val ? (
                            <Check className="w-4 h-4 text-[#BFFF00]" strokeWidth={3} />
                          ) : (
                            <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                          )}
                          <span className="text-white/70 capitalize">{key}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Итог */}
        {!checking && results.length > 0 && (
          <div className="mt-8">
            {totalScore === 100 ? (
              <div className="bg-[#BFFF00]/10 border border-[#BFFF00]/30 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-[#BFFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#BFFF00]" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-[#BFFF00] mb-2">
                  Всё отлично!
                </h2>
                <p className="text-white/70">Все проверки пройдены!</p>
              </div>
            ) : (
              <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/30 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-[#FFD60A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-[#FFD60A]" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-[#FFD60A] mb-2">
                  Требуются исправления
                </h2>
                <p className="text-white/70 mb-4">Проверь результаты выше</p>
                <button
                  onClick={runFullCheck}
                  className="px-6 py-3 bg-gradient-to-r from-[#E85D2F] to-[#D94D1F] rounded-2xl font-bold text-white inline-block"
                >
                  Проверить снова
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-white font-semibold transition-all"
          >
            Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
}
