'use client';
import { useState } from 'react';
import { ArrowLeft, Copy, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NoisePattern } from '@/components/noise-pattern';

export default function Offer() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const offerContent = `# Оферта для заказчиков

**Дата обновления:** 20 января 2026

## 1. Определения

**Платформа** — Telegram Mini App «ШЕФ-МОНТАЖ».
**Заказчик** — юридическое лицо или ИП, размещающее заказы на услуги технического персонала.
**Исполнитель** — физическое лицо (самозанятый, ИП), оказывающее услуги.
**Смена** — единица услуги, размещённая Заказчиком на Платформе.

## 2. Предмет договора

Платформа предоставляет Заказчику доступ к сервису поиска и подбора технического персонала.

Платформа НЕ является:
- Агентством по подбору персонала
- Работодателем
- Стороной трудовых отношений
- Гарантом качества работ

## 3. Стоимость услуг

**Комиссия Платформы: 12% от стоимости смены**

**Пакеты:**

| Пакет | Комиссия | Дополнительно |
|-------|----------|---------------|
| **Базовый** | 12% | — |
| **Стандарт** | 10% | +5000₽/мес |
| **Премиум** | 8% | +15000₽/мес |

**Базовый пакет** (бесплатный):
- Размещение смен
- Доступ к базе исполнителей
- Система рейтингов
- Чат с исполнителями

**Стандарт** (+5000₽/мес):
- Сниженная комиссия до 10%
- Приоритетный показ смен
- Белые/чёрные списки
- Расширенная аналитика

**Премиум** (+15000₽/мес):
- Минимальная комиссия 8%
- Топ-размещение смен
- Персональный менеджер
- API-интеграция
- Отсрочка платежа до 14 дней

## 4. Порядок работы

### 4.1. Регистрация:
- Авторизация через Telegram
- Заполнение профиля компании
- Указание юридических реквизитов

### 4.2. Создание смены:
- Описание задачи
- Указание даты, времени, локации
- Установка ставки оплаты
- Требования к квалификации

### 4.3. Подбор исполнителей:
- Просмотр откликов
- Изучение профилей и рейтингов
- Выбор исполнителей
- Подтверждение смены

### 4.4. Завершение:
- Оплата исполнителю
- Оставление отзыва
- Получение закрывающих документов

## 5. Обязанности Заказчика

Заказчик обязан:
- Предоставлять достоверную информацию о смене
- Обеспечивать безопасные условия труда
- Соблюдать трудовое законодательство РФ
- Производить оплату в установленные сроки
- Оформлять отношения с исполнителями (ГПХ, самозанятые)
- Не привлекать исполнителей в обход Платформы

Обход Платформы влечёт штраф 50,000₽ и блокировку аккаунта.

## 6. Отмена смены

- **Более чем за 24 часа** — бесплатно
- **Менее чем за 24 часа** — комиссия 50%
- **Менее чем за 6 часов** — комиссия 100%

## 7. Документооборот

Платформа предоставляет:
- Акты оказанных услуг
- Счета на оплату
- Закрывающие документы (для бухгалтерии)
- ЭДО (для пакетов Стандарт и Премиум)

## 8. Реквизиты

**ООО "ШЕФ-МОНТАЖ"**
ИНН: 7707123456
ОГРН: 1234567890123
Адрес: 109012, г. Москва, ул. Примерная, д. 1, офис 101
Email: finance@shef-montazh.ru
Telegram: @shef_montazh_biz`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(offerContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <NoisePattern />

      <div className="relative z-10">
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
            <h1 className="text-white font-montserrat font-700 text-lg text-center flex-1">Оферта для заказчиков</h1>
            <button
              onClick={copyToClipboard}
              className="w-10 h-10 flex items-center justify-center"
            >
              <Copy className={`w-5 h-5 ${copied ? 'text-[#BFFF00]' : 'text-white'}`} />
            </button>
          </div>
        </header>

        <div className="px-4 py-6 pb-24 max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-white font-montserrat text-sm leading-relaxed space-y-4">
                <p className="text-xs text-[#9B9B9B]">Дата обновления: 20 января 2026</p>
                
                <h2 className="text-xl font-700 text-white mt-6">1. Комиссия Платформы</h2>
                <p className="text-lg font-800 text-[#E85D2F]">12% от стоимости смены</p>

                <h2 className="text-xl font-700 text-white mt-6">2. Пакеты услуг</h2>
                
                <div className="space-y-3">
                  <div className="bg-[#E85D2F]/10 border border-[#E85D2F]/30 rounded-lg p-4">
                    <h3 className="font-700 text-white mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Базовый (бесплатный)
                    </h3>
                    <p className="text-xs text-white mb-2">Комиссия: <span className="font-700">12%</span></p>
                    <ul className="space-y-1 ml-4">
                      <li className="text-xs text-white">• Размещение смен</li>
                      <li className="text-xs text-white">• Доступ к базе исполнителей</li>
                      <li className="text-xs text-white">• Система рейтингов</li>
                    </ul>
                  </div>

                  <div className="bg-[#BFFF00]/10 border border-[#BFFF00]/30 rounded-lg p-4">
                    <h3 className="font-700 text-white mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Стандарт (+5000₽/мес)
                    </h3>
                    <p className="text-xs text-white mb-2">Комиссия: <span className="font-700 text-[#BFFF00]">10%</span></p>
                    <ul className="space-y-1 ml-4">
                      <li className="text-xs text-white">• Приоритетный показ смен</li>
                      <li className="text-xs text-white">• Белые/чёрные списки</li>
                      <li className="text-xs text-white">• Расширенная аналитика</li>
                    </ul>
                  </div>

                  <div className="bg-[#E85D2F]/20 border border-[#E85D2F]/50 rounded-lg p-4">
                    <h3 className="font-700 text-[#FFD60A] mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Премиум (+15000₽/мес)
                    </h3>
                    <p className="text-xs text-white mb-2">Комиссия: <span className="font-700 text-[#FFD60A]">8%</span></p>
                    <ul className="space-y-1 ml-4">
                      <li className="text-xs text-white">• Топ-размещение смен</li>
                      <li className="text-xs text-white">• Персональный менеджер</li>
                      <li className="text-xs text-white">• API-интеграция</li>
                      <li className="text-xs text-white">• Отсрочка платежа до 14 дней</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-xl font-700 text-white mt-6">3. Порядок работы</h2>
                <ol className="space-y-2 ml-4">
                  <li className="text-xs text-white"><span className="font-700">1.</span> Регистрация через Telegram</li>
                  <li className="text-xs text-white"><span className="font-700">2.</span> Создание смены с описанием и ставкой</li>
                  <li className="text-xs text-white"><span className="font-700">3.</span> Просмотр и выбор исполнителей</li>
                  <li className="text-xs text-white"><span className="font-700">4.</span> Оплата и получение документов</li>
                </ol>

                <h2 className="text-xl font-700 text-white mt-6">4. Обязанности Заказчика</h2>
                <ul className="space-y-2 ml-4">
                  <li className="text-xs text-white">• Предоставлять достоверную информацию</li>
                  <li className="text-xs text-white">• Обеспечивать безопасные условия труда</li>
                  <li className="text-xs text-white">• Производить оплату в сроки</li>
                  <li className="text-xs text-white">• Не привлекать исполнителей в обход платформы (штраф 50,000₽)</li>
                </ul>

                <div className="bg-[#E85D2F]/10 border border-[#E85D2F]/20 rounded-lg p-4 mt-6">
                  <p className="text-xs text-white font-700">
                    Акцептуя настоящую оферту, Заказчик подтверждает, что ознакомился с условиями и принимает их в полном объёме.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
