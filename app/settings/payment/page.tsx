'use client';
import { useState } from 'react';
import { ArrowLeft, CreditCard, Plus, Check, AlertCircle, ExternalLink,
         Building2, User, Smartphone, Trash2, Edit2, Shield, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NoisePattern } from '@/components/noise-pattern';

export default function PaymentMethods() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'receiving' | 'history'>('receiving');
  
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'selfemployed',
      name: 'Самозанятый',
      inn: '123456789012',
      verified: true,
      primary: true
    },
    {
      id: '2',
      type: 'card',
      name: 'Сбербанк',
      number: '•••• 4242',
      verified: true,
      primary: false
    }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: '1',
      date: '2026-01-25',
      amount: 12500,
      from: 'Decor Factory',
      status: 'completed',
      method: 'Самозанятый'
    },
    {
      id: '2',
      date: '2026-01-20',
      amount: 8000,
      from: 'Event Masters',
      status: 'completed',
      method: 'Карта Сбербанк'
    },
    {
      id: '3',
      date: '2026-01-18',
      amount: 15000,
      from: 'Art Decor',
      status: 'pending',
      method: 'Самозанятый'
    }
  ]);

  const selfEmployedGuide = [
    'Зарегистрируйтесь в приложении "Мой налог"',
    'Привяжите ИНН в вашем профиле',
    'Выдавайте чеки после каждой смены',
    'Налог 4-6% автоматически'
  ];

  const handleAddMethod = (type: string) => {
    router.push(`/settings/payment/add?type=${type}`);
  };

  const handleSetPrimary = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(m => ({ ...m, primary: m.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <NoisePattern />

      <header style={{
        position: 'relative',
        background: 'rgba(42, 42, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 20,
        flexShrink: 0,
      }}>
        <div className="h-16 flex items-center justify-between px-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-montserrat font-700 text-xl">Способы оплаты</h1>
          <div className="w-10"></div>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('receiving')}
            className={`flex-1 h-12 font-montserrat font-700 text-sm transition-all relative ${
              activeTab === 'receiving' ? 'text-white' : 'text-white/50'
            }`}
          >
            Получение оплаты
            {activeTab === 'receiving' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E85D2F]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 h-12 font-montserrat font-700 text-sm transition-all relative ${
              activeTab === 'history' ? 'text-white' : 'text-white/50'
            }`}
          >
            История выплат
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E85D2F]"></div>
            )}
          </button>
        </div>
      </header>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 10,
      }} className="px-4 py-6">
        <div>
          {activeTab === 'receiving' ? (
            <div className="space-y-6 max-w-4xl mx-auto pb-24">
              <div className="bg-gradient-to-r from-[#BFFF00]/10 to-[#BFFF00]/5 border border-[#BFFF00]/30 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#BFFF00] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-montserrat font-700 text-white">Самозанятый (СЗ)</h3>
                      <span className="px-2 py-0.5 bg-[#BFFF00] text-black rounded text-[10px] font-montserrat font-800 uppercase">
                        Рекомендуем
                      </span>
                    </div>
                    <p className="text-sm text-white font-montserrat font-500">
                      Самый удобный способ для монтажников
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {selfEmployedGuide.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-[#BFFF00]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-montserrat font-700 text-[#BFFF00]">{index + 1}</span>
                      </div>
                      <p className="text-sm text-white font-montserrat font-500">{step}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddMethod('selfemployed')}
                  className="w-full h-12 bg-[#BFFF00] hover:bg-[#AAEE00] text-black rounded-lg font-montserrat font-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Добавить статус СЗ
                </button>
              </div>

              {paymentMethods.length > 0 && (
                <div>
                  <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
                    Добавленные способы
                  </h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`bg-white/5 border rounded-xl p-4 ${
                          method.primary ? 'border-[#E85D2F]' : 'border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                              {method.type === 'selfemployed' ? (
                                <User className="w-6 h-6 text-[#BFFF00]" />
                              ) : method.type === 'card' ? (
                                <CreditCard className="w-6 h-6 text-[#E85D2F]" />
                              ) : (
                                <Building2 className="w-6 h-6 text-[#FFD60A]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-montserrat font-700 text-white">{method.name}</h4>
                                {method.verified && (
                                  <div className="flex items-center gap-1">
                                    <Check className="w-3 h-3 text-[#BFFF00]" />
                                    <span className="text-[10px] text-[#BFFF00] font-montserrat font-700">Подтверждено</span>
                                  </div>
                                )}
                                {method.primary && (
                                  <span className="px-2 py-0.5 bg-[#E85D2F] rounded text-[10px] font-montserrat font-700 text-white uppercase">
                                    Основной
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-white font-montserrat font-500">
                                {method.type === 'selfemployed' 
                                  ? `ИНН: ${method.inn}`
                                  : method.type === 'card'
                                  ? `Карта: ${method.number}`
                                  : 'ИП / ООО'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!method.primary && (
                            <button
                              onClick={() => handleSetPrimary(method.id)}
                              className="flex-1 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-montserrat font-600 text-white text-sm transition-colors"
                            >
                              Сделать основным
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/settings/payment/edit/${method.id}`)}
                            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-[#9B9B9B]" />
                          </button>
                          {!method.primary && (
                            <button
                              onClick={() => handleDelete(method.id)}
                              className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
                  Добавить способ
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddMethod('card')}
                    className="w-full bg-white/5 border border-white/10 hover:border-[#E85D2F]/50 rounded-xl p-4 flex items-center gap-3 transition-all"
                  >
                    <div className="w-10 h-10 bg-[#E85D2F]/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#E85D2F]" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-montserrat font-700 text-white mb-0.5">Банковская карта</h4>
                      <p className="text-xs text-white font-montserrat font-500">Для переводов P2P</p>
                    </div>
                    <Plus className="w-5 h-5 text-[#6B6B6B]" />
                  </button>

                  <button
                    onClick={() => handleAddMethod('company')}
                    className="w-full bg-white/5 border border-white/10 hover:border-[#E85D2F]/50 rounded-xl p-4 flex items-center gap-3 transition-all"
                  >
                    <div className="w-10 h-10 bg-[#FFD60A]/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#FFD60A]" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-montserrat font-700 text-white mb-0.5">Реквизиты ИП/ООО</h4>
                      <p className="text-xs text-white font-montserrat font-500">Для договоров подряда</p>
                    </div>
                    <Plus className="w-5 h-5 text-[#6B6B6B]" />
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-[#BFFF00] flex-shrink-0" />
                  <div>
                    <h4 className="font-montserrat font-700 text-white mb-1 text-sm">
                      Ваши данные защищены
                    </h4>
                    <p className="text-xs text-white font-montserrat font-500 leading-relaxed">
                      Мы используем банковское шифрование. Данные карт не хранятся на наших серверах.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-w-4xl mx-auto pb-24">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-montserrat font-800 text-white mb-1">35.5K</p>
                  <p className="text-xs text-white font-montserrat font-500">За месяц</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-montserrat font-800 text-white mb-1">12</p>
                  <p className="text-xs text-white font-montserrat font-500">Выплат</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-montserrat font-800 text-[#BFFF00] mb-1">2.5K</p>
                  <p className="text-xs text-white font-montserrat font-500">Средний чек</p>
                </div>
              </div>

              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-montserrat font-700 text-white mb-1">
                        {payment.from}
                      </h4>
                      <p className="text-xs text-white font-montserrat font-500">
                        {payment.method} • {new Date(payment.date).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-montserrat font-800 text-xl text-white mb-1">
                        {payment.amount.toLocaleString('ru-RU')} ₽
                      </p>
                      <span className={`text-xs font-montserrat font-700 ${
                        payment.status === 'completed' 
                          ? 'text-[#BFFF00]' 
                          : payment.status === 'pending'
                          ? 'text-[#FFD60A]'
                          : 'text-red-500'
                      }`}>
                        {payment.status === 'completed' 
                          ? 'Получено' 
                          : payment.status === 'pending'
                          ? 'В обработке'
                          : 'Отменено'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <button className="text-xs text-[#E85D2F] font-montserrat font-700 flex items-center gap-1">
                      Детали
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {payment.status === 'completed' && (
                      <button className="text-xs text-white font-montserrat font-700 flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        Чек
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-montserrat font-700 text-white transition-colors">
                Показать еще
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
