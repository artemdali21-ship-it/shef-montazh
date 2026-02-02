# ШЕФ-МОНТАЖ - Маркетплейс монтажников

Платформа для поиска и найма монтажников для мероприятий.

## 🚀 Быстрый старт

### 1. Установка

```bash
npm install
# или
pnpm install
```

### 2. Environment Variables

Создайте файл `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token

# YooKassa (опционально)
YUKASSA_SHOP_ID=your_shop_id
YUKASSA_SECRET_KEY=your_secret_key

# Cron Secret
CRON_SECRET=your_random_secret
```

### 3. База данных

```bash
# Примените миграции в Supabase SQL Editor
# Файлы в: supabase/migrations/
```

### 4. Запуск

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

---

## 📦 Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth + Telegram
- **Storage:** Supabase Storage
- **Payments:** YooKassa
- **Notifications:** Telegram Bot API
- **Deployment:** Vercel

---

## 📁 Структура проекта

```
shef-montazh/
├── app/
│   ├── (worker)/          # Worker routes
│   ├── (client)/          # Client routes
│   ├── (shef)/            # Shef routes
│   ├── admin/             # Admin panel
│   ├── auth/              # Authentication
│   └── api/               # API endpoints
├── components/
│   ├── ui/                # UI components
│   ├── features/          # Feature components
│   └── layouts/           # Layout components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── telegram.ts        # Telegram functions
│   ├── validation.ts      # Zod schemas
│   └── shiftStateMachine.ts
├── supabase/migrations/   # Database migrations
└── public/               # Static assets
```

---

## 🔐 Получение Telegram Bot Token

1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен в `.env.local`

---

## 💳 Настройка YooKassa

### Sandbox (тестирование)

1. Зарегистрируйтесь на https://yookassa.ru
2. Перейдите в Sandbox режим
3. Получите Shop ID и Secret Key
4. Добавьте в `.env.local`

### Production

1. Пройдите верификацию на YooKassa
2. Получите production ключи
3. Обновьте `.env.local`

---

## 🌐 Деплой на Vercel

1. Запушьте код на GitHub
2. Импортируйте проект в Vercel
3. Добавьте Environment Variables
4. Деплой!

Vercel автоматически настроит:
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

---

## 🧪 Тестирование

### Тестовые данные

```bash
# Создать тестовые данные
curl -X POST http://localhost:3000/api/seed
```

### Sandbox платежи

Используйте тестовые карты YooKassa:
- Успешный платёж: `5555 5555 5555 4477`
- Отклонённый платёж: `5555 5555 5555 5599`

---

## ⚙️ Cron Jobs

Vercel Cron Jobs настроены в `vercel.json`:

- `/api/cron/shift-reminders` - каждые 5 минут
- `/api/cron/payments-overdue` - каждый час

---

## 🐛 Известные ограничения

- Госуслуги ID - заглушка (будет в следующей версии)
- Geolocation может не работать в некоторых браузерах iOS
- Telegram Bot требует HTTPS для webhooks

---

## 📝 Миграции

Все миграции находятся в `supabase/migrations/`.

Применение:
1. Откройте Supabase Dashboard → SQL Editor
2. Скопируйте содержимое миграции
3. Запустите SQL

---

## 🤝 Команда

Разработано с ❤️ для индустрии мероприятий

---

## 📄 Лицензия

Proprietary
