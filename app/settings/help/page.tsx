'use client';
import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, MessageCircle, 
         Phone, Mail, ExternalLink, Book, Video, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NoisePattern = () => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: 0.03,
    }}
  >
    <defs>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2" />
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
)

export default function Help() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Все', icon: Book },
    { id: 'getting-started', label: 'Начало работы', icon: HelpCircle },
    { id: 'shifts', label: 'Смены', icon: Book },
    { id: 'payments', label: 'Оплата', icon: Book },
    { id: 'safety', label: 'Безопасность', icon: Book }
  ];

  const faqItems = [
    {
      category: 'getting-started',
      question: 'Как начать работать на платформе?',
      answer: '1. Зарегистрируйтесь и подтвердите телефон\n2. Заполните профиль и укажите специализации\n3. Добавьте фото и опыт работы\n4. Начните откликаться на смены или ждите приглашений от заказчиков'
    },
    {
      category: 'getting-started',
      question: 'Нужно ли платить за регистрацию?',
      answer: 'Нет, регистрация и использование платформы для исполнителей полностью бесплатны. Мы берём комиссию только с заказчиков.'
    },
    {
      category: 'shifts',
      question: 'Как откликнуться на смену?',
      answer: 'Откройте карточку смены в ленте, изучите детали (время, локация, ставка) и нажмите кнопку "Откликнуться". Заказчик получит ваш профиль и примет решение.'
    },
    {
      category: 'shifts',
      question: 'Что делать, если не могу выйти на смену?',
      answer: 'Сообщите об этом заказчику как можно раньше через чат. Частые срывы негативно влияют на рейтинг и могут привести к блокировке аккаунта.'
    },
    {
      category: 'shifts',
      question: 'Как работает система check-in?',
      answer: 'По прибытию на объект нажмите "Я на месте" и сделайте фото площадки. Система автоматически зафиксирует GPS-координаты и время. Это подтверждение вашего выхода.'
    },
    {
      category: 'payments',
      question: 'Когда я получу оплату?',
      answer: 'Оплата происходит напрямую между вами и заказчиком после завершения смены. Обычно это 1-3 дня. Способ оплаты согласовывается заранее (СЗ, наличные, по договору).'
    },
    {
      category: 'payments',
      question: 'Могу ли я работать как самозанятый?',
      answer: 'Да! Большинство заказчиков предпочитают работать через самозанятых. Вы можете зарегистрировать статус СЗ в приложении "Мой налог" и выдавать чеки.'
    },
    {
      category: 'payments',
      question: 'Что делать, если заказчик не платит?',
      answer: 'Обратитесь в поддержку через чат внизу экрана. Мы поможем решить спор. Также оставьте негативный отзыв — это предупредит других исполнителей.'
    },
    {
      category: 'safety',
      question: 'Как платформа защищает мои данные?',
      answer: 'Мы используем шифрование данных, не передаём личную информацию третьим лицам и соблюдаем требования 152-ФЗ о персональных данных.'
    },
    {
      category: 'safety',
      question: 'Что делать при конфликте на объекте?',
      answer: 'Сохраняйте спокойствие и документируйте проблему (фото, переписка). Свяжитесь с шеф-монтажником или заказчиком. В крайнем случае обратитесь в поддержку.'
    }
  ];

  const quickLinks = [
    {
      icon: Video,
      title: 'Видео-инструкции',
      description: 'Обучающие ролики для новичков',
      link: '/help/videos'
    },
    {
      icon: Book,
      title: 'База знаний',
      description: 'Подробные гайды и статьи',
      link: '/help/guides'
    },
    {
      icon: MessageCircle,
      title: 'Чат с поддержкой',
      description: 'Ответим в течение 15 минут',
      link: '/support/chat'
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      label: 'Telegram',
      value: '@shef_montazh_support',
      action: 'Написать'
    },
    {
      icon: Phone,
      label: 'Телефон',
      value: '+7 (495) 123-45-67',
      action: 'Позвонить'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'support@shef-montazh.ru',
      action: 'Написать'
    }
  ];

  const filteredFAQ = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <NoisePattern />

      <div className="relative z-10 pb-24">
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(42, 42, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 20,
        }}>
          <div className="h-16 flex items-center justify-between px-4">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white font-montserrat font-700 text-xl">Помощь</h1>
            <div className="w-10"></div>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9B9B]" />
              <input
                type="text"
                placeholder="Поиск по вопросам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white placeholder:text-[#6B6B6B] font-montserrat font-500 text-sm focus:outline-none focus:border-[#E85D2F]/50"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-montserrat font-600 text-sm whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-[#E85D2F] text-white'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          {/* Quick Links */}
          <div className="grid grid-cols-1 gap-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  onClick={() => router.push(link.link)}
                  className="bg-white/5 border border-white/10 hover:border-[#E85D2F]/50 rounded-xl p-4 flex items-center gap-3 transition-all"
                >
                  <div className="w-12 h-12 bg-[#E85D2F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#E85D2F]" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-montserrat font-700 text-white mb-0.5">{link.title}</h3>
                    <p className="text-xs text-white font-montserrat font-500">{link.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#6B6B6B]" />
                </button>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Частые вопросы
            </h3>
            <div className="space-y-2">
              {filteredFAQ.map((item, index) => {
                const isExpanded = expandedFAQ === index;
                return (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(isExpanded ? null : index)}
                      className="w-full p-4 flex items-center justify-between gap-3 text-left"
                    >
                      <span className="font-montserrat font-600 text-white flex-1">
                        {item.question}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#E85D2F] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-white font-montserrat font-500 leading-relaxed whitespace-pre-line">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Support */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Не нашли ответ?
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 flex items-center justify-between gap-4 ${
                      index !== contactMethods.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-[#BFFF00]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#BFFF00]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white font-montserrat font-500 mb-0.5">
                          {method.label}
                        </p>
                        <p className="font-montserrat font-600 text-white truncate">{method.value}</p>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 bg-[#E85D2F] hover:bg-[#D94D1F] rounded-full font-montserrat font-700 text-white text-sm transition-colors flex-shrink-0 whitespace-nowrap">
                      {method.action}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/20 rounded-lg p-4">
            <p className="text-sm text-white font-montserrat font-500 text-center">
              Поддержка работает <span className="text-white font-700">24/7</span><br />
              Среднее время ответа — <span className="text-[#FFD60A] font-700">15 минут</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
