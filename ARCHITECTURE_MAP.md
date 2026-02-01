# Архитектура системы - High Level Overview

## 🗺️ Карта системы

```
┌─────────────────────────────────────────────────────────────┐
│                     ШЕФ-МОНТАЖ PLATFORM                     │
│                   Telegram Mini App                          │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
           ┌────▼───┐    ┌────▼───┐   ┌────▼────┐
           │ WORKER │    │ CLIENT │   │  ADMIN  │
           └────┬───┘    └────┬───┘   └────┬────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
       ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐
       │  SHIFTS │◄─────┤  PAYMENTS │    │   TRUST   │
       │ Machine │      │ Lifecycle │    │   Score   │
       └────┬────┘      └─────┬─────┘    └─────┬─────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                        ┌─────▼─────┐
                        │  SUPABASE │
                        │  Database │
                        │    +RLS   │
                        └───────────┘
```

---

## 📊 Модель данных (связи)

```
users (Supabase Auth)
├── role: worker | client | shef | admin
│
├──► worker_profiles
│    ├── trust_score (0-100)
│    ├── rating (1.0-5.0)
│    ├── is_blocked
│    ├── phone_verified
│    └── documents[]
│
├──► client_profiles
│    ├── trust_score (0-100)
│    ├── rating (1.0-5.0)
│    ├── is_blocked
│    ├── company_inn
│    └── payment_method_verified
│
└──► trust_events
     ├── event_type (unpaid_shift, no_show, etc)
     ├── impact (-30, +5, etc)
     └── severity (low, medium, high)

shifts
├── status: draft → open → in_progress → completed
│                ↓      ↓        ↓            ↓
│           cancelled cancelled disputed  disputed
│
├──► shift_applications
│    ├── worker_id
│    └── status: pending → accepted | rejected
│
├──► shift_assignments
│    ├── worker_id
│    ├── check_in_time + location
│    └── check_out_time
│
├──► payments
│    ├── status: pending → paid | overdue
│    ├── yukassa_payment_id
│    └── deadline: 24h after completion
│
├──► worker_payouts
│    ├── worker_id
│    ├── amount (85% of shift_amount)
│    └── status: pending → paid
│
├──► disputes
│    ├── raised_by (client | worker)
│    ├── status: open → under_review → resolved
│    └── resolution (admin decision)
│
└──► messages
     ├── sender_id
     ├── content
     └── sent_at
```

---

## 🔄 Основные флоу (ветки)

### 1. WORKER FLOW

```
Registration
    ↓
Profile Setup
    ↓
Document Upload (passport)
    ↓
Phone Verification
    ↓
┌─────────────┐
│ Find Shifts │ (search + filters)
└──────┬──────┘
       ↓
┌─────────────┐
│    Apply    │ (send application)
└──────┬──────┘
       ↓
   Wait for
   acceptance
       ↓
┌─────────────┐
│  Check-in   │ (geo + time)
└──────┬──────┘
       ↓
   Work shift
       ↓
┌─────────────┐
│  Check-out  │ (geo + time)
└──────┬──────┘
       ↓
   Wait 24h
   for payment
       ↓
┌─────────────┐
│   Payout    │ (2-3 days)
└──────┬──────┘
       ↓
   Rate client
       ↓
trust_score += 2
```

### 2. CLIENT FLOW

```
Registration
    ↓
Company Setup
    ↓
Payment Method (optional test payment 100₽)
    ↓
Phone Verification
    ↓
┌─────────────┐
│ Create Shift│ (draft)
└──────┬──────┘
       ↓
   Fill details
   (date, rate,
    workers_needed)
       ↓
┌─────────────┐
│   Publish   │ (draft → open)
└──────┬──────┘
       ↓
 Applications
   received
       ↓
┌─────────────┐
│Select Workers│ (accept applications)
└──────┬──────┘
       ↓
Shift starts
 (auto: check-in)
       ↓
Shift completes
 (auto: check-out)
       ↓
┌─────────────┐
│ PAY (24h)   │ ◄── CRITICAL!
└──────┬──────┘
       │
       ├─► On time → trust_score += 5
       │
       └─► Late (>24h) → trust_score -= 30
                       → blocked
                       → worker paid from guarantee fund
       ↓
   Rate worker
       ↓
trust_score += 2
```

### 3. SHIFT LIFECYCLE

