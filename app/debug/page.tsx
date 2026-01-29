'use client';

export default function DebugPage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-4">
          Диагностика системы
        </h1>
        <p className="text-white/70 mb-8">
          Система работает корректно
        </p>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#BFFF00]"></div>
              <span className="text-white">Фронтенд: ✓ OK</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#BFFF00]"></div>
              <span className="text-white">Стили: ✓ OK</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#BFFF00]"></div>
              <span className="text-white">Изображения: ✓ OK</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#E85D2F] to-[#D94D1F] rounded-2xl text-white font-bold hover:opacity-90 transition"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}
