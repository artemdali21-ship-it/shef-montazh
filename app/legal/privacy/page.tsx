'use client';
import { useState } from 'react';
import { ArrowLeft, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NoisePattern } from '@/components/noise-pattern';

export default function Privacy() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const privacyContent = `# Политика конфиденциальности

**Дата обновления:** 15 января 2026

## 1. Общие положения

Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей Telegram Mini App «ШЕФ-МОНТАЖ».

Оператор персональных данных: ООО "ШЕФ-МОНТАЖ".

Используя Платформу, Вы даёте согласие на обработку персональных данных в соответствии с настоящей Политикой.

## 2. Какие данные мы собираем

**Данные из Telegram:**
- Telegram ID (обязательно)
- Имя и фамилия
- Username
- Номер телефона (если указан в Telegram)
- Аватар

**Данные профиля:**
- ФИО
- Город
- Специализации
- Опыт работы
- Наличие инструментов
- Ставка за час/смену

**Технические данные:**
- IP-адрес
- Тип устройства
- Версия Telegram
- Геолокация (при согласии)
- Время активности

## 3. Цели обработки данных

Мы используем ваши данные для:
- Предоставления доступа к Платформе
- Связи между заказчиками и исполнителями
- Расчёта рейтинга и репутации
- Проведения финансовых операций
- Предотвращения мошенничества
- Улучшения качества сервиса

## 4. Срок хранения данных

Данные хранятся до удаления аккаунта пользователем или истечения 3 лет с момента последней активности.

## 5. Передача данных третьим лицам

Мы можем передавать данные:
- Supabase (хостинг БД)
- Telegram (авторизация и уведомления)
- ЮKassa/Тинькофф (обработка платежей)
- Vercel (хостинг приложения)

Все партнёры обязаны соблюдать конфиденциальность. Мы НЕ продаём ваши данные третьим лицам.

## 6. Безопасность данных

**Меры защиты:**
- Шифрование соединений (SSL/TLS)
- Двухфакторная аутентификация (через Telegram)
- Регулярные бэкапы
- Ограничение доступа сотрудников

## 7. Ваши права

Вы имеете право:
- Получить доступ к своим данным
- Исправить неточные данные
- Удалить данные (право на забвение)
- Ограничить обработку
- Отозвать согласие

Для реализации прав обращайтесь:
- Email: privacy@shef-montazh.ru
- Telegram: @shef_montazh_support

## 8. Контакты

**По вопросам обработки персональных данных:**
ООО "ШЕФ-МОНТАЖ"
Email: privacy@shef-montazh.ru
Telegram: @shef_montazh_support`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(privacyContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      height: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
          <h1 className="text-white font-montserrat font-700 text-lg text-center flex-1">Политика конфиденциальности</h1>
          <button
            onClick={copyToClipboard}
            className="w-10 h-10 flex items-center justify-center"
          >
            <Copy className={`w-5 h-5 ${copied ? 'text-[#BFFF00]' : 'text-white'}`} />
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
        <div className="max-w-4xl mx-auto pb-24">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-white font-montserrat text-sm leading-relaxed space-y-4">
              <p className="text-xs text-white font-500">Дата обновления: 15 января 2026</p>
              
              <h2 className="text-xl font-700 text-white mt-6">1. Общие положения</h2>
              <p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей Telegram Mini App «ШЕФ-МОНТАЖ».</p>

              <h2 className="text-xl font-700 text-white mt-6">2. Какие данные мы собираем</h2>
              <ul className="space-y-2 ml-4">
                <li>• Данные из Telegram (ID, имя, username, номер телефона, аватар)</li>
                <li>• Данные профиля (город, специализации, опыт работы, ставки)</li>
                <li>• История активности и сообщения</li>
                <li>• Технические данные (IP, устройство, геолокация)</li>
                <li>• Финансовые данные (история выплат, реквизиты)</li>
              </ul>

              <h2 className="text-xl font-700 text-white mt-6">3. Цели обработки</h2>
              <p>Мы используем ваши данные для предоставления услуг, связи между пользователями, расчёта рейтингов, финансовых операций и предотвращения мошенничества.</p>

              <h2 className="text-xl font-700 text-white mt-6">4. Передача данных</h2>
              <p>Данные могут передаваться партнёрам (Supabase, Telegram, Тинькофф, Vercel), которые обязаны соблюдать конфиденциальность. Мы НЕ продаём данные третьим лицам.</p>

              <h2 className="text-xl font-700 text-white mt-6">5. Ваши права</h2>
              <p>Вы можете получить доступ к данным, исправить их, удалить или отозвать согласие. Обращайтесь на privacy@shef-montazh.ru</p>

              <div className="bg-[#BFFF00]/10 border border-[#BFFF00]/20 rounded-lg p-4 mt-6">
                <p className="text-xs text-white font-700">
                  Ваша конфиденциальность для нас важна. Мы используем современные методы защиты данных.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
