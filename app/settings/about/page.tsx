'use client'
import { useState } from 'react';
import { ArrowLeft, ExternalLink, FileText, Shield, Info, 
         Heart, Users, Award, TrendingUp, HandshakeIcon, Zap, DollarSign, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NoisePattern } from '@/components/noise-pattern';

export default function About() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'about' | 'terms'>('about');

  const stats = [
    { icon: Users, value: '1,200+', label: 'Монтажников' },
    { icon: Award, value: '150+', label: 'Агентств' },
    { icon: TrendingUp, value: '5,000+', label: 'Смен выполнено' }
  ];

  const team = [
    { name: 'Артём Полищук', role: 'Founder & CEO', icon: 'AP', color: '#E85D2F' },
    { name: 'Никита Галюзов', role: 'Co-Founder', icon: 'НГ', color: '#BFFF00' },
    { name: 'Команда разработки', role: 'Development Team', icon: 'Code', useIcon: true, color: '#E85D2F' }
  ];

  const legalDocs = [
    {
      icon: FileText,
      title: 'Пользовательское соглашение',
      description: 'Условия использования платформы',
      link: '/legal/terms',
      updated: '15 января 2026'
    },
    {
      icon: Shield,
      title: 'Политика конфиденциальности',
      description: 'Как мы обрабатываем ваши данные',
      link: '/legal/privacy',
      updated: '15 января 2026'
    },
    {
      icon: FileText,
      title: 'Оферта для заказчиков',
      description: 'Условия для агентств и компаний',
      link: '/legal/offer',
      updated: '20 января 2026'
    }
  ];

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

      <div className="relative z-10 flex flex-col h-full overflow-y-auto">
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
            <h1 className="text-white font-montserrat font-700 text-xl">О платформе</h1>
            <div className="w-10"></div>
          </div>

          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveSection('about')}
              className={`flex-1 h-12 font-montserrat font-700 text-sm transition-all relative ${
                activeSection === 'about' ? 'text-white' : 'text-[#9B9B9B]'
              }`}
            >
              О нас
              {activeSection === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E85D2F]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveSection('terms')}
              className={`flex-1 h-12 font-montserrat font-700 text-sm transition-all relative ${
                activeSection === 'terms' ? 'text-white' : 'text-[#9B9B9B]'
              }`}
            >
              Документы
              {activeSection === 'terms' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E85D2F]"></div>
              )}
            </button>
          </div>
        </header>

        <div className="px-4 py-6 pb-24">
          {activeSection === 'about' ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#E85D2F] to-[#D94D1F] rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-montserrat font-800 text-white">ШМ</span>
                </div>
                <h2 className="text-2xl font-montserrat font-800 text-white mb-2">
                  ШЕФ-МОНТАЖ
                </h2>
                <p className="text-white font-montserrat font-500 mb-1">
                  Версия 1.0.0 (MVP)
                </p>
                <p className="text-sm text-white font-montserrat font-500">
                  Build 2026.01.27
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#E85D2F]/10 to-[#E85D2F]/5 border border-[#E85D2F]/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-[#E85D2F] flex-shrink-0" />
                  <div>
                    <h3 className="font-montserrat font-700 text-white mb-2">Наша миссия</h3>
                    <p className="text-sm text-white font-montserrat font-500 leading-relaxed">
                      Создать прозрачный и надёжный рынок труда для технических специалистов событийной индустрии. 
                      Мы верим, что каждый монтажник заслуживает честной оплаты и уважения, а каждый заказчик — 
                      профессиональных исполнителей.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                      <Icon className="w-6 h-6 text-[#E85D2F] mx-auto mb-2" />
                      <p className="text-xl font-montserrat font-800 text-white mb-1">{stat.value}</p>
                      <p className="text-xs text-white font-montserrat font-500">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
                  Что мы решаем
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: HandshakeIcon,
                      title: 'Проблема доверия',
                      text: 'Система рейтингов и подтверждений вместо хаоса в чатах'
                    },
                    {
                      icon: DollarSign,
                      title: 'Прозрачность оплаты',
                      text: 'Честные договорённости без "кидков" и задержек'
                    },
                    {
                      icon: Zap,
                      title: 'Скорость подбора',
                      text: 'Найти бригаду за 5 минут вместо 4 часов поиска'
                    }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3">
                        <Icon className="w-6 h-6 text-[#E85D2F] flex-shrink-0" />
                        <div>
                          <h4 className="font-montserrat font-700 text-white mb-1">{item.title}</h4>
                          <p className="text-sm text-white font-montserrat font-500">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
                  Команда
                </h3>
                <div className="space-y-3">
                  {team.map((member, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundImage: `linear-gradient(135deg, ${member.color} 0%, ${member.color}dd 100%)` }}>
                        {member.useIcon ? (
                          <Code className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-lg font-montserrat font-800 text-white">
                            {member.icon}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-montserrat font-700 text-white mb-0.5">{member.name}</h4>
                        <p className="text-sm text-white font-montserrat font-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="font-montserrat font-700 text-white mb-3">Связаться с нами</h4>
                <div className="space-y-2 text-sm">
                  <a href="mailto:hello@shef-montazh.ru" className="flex items-center gap-2 text-[#E85D2F] font-montserrat font-600">
                    <ExternalLink className="w-4 h-4" />
                    hello@shef-montazh.ru
                  </a>
                  <a href="https://t.me/shef_montazh" className="flex items-center gap-2 text-[#E85D2F] font-montserrat font-600">
                    <ExternalLink className="w-4 h-4" />
                    @shef_montazh
                  </a>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-white font-montserrat font-500 leading-relaxed">
                  Сделано с <Heart className="w-4 h-4 text-[#E85D2F] inline" /> в Москве<br />
                  © 2026 ШЕФ-МОНТАЖ. Все права защищены.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-[#FFD60A] flex-shrink-0" />
                  <p className="text-sm text-white font-montserrat font-500 leading-relaxed">
                    Используя платформу, вы соглашаетесь с условиями наших документов. 
                    Пожалуйста, ознакомьтесь с ними внимательно.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {legalDocs.map((doc, index) => {
                  const Icon = doc.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => router.push(doc.link)}
                      className="w-full bg-white/5 border border-white/10 hover:border-[#E85D2F]/50 rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-[#E85D2F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#E85D2F]" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-montserrat font-700 text-white mb-1">{doc.title}</h4>
                          <p className="text-sm text-white font-montserrat font-500 mb-2">
                            {doc.description}
                          </p>
                          <p className="text-xs text-white font-montserrat font-500">
                            Обновлено: {doc.updated}
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-white flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-montserrat font-700 text-white mb-2 text-sm">
                  Вопросы по документам?
                </h4>
                <p className="text-xs text-white font-montserrat font-500 mb-3">
                  Свяжитесь с нашим юридическим отделом
                </p>
                <a 
                  href="mailto:legal@shef-montazh.ru"
                  className="text-sm text-[#E85D2F] font-montserrat font-700 flex items-center gap-1"
                >
                  legal@shef-montazh.ru
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
