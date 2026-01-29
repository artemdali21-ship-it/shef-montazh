'use client'
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

## 6. Отмена смены`

  return (
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-white/5 backdrop-blur">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center">Оферта</h1>
        <div className="w-8" />
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <div className="prose prose-invert max-w-none">
            {offerContent.split('\n\n').map((section, idx) => {
              if (section.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-2xl font-bold text-white mt-6 mb-4">
                    {section.replace('# ', '')}
                  </h1>
                );
              }
              if (section.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-xl font-bold text-white mt-5 mb-3">
                    {section.replace('## ', '')}
                  </h2>
                );
              }
              if (section.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-lg font-bold text-white mt-4 mb-2">
                    {section.replace('### ', '')}
                  </h3>
                );
              }
              if (section.startsWith('**')) {
                return (
                  <p key={idx} className="text-white/90 mb-3 font-semibold">
                    {section}
                  </p>
                );
              }
              if (section.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc list-inside text-white/80 mb-3 space-y-1">
                    {section.split('\n').map((item, i) => (
                      <li key={i}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              if (section.startsWith('|')) {
                return (
                  <div key={idx} className="overflow-x-auto mb-4">
                    <table className="w-full text-sm text-white/80 border border-white/20">
                      <tbody>
                        {section.split('\n').map((row, i) => (
                          <tr key={i} className="border-b border-white/20">
                            {row.split('|').filter(Boolean).map((cell, j) => (
                              <td key={j} className="px-4 py-2 border-r border-white/10 last:border-r-0">
                                {cell.trim()}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <p key={idx} className="text-white/80 mb-3 leading-relaxed">
                  {section}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