```
draft
  │
  │ Client publishes
  ↓
open
  │
  │ Worker check-in
  ↓
in_progress
  │
  │ Worker check-out
  ↓
completed
  │
  ├─► Client pays on time → DONE ✅
  │
  ├─► Client late (>24h) → overdue
  │   └─► trust_score -= 30
  │   └─► worker paid from fund
  │
  └─► Dispute opened → disputed
      └─► Admin resolves → completed | cancelled
```

### 4. CANCELLATION FLOW

```
Shift: open
  │
  │ Client cancels
  ↓
Check time until start
  │
  ├─► >24h  → 100% refund, no penalty ✅
  │
  ├─► 12-24h → 90% refund, -10% fee
  │
  ├─► 2-12h → 70% refund, -30% fee
  │           └─► 30% → workers compensation
  │           └─► trust_score -= 20
  │
  └─► <2h   → BLOCKED ❌ (only admin can cancel)
              └─► 50% refund
              └─► trust_score -= 30
```

### 5. TRUST SCORE FLOW

```
Event happens
  │
  ├─► Positive:
  │   ├─ completed_shift: +2
  │   ├─ paid_on_time: +5
  │   ├─ positive_rating: +5
  │   ├─ inn_verified: +20
  │   └─ passport_verified: +10
  │
  └─► Negative:
      ├─ unpaid_shift: -30 ❌
      ├─ no_show: -20 ❌
      ├─ late_cancellation: -20
      ├─ dispute_lost: -20
      └─ late_payment: -10
  │
  ↓
Update trust_score
  │
  ├─► score >= 80 → Full access ✅
  │
  ├─► score 50-79 → Some limits ⚠️
  │
  ├─► score 30-49 → Heavy limits ⚠️⚠️
  │                 (moderation required)
  │
  └─► score < 30 → BLOCKED ❌
                   (cannot post/apply)
  │
  ↓
Auto-check suspicious
  │
  └─► >3 negative events/week
      └─► is_suspicious = true
          └─► Admin review
```

---

## 🔐 RLS Protection (кто что видит)

```
┌─────────────────────────────────────────────────────┐
│                 WORKER                               │
├─────────────────────────────────────────────────────┤
│ ✅ SELECT: own profile + all shifts (status=open)  │
│ ✅ UPDATE: own profile (except rating/trust_score) │
│ ✅ INSERT: applications (to open shifts)            │
│ ❌ SELECT: other workers' private data              │
│ ❌ UPDATE: any payments                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 CLIENT                               │
├─────────────────────────────────────────────────────┤
│ ✅ SELECT: own shifts + applications + messages     │
│ ✅ INSERT: shifts (new)                             │
│ ✅ UPDATE: own shifts (before start)                │
│ ✅ UPDATE: applications (accept/reject)             │
│ ❌ SELECT: other clients' shifts                    │
│ ❌ UPDATE: worker profiles                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 ADMIN                                │
├─────────────────────────────────────────────────────┤
│ ✅ SELECT: ALL                                       │
│ ✅ UPDATE: ALL                                       │
│ ✅ DELETE: ALL (moderation)                         │
│ ✅ INSERT: trust_events, payments                   │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Ключевые функции/модули

### 1. Shift State Machine
**Файл:** `lib/shift/stateMachine.ts`

```typescript
canTransition(from, to, context) → boolean
  // Проверяет можно ли перейти из статуса в статус

transition(to, context) → { success, effects }
  // Выполняет переход + возвращает побочные эффекты

getAvailableTransitions(status, context) → ShiftStatus[]
  // Список доступных переходов
```

**Тесты:** 36/36 ✅

---

### 2. Trust Score System
**Файл:** `lib/trust/trustScore.ts`

```typescript
createTrustEvent(userId, eventType, shiftId) → TrustEvent
  // Создает событие + обновляет score
  // Автоблокировка если score < 30

getTrustScore(userId) → number (0-100)
  // Текущий trust score

canPerformAction(userId, action) → { allowed, reason }
  // Проверяет можно ли выполнить действие
  // Например: post_shift требует score > 50

getSuspiciousUsers() → User[]
  // Список подозрительных для админки
```

**Database:** `supabase/migrations/023_trust_safety.sql`

---

### 3. Payment Lifecycle (без escrow)
**Модель:** Pay-After-Completion

```typescript
// После completion смены
createPayment(shift) → Payment
  ├─ status: pending
  ├─ deadline: NOW + 24h
  └─ yukassa_payment_id

// Если client оплачивает вовремя
handlePaymentSuccess(payment)
  ├─ status: pending → paid
  ├─ createWorkerPayout(worker, amount * 0.85)
  └─ createTrustEvent(client, 'paid_on_time', +5)

