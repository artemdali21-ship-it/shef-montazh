# Architecture: Core Contracts

Этот документ описывает "скрепляющие контракты" системы - то, что превращает набор фич в цельный продукт.

## Table of Contents

1. [Data Model + RLS Matrix](#1-data-model--rls-matrix)
2. [Shift State Machine](#2-shift-state-machine)
3. [Cancellation Policy](#3-cancellation-policy)
4. [Trust & Safety MVP](#4-trust--safety-mvp)
5. [Role Dashboards](#5-role-dashboards)
6. [Activation Flows](#6-activation-flows)
7. [Escrow/Payments Lifecycle](#7-escrowpayments-lifecycle)

---

## 1. Data Model + RLS Matrix

### Core Entities

```
users (Supabase Auth)
├── id (uuid, PK)
├── email
├── phone
└── role (enum: worker, client, shef, admin)

worker_profiles
├── id (uuid, PK)
├── user_id (FK → users)
├── full_name
├── rating (1.0-5.0)
├── total_shifts
├── verification_status (pending, verified, rejected)
├── documents[] (passports, certificates)
└── is_suspicious (boolean)

client_profiles
├── id (uuid, PK)
├── user_id (FK → users)
├── company_name
├── rating (1.0-5.0)
├── total_shifts_posted
├── verification_status
└── trust_score (0-100)

shifts
├── id (uuid, PK)
├── client_id (FK → client_profiles)
├── title, description, location
├── date, start_time, end_time
├── hourly_rate, total_amount
├── workers_needed
├── status (draft, open, in_progress, completed, cancelled, disputed)
├── cancellation_reason
├── cancelled_at
├── cancelled_by (FK → users)
└── is_flagged (boolean)

shift_applications
├── id (uuid, PK)
├── shift_id (FK → shifts)
├── worker_id (FK → worker_profiles)
├── status (pending, accepted, rejected, withdrawn)
├── applied_at
└── responded_at

shift_assignments
├── id (uuid, PK)
├── shift_id (FK → shifts)
├── worker_id (FK → worker_profiles)
├── check_in_time
├── check_out_time
├── check_in_location (lat, lng)
└── status (assigned, checked_in, checked_out, completed)

payments
├── id (uuid, PK)
├── shift_id (FK → shifts)
├── client_id (FK → client_profiles)
├── amount
├── platform_fee
├── status (pending, held, released, refunded)
├── yukassa_payment_id
├── held_at
├── released_at
└── refund_reason

worker_payouts
├── id (uuid, PK)
├── worker_id (FK → worker_profiles)
├── shift_id (FK → shifts)
├── amount
├── status (pending, processing, paid, failed)
└── paid_at

disputes
├── id (uuid, PK)
├── shift_id (FK → shifts)
├── raised_by (FK → users)
├── reason
├── status (open, under_review, resolved)
└── resolution

messages
├── id (uuid, PK)
├── shift_id (FK → shifts)
├── sender_id (FK → users)
├── content
└── sent_at

notifications
├── id (uuid, PK)
├── user_id (FK → users)
├── type (shift_update, message, payment, etc)
├── title, body
├── read (boolean)
├── action_url
└── created_at

trust_events
├── id (uuid, PK)
├── user_id (FK → users)
├── event_type (no_show, late_cancellation, spam, etc)
├── severity (low, medium, high)
├── shift_id (FK → shifts)
└── created_at
```

### RLS (Row Level Security) Matrix

**Принцип**: каждая таблица имеет политики на SELECT, INSERT, UPDATE, DELETE.

#### users
- **SELECT**: сам пользователь или admin
- **UPDATE**: только admin (роли не меняют сами)

#### worker_profiles
- **SELECT**:
  - Все (публичный профиль для поиска)
  - Полные данные: сам worker или admin
- **INSERT**: только при регистрации worker
- **UPDATE**: сам worker (кроме rating, total_shifts) или admin
- **DELETE**: только admin

#### client_profiles
- **SELECT**:
  - Все (публичный профиль)
  - Полные данные: сам client или admin
- **INSERT**: только при регистрации client
- **UPDATE**: сам client (кроме rating, trust_score) или admin
- **DELETE**: только admin

#### shifts
- **SELECT**:
  - Открытые смены (status=open): все workers
  - Свои смены: client (owner) или assigned workers
  - Все: admin
- **INSERT**: только client
- **UPDATE**:
  - client (owner) может менять до начала
  - admin может всё
  - worker может отметить check-in/out
- **DELETE**: только admin (client может только cancel)

#### shift_applications
- **SELECT**:
  - worker (автор)
  - client (владелец смены)
  - admin
- **INSERT**: только worker (на открытую смену)
- **UPDATE**:
  - worker может withdraw
  - client может accept/reject
- **DELETE**: только admin

#### shift_assignments
- **SELECT**: worker, client, admin
- **INSERT**: только через accept application
- **UPDATE**: worker (check-in/out), admin
- **DELETE**: только admin

#### payments
- **SELECT**: client (owner), admin
- **INSERT**: только система (при создании смены)
- **UPDATE**: только система (webhooks) или admin
- **DELETE**: только admin

#### worker_payouts
- **SELECT**: worker (owner), admin
- **INSERT**: только система
- **UPDATE**: только система или admin
- **DELETE**: только admin

#### disputes
- **SELECT**: участники (client/worker) или admin
- **INSERT**: участники смены
- **UPDATE**: только admin (резолюция)
- **DELETE**: только admin

#### messages
- **SELECT**: участники смены или admin
- **INSERT**: участники смены
- **UPDATE**: нельзя (immutable)
- **DELETE**: только admin (модерация)

#### notifications
- **SELECT**: только owner (user_id)
- **INSERT**: только система
- **UPDATE**: owner (mark as read)
- **DELETE**: owner или admin

#### trust_events
- **SELECT**: только admin
- **INSERT**: только система
- **UPDATE**: только admin
- **DELETE**: только admin

---

## 2. Shift State Machine

### States

```
draft       → open          → in_progress → completed
  ↓           ↓                   ↓            ↓
cancelled  cancelled         disputed     disputed
```

### State Definitions

| State | Description | Who Can Enter |
|-------|-------------|---------------|
| **draft** | Создана, не опубликована | client |
| **open** | Опубликована, прием откликов | client (publish) |
| **in_progress** | Началась, worker checked-in | system (after check-in) |
| **completed** | Завершена, worker checked-out | system (after check-out) |
| **cancelled** | Отменена до начала | client, admin |
| **disputed** | Спор по качеству/оплате | client, worker |

### Transition Rules

#### draft → open
- **Who**: client (owner)
- **Conditions**:
  - All required fields filled
  - Date/time in future (>2 hours)
  - Payment method added
- **Effects**:
  - Visible to all workers
  - Start accepting applications
  - Send notification to matching workers

#### draft → cancelled
- **Who**: client (owner)
- **Conditions**: none
- **Effects**: none (не опубликована)

#### open → cancelled
- **Who**: client (owner), admin
- **Conditions**:
  - No check-ins yet
  - Cancellation window policy applies (see §3)
- **Effects**:
  - Refund payment (minus cancellation fee if applicable)
  - Notify all applicants
  - Record trust_event for late cancellation

#### open → in_progress
- **Who**: system (automatic)
- **Conditions**:
  - At least 1 worker checked in
  - Current time >= shift start_time
- **Effects**:
  - Lock applications
  - Hold payment (if not held yet)
  - Send "shift started" notification

#### in_progress → completed
- **Who**: system (automatic)
- **Conditions**:
  - All assigned workers checked out
  - OR client manually closes shift
- **Effects**:
  - Release payment from hold
  - Trigger worker payouts
  - Request ratings from both sides
  - Update user statistics

#### in_progress → disputed
- **Who**: client or worker
- **Conditions**:
  - Within 24h after shift end
- **Effects**:
  - Freeze payment
  - Notify admin
  - Open dispute thread

#### completed → disputed
- **Who**: client or worker
- **Conditions**:
  - Within 48h after completion
- **Effects**:
  - Reopen payment (if already released)
  - Admin review required

### Illegal Transitions

- ❌ `in_progress → open` (нельзя "распубликовать" начатую смену)
- ❌ `completed → open` (нельзя переоткрыть завершенную)
- ❌ `cancelled → *` (отмененная смена - финальный статус)
- ❌ `completed → cancelled` (нельзя отменить завершенную)

### Implementation

See `lib/shift/stateMachine.ts` for code contract.

---

## 3. Cancellation Policy

### Cancellation Windows

| Время до начала смены | Кто может отменить | Штраф/Комиссия |
|----------------------|-------------------|----------------|
| **>24 часа** | Client | 0% (полный возврат) |
| **12-24 часа** | Client | 10% (невозвратная комиссия) |
| **2-12 часов** | Client | 30% (компенсация workers) |
| **<2 часа** | Только Admin | 50% (серьезное нарушение) |
| **После check-in** | Только Admin | 100% (оплата workers) |

### Worker No-Show Policy

| Сценарий | Действие | Штраф Worker |
|----------|----------|--------------|
| **Не пришел (no check-in)** | Client может заменить | -1 trust score, блокировка на 7 дней |
| **Опоздание >30 мин** | Client может отменить участие | -0.5 trust score, предупреждение |
| **Ушел раньше (без согласия)** | Оплата пропорционально времени | -0.5 trust score |

### Force Majeure

Если смена отменена по форс-мажору (болезнь, ЧП):
- Client должен предоставить подтверждение
- Admin решает вопрос возврата (обычно 100%)
- Без штрафов обеим сторонам

### Automated Actions

```typescript
// Псевдокод
function handleCancellation(shift: Shift, cancelledBy: User) {
  const hoursUntilStart = getHoursUntil(shift.start_time)

  if (hoursUntilStart > 24) {
    refundAmount = shift.total_amount * 1.0 // 100%
    penalty = 0
  } else if (hoursUntilStart > 12) {
    refundAmount = shift.total_amount * 0.9 // 90%
    penalty = shift.total_amount * 0.1
  } else if (hoursUntilStart > 2) {
    refundAmount = shift.total_amount * 0.7 // 70%
    penalty = shift.total_amount * 0.3
    createTrustEvent(cancelledBy, 'late_cancellation', 'medium')
  } else {
    throw new Error('Cannot cancel within 2 hours - contact admin')
  }

  // Возврат клиенту
  refundPayment(shift.payment_id, refundAmount)

  // Компенсация workers (если penalty > 0)
  if (penalty > 0) {
    distributeCompensation(shift.assigned_workers, penalty)
  }

  // Уведомления
  notifyWorkers(shift, 'shift_cancelled')
  notifyClient(shift, 'cancellation_confirmed')
}
```

---

## 4. Trust & Safety MVP

### Goals

- Защита от фейковых анкет
- Предотвращение спама
- Минимизация "увода в обход"

### Measures

#### 4.1 New User Limits

**Client (первые 7 дней):**
- Максимум 3 активных смены одновременно
- Обязательная верификация телефона
- Предоплата обязательна (нельзя "оплата после")

**Worker (первые 14 дней):**
- Максимум 5 откликов в день
- Обязательная верификация паспорта
- Ограничение на сообщения (нельзя отправлять ссылки/телефоны)

#### 4.2 Suspicious Flags

Автоматическое проставление флага `is_suspicious`:

**Client:**
- Создает >5 смен за день
- Отменяет >50% смен
- Описание содержит телефон/ссылку
- Регистрация с временной почтой

**Worker:**
- Откликается на ВСЕ смены подряд
- >3 no-show подряд
- Отправляет одинаковое сообщение всем
- Паспорт не прошел проверку

#### 4.3 Content Moderation

**Бан-слова в описании смен:**
```typescript
const BANNED_PATTERNS = [
  /\b\d{10,11}\b/g,           // Телефоны
  /t\.me\/\w+/gi,             // Telegram ссылки
  /whatsapp/gi,               // WhatsApp
  /viber/gi,                  // Viber
  /напиш[иу] мне/gi,          // "напиши мне"
  /свяж[иу]тесь напрямую/gi,  // "свяжитесь напрямую"
]

function validateShiftContent(text: string): boolean {
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return false // Блокировать публикацию
    }
  }
  return true
}
```

#### 4.4 Trust Score

**Формула:**
```
trust_score = 100
  - (no_shows * 15)
  - (late_cancellations * 10)
  - (disputes_lost * 20)
  + (completed_shifts * 2)
  + (positive_ratings * 5)

Диапазон: 0-100
```

**Действия по trust_score:**
- **80-100**: полный доступ
- **50-79**: ограничения (например, меньше откликов в день)
- **20-49**: модерация всех действий
- **0-19**: временная блокировка

#### 4.5 Admin Dashboard

**Alerts:**
- Список подозрительных пользователей
- Смены с флагом `is_flagged`
- Резкие изменения trust_score
- Повторяющиеся IP-адреса

**Actions:**
- Заблокировать пользователя
- Снять флаг после проверки
- Сбросить trust_score
- Отправить предупреждение

---

## 5. Role Dashboards

### Концепция

Дашборд - это НЕ просто "главная страница", а **контекстный центр управления** для роли.

### 5.1 Worker Dashboard (`/worker`)

**Вопрос дашборда:** "Что мне делать прямо сейчас?"

**Блоки:**

1. **Активные смены** (3 карточки макс)
   - Предстоящая (через 2 часа): "Подготовься к смене"
   - В процессе: "Отметь завершение"
   - Ожидает рейтинга: "Оцени клиента"

2. **Новые смены для меня** (matched by skills/location)
   - Top 5 рекомендаций
   - "Откликнуться за 1 клик"

3. **Мои отклики** (pending applications)
   - Статус: ожидает ответа
   - Время до начала смены

4. **Статистика**
   - Завершено смен: 12
   - Рейтинг: 4.8 ⭐
   - Заработано: 45 000 ₽

5. **Alerts/To-Do**
   - ⚠️ Паспорт требует обновления
   - 📝 Заполни профиль на 100% (сейчас 80%)
   - 💬 2 новых сообщения

**Empty State:**
- "У тебя нет активных смен"
- CTA: "Найти смену" → фильтры по умолчанию заполнены

---

### 5.2 Client Dashboard (`/client`)

**Вопрос дашборда:** "Как мои смены?"

**Блоки:**

1. **Активные смены** (в процессе)
   - Статус workers (checked-in / нет)
   - "Связаться с бригадой"

2. **Ожидают действия**
   - Новые отклики (5): "Выбери исполнителей"
   - Ожидают оплаты (2): "Оплати смену"
   - Запросы на изменение: "Одобри или откажи"

3. **Предстоящие смены** (не хватает workers)
   - "Смена через 6 часов, нужно 2 человека"
   - CTA: "Подними в топ" / "Увеличь ставку"

4. **Статистика**
   - Опубликовано: 8 смен
   - Завершено: 5 смен
   - Рейтинг: 4.9 ⭐
   - Потрачено: 120 000 ₽

5. **Quick Actions**
   - ➕ "Создать смену из шаблона"
   - 📋 "Скопировать прошлую смену"
   - 👥 "Пригласить проверенных workers"

**Empty State:**
- "У тебя нет смен"
- CTA: "Создать первую смену" → пошаговый гайд

---

### 5.3 Shef Dashboard (`/shef`)

**Вопрос дашборда:** "Как моя команда?"

**Блоки:**

1. **Команда** (workers в моей организации)
   - Список с рейтингами
   - Кто на смене прямо сейчас
   - Статистика: "80% выходов"

2. **Смены команды** (за неделю)
   - Завершено: 12
   - Запланировано: 5
   - Заработано: 200 000 ₽

3. **Alerts**
   - Worker Петров: no-show вчера
   - Клиент Иванов: отложил оплату
   - Смена через 2 часа: нужен замена

4. **Quick Actions**
   - 📝 "Создать смену для команды"
   - 👤 "Добавить worker в команду"
   - 💼 "Управление выплатами"

---

### 5.4 Admin Dashboard (`/admin`)

**Вопрос дашборда:** "Что требует внимания?"

**Блоки:**

1. **Alerts** (критические)
   - 3 открытых dispute
   - 5 подозрительных пользователей
   - 2 failed payments

2. **Today Stats**
   - Активных смен: 23
   - Новых регистраций: 12
   - Транзакций: 45 000 ₽

3. **Queue**
   - Верификация паспортов: 7
   - Модерация смен: 3
   - Ответы в support: 12

4. **Quick Links**
   - 👥 Users
   - 📋 Shifts
   - 💰 Payments
   - ⚖️ Disputes
   - 📊 Analytics

---

## 6. Activation Flows

### Activation Metrics

**Worker Activated:**
- Профиль заполнен на 80%+
- Паспорт загружен
- **Хотя бы 1 отклик отправлен**

**Client Activated:**
- Компания заполнена
- Способ оплаты добавлен
- **Хотя бы 1 смена опубликована**

### Onboarding Guided Setup

#### Worker Onboarding

**Step 1: Роль** (уже есть)
- "Ты исполнитель или заказчик?"

**Step 2: Базовый профиль**
- ФИО, телефон, фото
- "Мы проверим твой номер"

**Step 3: Навыки** (critical!)
- Чек-боксы: монтаж, демонтаж, работа на высоте
- "Выбери хотя бы 1 навык"

**Step 4: Документы**
- Загрузить паспорт
- "Это нужно для доверия клиентов"

**Step 5: Активация** ⭐
- Checklist:
  - ✅ Профиль: 80%
  - ✅ Паспорт: загружен
  - ❌ **Первый отклик: не отправлен**
- CTA: "Найти первую смену" → автопоиск с моими навыками

#### Client Onboarding

**Step 1: Роль**

**Step 2: Компания**
- Название, ИНН (опционально), город

**Step 3: Способ оплаты**
- "Добавь карту для оплаты смен"
- ЮКасса виджет

**Step 4: Активация** ⭐
- Checklist:
  - ✅ Компания: заполнена
  - ✅ Оплата: добавлена
  - ❌ **Первая смена: не создана**
- CTA: "Создать смену за 2 минуты" → быстрая форма

### Activation Nudges

**Worker (если не activated через 24h):**
- Push: "Найди первую смену и получи бонус 500₽"
- Email: "5 смен ждут твоего отклика"

**Client (если не activated через 48h):**
- Push: "Создай смену за 2 минуты"
- Email: "Шаблоны смен для твоей индустрии"

---

## 7. Payments Lifecycle (MVP без Escrow)

### Payment Model: **Pay-After-Completion с механизмами защиты**

⚠️ **Важно:** Escrow (холд платежей) требует лицензию ЦБ РФ (3.5 млн ₽) - нереально для стартапа.

**Альтернатива:** Клиент платит **ПОСЛЕ завершения смены** в течение 24 часов. Защита через trust score + гарантийный фонд.

**Детали:** См. `PAYMENTS_MVP.md`

### Simple Lifecycle (MVP)

#### 7.1 Shift Creation

**Когда:** Client создает смену

**Действие:**
- Смена публикуется без оплаты
- Worker откликается и работает
- **НЕТ никаких платежей до завершения**

#### 7.2 Payment After Completion

**Когда:** Смена завершена (worker checked out)

**Действие:**
```typescript
// Client получает уведомление: "Оплати в течение 24ч"
const paymentUrl = await yukassa.createPayment({
  amount: shift.total_amount,
  capture: true, // Сразу списываем (нет холда!)
  description: `Смена: ${shift.title}`
})

// Отправляем ссылку
sendNotification(client, 'payment_required', {
  url: paymentUrl,
  deadline: '24 часа'
})
```

#### 7.3 Payment Deadline Check

**Cron job каждый час:**
```typescript
// Если client не оплатил в срок:
async function checkOverduePayments() {
  const overdue = await getShifts({
    status: 'completed',
    payment_status: 'pending',
    completed_at: { lt: Date.now() - 24h }
  })

  for (const shift of overdue) {
    // 1. Снижаем trust_score client
    await updateTrustScore(shift.client_id, -30)

    // 2. Блокируем новые смены
    await updateClient(shift.client_id, { blocked: true })

    // 3. Платим worker из гарантийного фонда
    if (guaranteeFund.balance >= shift.worker_amount) {
      await payFromGuaranteeFund(shift.worker_id, shift.worker_amount)
      await createDebt(shift.client_id, shift.total_amount)
    }

    // 4. Уведомляем админа
    await notifyAdmin('Overdue payment', shift)
  }
}
```

### Payment States (Simplified)

| State | Description | Actions |
|-------|-------------|---------|
| **none** | Смена еще не завершена | - |
| **pending** | Ожидает оплаты (24h deadline) | Client платит |
| **paid** | Оплачено | Worker получает выплату |
| **overdue** | Просрочено >24h | Trust score -30, блокировка, компенсация из фонда |

### Protection Mechanisms

**1. Trust Score:**
- Неоплата: -30 points
- Оплата вовремя: +5 points
- Trust <50: обязательная предоплата
- Trust <30: блокировка

**2. Guarantee Fund:**
- 5% от каждой транзакции → в фонд
- Если client не платит → платим worker из фонда
- Долг остается на client

**3. Phone Verification:**
- Обязательна для всех clients перед первой сменой

**Детали:** См. `PAYMENTS_MVP.md`

---

## Implementation Checklist

### Phase 1: Critical (Week 1-2)
- [ ] RLS политики (migrations)
- [ ] Shift state machine code + tests
- [ ] Cancellation policy enforcement
- [ ] Escrow payment lifecycle
- [ ] Trust events tracking

### Phase 2: Safety (Week 2-3)
- [ ] New user limits
- [ ] Suspicious flags logic
- [ ] Content moderation (ban-words)
- [ ] Trust score calculation
- [ ] Admin alerts dashboard

### Phase 3: UX (Week 3)
- [ ] Worker dashboard
- [ ] Client dashboard
- [ ] Activation flows
- [ ] Empty states
- [ ] In-app notifications inbox

---

## Metrics to Track

**Product Health:**
- Activation rate (worker: first application, client: first shift)
- Time to activation
- Cancellation rate (by window)
- No-show rate
- Dispute rate

**Trust & Safety:**
- Suspicious flags rate
- Trust score distribution
- Moderation queue size
- Ban rate

**Payments:**
- Hold → Release rate
- Refund rate
- Dispute resolution time
- Payout processing time

---

## Conclusion

Эти 7 контрактов превращают набор фич в **работающий маркетплейс**:

1. **RLS** = данные защищены
2. **State Machine** = бизнес-логика однозначна
3. **Cancellation Policy** = конфликты предотвращены
4. **Trust & Safety** = качество контролируется
5. **Dashboards** = UX цельный
6. **Activation** = пользователи доходят до ценности
7. **Escrow** = деньги движутся безопасно

**Без этих контрактов** у вас 100 фич, но "чего-то не хватает".
**С этими контрактами** у вас продукт, которому доверяют.
