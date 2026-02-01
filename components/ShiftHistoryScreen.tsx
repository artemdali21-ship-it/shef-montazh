'use client'

import { ArrowLeft, Calendar, Clock, MapPin, User, Building2, 
         CheckCircle, Star, Download, FileText, HelpCircle } from 'lucide-react';

export default function ShiftHistory() {
  return (
    <div className="min-h-screen bg-dashboard">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 bg-[#2A2A2A]/80 backdrop-blur-md border-b border-white/10">
        <button className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
        </button>
        <h1 className="text-white font-montserrat font-700 text-lg">История смены</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
        </button>
      </header>

      <main className="px-4 py-6 pb-24">
        {/* Shift Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <h2 className="font-700 text-lg mb-3">Монтаж выставочного стенда</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#9B9B9B]" strokeWidth={1.5} />
              <span className="text-sm text-[#9B9B9B]">Decor Factory</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#9B9B9B]" strokeWidth={1.5} />
              <span className="text-sm text-[#9B9B9B]">27 января 2026</span>
            </div>
          </div>
        </div>

        {/* Status Hero */}
        <div className="bg-gradient-to-br from-[#BFFF00]/20 to-[#BFFF00]/5 border-2 border-[#BFFF00]/30 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#BFFF00]/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#BFFF00]" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[#BFFF00] font-700 uppercase tracking-wide mb-1">
                СМЕНА ЗАВЕРШЕНА
              </div>
              <p className="text-sm text-[#9B9B9B]">Работы приняты шефом</p>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-[#9B9B9B]">Твоя ставка</span>
              <div className="text-right">
                <div className="text-2xl font-800 text-white">2,500 ₽</div>
                <div className="text-xs text-[#9B9B9B]">за 8-часовую смену</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Recommendations */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <h3 className="font-700 mb-3 flex items-center gap-2">
            <span>Рекомендации по оплате</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-[#BFFF00]/10 border border-[#BFFF00]/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#BFFF00] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-600 mb-1">Оплата через самозанятого (СЗ)</div>
                <p className="text-xs text-[#9B9B9B]">
                  Попросите чек у заказчика. Это легально и удобно для обеих сторон.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
              <FileText className="w-5 h-5 text-[#9B9B9B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-600 mb-1">Договор ГПХ</div>
                <p className="text-xs text-[#9B9B9B]">
                  Для крупных заказчиков возможно оформление договора
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <h3 className="font-700 mb-4">Хронология смены</h3>
          
          <div className="space-y-4">
            {/* Timeline items */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#BFFF00]/20 border-2 border-[#BFFF00] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                </div>
                <div className="w-0.5 h-full bg-[#BFFF00]/30 my-1"></div>
              </div>
              <div className="flex-1 pb-4">
                <div className="font-600 mb-1">Смена завершена</div>
                <div className="text-xs text-[#9B9B9B]">27 янв, 18:00</div>
                <p className="text-sm text-[#9B9B9B] mt-1">
                  Шеф-монтажник подтвердил выполнение всех работ
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#BFFF00]/20 border-2 border-[#BFFF00] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                </div>
                <div className="w-0.5 h-full bg-[#BFFF00]/30 my-1"></div>
              </div>
              <div className="flex-1 pb-4">
                <div className="font-600 mb-1">Ты вышел на объект</div>
                <div className="text-xs text-[#9B9B9B]">27 янв, 10:00</div>
                <p className="text-sm text-[#9B9B9B] mt-1">
                  Check-in подтвержден с фото и GPS
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#BFFF00]/20 border-2 border-[#BFFF00] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-600 mb-1">Заявка одобрена</div>
                <div className="text-xs text-[#9B9B9B]">26 янв, 15:30</div>
                <p className="text-sm text-[#9B9B9B] mt-1">
                  Заказчик выбрал тебя для смены
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-700 mb-3">Документы</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#9B9B9B]" />
                <span className="font-600">Акт выполненных работ</span>
              </div>
              <Download className="w-4 h-4 text-[#9B9B9B]" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