// Если client НЕ оплачивает >24h
handleOverduePayment(payment)  // Cron job
  ├─ createTrustEvent(client, 'unpaid_shift', -30)
  ├─ blockClient(client_id)
  ├─ payFromGuaranteeFund(worker, amount * 0.85)
  └─ createDebt(client, amount)
```

**Гарантийный фонд:**
```
5% от каждой транзакции → в фонд
Если client не платит → платим worker из фонда
Долг остается на client
```

---

### 4. RLS Policies
**Файл:** `supabase/migrations/022_rls_policies.sql`

**Helper функции:**
```sql
is_admin() → boolean
is_worker_owner(worker_profile_id) → boolean
is_client_owner(client_profile_id) → boolean
is_shift_participant(shift_id) → boolean
```

**Политики на каждую таблицу:**
- SELECT, INSERT, UPDATE, DELETE
- Фильтрация по user_id через auth.uid()
- Indexes для производительности

---

### 5. Cron Jobs (нужно реализовать)

```typescript
// Каждый час
checkOverduePayments()
  ├─ Найти смены: completed + payment pending + >24h
  ├─ trust_score -= 30
  ├─ blockClient()
  └─ payFromGuaranteeFund()

// Каждый день
checkExpiredShifts()
  └─ Отменить смены если start_time прошло

// Каждую неделю
calculateTrustScoreStats()
  └─ Обновить trust_score distribution
```

---

## 📁 Структура файлов

```
shef-montazh/
│
├── ARCHITECTURE.md           ← Полная документация (550 строк)
├── PAYMENTS_MVP.md           ← Модель платежей без escrow
├── PROJECT_ASSESSMENT.md     ← Оценка проекта (6.5 → 8.5)
├── ARCHITECTURE_MAP.md       ← ТЫ ЗДЕСЬ (краткая карта)
│
├── lib/
│   ├── shift/
│   │   └── stateMachine.ts   ← Стейт-машина смены
│   │
│   └── trust/
│       └── trustScore.ts     ← Trust score API
│
├── tests/
│   └── lib/
│       └── shift/
│           └── stateMachine.test.ts  ← 36 тестов ✅
│
└── supabase/migrations/
    ├── 022_rls_policies.sql       ← RLS защита
    └── 023_trust_safety.sql       ← Trust events table
```

---

## 🎯 Критические точки (что нужно мониторить)

### 1. Payment Overdue Rate
**Метрика:** % смен где client не оплатил вовремя
**Цель:** <5%
**Действие:** Если >5% → ужесточить trust score или ввести предоплату

### 2. Guarantee Fund Balance
**Метрика:** Баланс фонда / средний месячный оборот
**Цель:** >10% оборота
**Действие:** Если кончается → экстренная предоплата для всех

### 3. Trust Score Distribution
**Метрика:** % пользователей по категориям
**Цель:**
  - >60% score 80+
  - <10% score <50
  - <3% blocked

### 4. Dispute Resolution Time
**Метрика:** Среднее время резолюции спора
**Цель:** <24 часа
**Действие:** Если >24h → нанять больше админов

---

## 🚀 Ready to Launch Checklist

### Critical (DONE ✅)
- [x] RLS policies
- [x] Shift state machine
- [x] Trust score system
- [x] Payment model (без escrow)
- [x] Cancellation policy

### Important (Week 1-2)
- [ ] Cron jobs (overdue payments, trust score)
- [ ] Phone verification
- [ ] Admin alerts dashboard
- [ ] Content moderation (ban-words)

### Nice to Have (Week 2-3)
- [ ] Dashboards UI (worker/client)
- [ ] Activation flows (onboarding)
- [ ] INN verification
- [ ] Passport verification

---

## 📞 Контакты модулей

```
User действие → API endpoint → Supabase (RLS) → Database
                                     ↓
                            Trust Score check
                                     ↓
                         State Machine validation
                                     ↓
                              Side effects:
                            - Payments
                            - Notifications
                            - Trust events
```

---

## 💡 Итого

**Архитектура из 3 столпов:**

1. **RLS (Security)** - кто что видит
2. **State Machine (Logic)** - как меняются статусы
3. **Trust Score (Safety)** - кто надежный

**+ 1 реалистичная модель:**
4. **Pay-After + Guarantee Fund** (Payments без лицензии)

**Всё связано через:**
- Supabase (database + auth + RLS)
- TypeScript (business logic)
- Cron jobs (automation)

**Готовность:** 85% → можно запускать closed beta! 🚀
