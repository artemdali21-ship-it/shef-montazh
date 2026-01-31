# 03_STATE_MACHINES.md

> **Последнее обновление:** 31.01.2026  
> **Статус:** Проектирование

---

## 🔄 МАШИНЫ СОСТОЯНИЙ

Все критичные сущности имеют чёткие статусы и переходы.

---

## 1️⃣ SHIFT STATUS (статусы смены)

```
open
  ↓ [worker applies]
applications
  ↓ [client accepts worker]
confirmed
  ↓ [worker checks in]
in_progress
  ↓ [both confirm completion]
completed
  ↓ [both rate each other]
rated
  ↓ [client pays]
paid
```

### Статусы

| Статус | Описание | Может изменить |
|--------|----------|----------------|
| `open` | Смена опубликована, ждёт откликов | client (отменить) |
| `applications` | Есть отклики | client (одобрить/отклонить) |
| `confirmed` | Исполнитель назначен | worker (выйти), client (отменить) |
| `in_progress` | Исполнитель на объекте | worker (завершить) |
| `completed` | Обе стороны подтвердили завершение | - (авто → rated) |
| `rated` | Обе стороны оценили друг друга | client (оплатить) |
| `paid` | Оплачено | - (финальное) |
| `cancelled` | Отменено | - (финальное) |

### Переходы

```typescript
type ShiftStatus = 
  | 'open'
  | 'applications'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'rated'
  | 'paid'
  | 'cancelled'

const canTransition = (from: ShiftStatus, to: ShiftStatus): boolean => {
  const transitions: Record<ShiftStatus, ShiftStatus[]> = {
    'open': ['applications', 'cancelled'],
    'applications': ['confirmed', 'cancelled'],
    'confirmed': ['in_progress', 'cancelled'],
    'in_progress': ['completed'],
    'completed': ['rated'],
    'rated': ['paid'],
    'paid': [],
    'cancelled': []
  }
  
  return transitions[from]?.includes(to) ?? false
}
```

---

## 2️⃣ APPLICATION STATUS (статусы отклика)

```
pending
  ↓ [client reviews]
accepted / rejected
```

### Статусы

| Статус | Описание | Действия |
|--------|----------|----------|
| `pending` | Ожидает рассмотрения | client: принять/отклонить |
| `accepted` | Одобрено | → создаётся shift_worker |
| `rejected` | Отклонено | - (финал) |
| `cancelled` | Отменён самим worker | - (финал) |

### Правила
- Worker может отменить только `pending`
- Client может принять только `pending`
- Нельзя откликнуться дважды на одну смену

---

## 3️⃣ SHIFT_WORKER STATUS (статусы работника на смене)

```
assigned
  ↓ [check-in initiated]
on_way
  ↓ [check-in с фото + геолокация]
checked_in
  ↓ [shift end time + worker confirms]
completed
```

### Статусы

| Статус | Описание | Триггер |
|--------|----------|---------|
| `assigned` | Назначен на смену | application accepted |
| `on_way` | В пути (опционально) | worker нажал "Выехал" |
| `checked_in` | Прибыл на объект | фото + геолокация |
| `completed` | Завершил работу | worker подтвердил завершение |

### Check-in логика

```typescript
interface CheckInData {
  photo_url: string        // обязательно
  latitude: number         // обязательно
  longitude: number        // обязательно
  timestamp: Date          // автоматически
}

// Проверка геолокации
const isValidCheckIn = (
  shiftLat: number,
  shiftLng: number,
  checkInLat: number,
  checkInLng: number
): boolean => {
  const distance = calculateDistance(
    shiftLat, shiftLng,
    checkInLat, checkInLng
  )
  
  return distance < 100 // метров
}
```

---

## 4️⃣ PAYMENT STATUS (статусы платежа)

```
pending
  ↓ [client initiates payment]
processing
  ↓ [ЮКасса webhook]
paid / failed
```

### Статусы

| Статус | Описание | Источник |
|--------|----------|----------|
| `pending` | Ожидает оплаты | создан после rated |
| `processing` | В обработке | ЮКасса |
| `paid` | Оплачено | ЮКасса webhook |
| `failed` | Ошибка оплаты | ЮКасса webhook |
| `refunded` | Возвращено | admin действие |

---

## 5️⃣ USER STATUS (статус пользователя)

### Worker
```typescript
type WorkerStatus = 
  | 'available'  // доступен для смен
  | 'busy'       // занят
  | 'banned'     // забанен
```

### Ban логика
```typescript
interface BanData {
  reason: string
  ban_until: Date | null  // null = перманентный
}

// Автобан после 3 срывов подряд
const shouldAutoBan = (user: User): boolean => {
  const recentShifts = getRecentShifts(user.id, 10)
  const noShows = recentShifts.filter(s => s.no_show).length
  
  return noShows >= 3
}
```

---

## 📊 ВИЗУАЛИЗАЦИЯ ОСНОВНОГО ФЛОУ

```
CLIENT создаёт смену
         ↓
    [shift.status = 'open']
         ↓
WORKER откликается
         ↓
    [application.status = 'pending']
         ↓
CLIENT одобряет
         ↓
    [application.status = 'accepted']
    [shift.status = 'confirmed']
    [shift_worker создаётся, status = 'assigned']
         ↓
WORKER делает check-in
         ↓
    [shift_worker.status = 'checked_in']
    [shift.status = 'in_progress']
         ↓
WORKER завершает
         ↓
    [shift_worker.status = 'completed']
         ↓
CLIENT подтверждает
         ↓
    [shift.status = 'completed']
         ↓
ОБЕ СТОРОНЫ оценивают
         ↓
    [shift.status = 'rated']
    [2 записи в ratings]
         ↓
CLIENT оплачивает
         ↓
    [payment.status = 'paid']
    [shift.status = 'paid']
         ↓
         ✅ ЗАВЕРШЕНО
```

---

## 🚨 EDGE CASES

### 1. Worker не вышел на смену
```
shift.status = 'confirmed'
  ↓ [start_time + 30 min, no check-in]
→ shift.status = 'cancelled'
→ worker.ban_count += 1
→ notification to client
→ compensation (if insurance)
```

### 2. Client отменяет после подтверждения
```
shift.status = 'confirmed'
  ↓ [client cancels]
→ shift.status = 'cancelled'
→ notification to worker
→ client.reputation -= 1
→ worker может оставить отзыв
```

### 3. Спор по завершению
```
shift.status = 'in_progress'
  ↓ [worker says done, client says no]
→ shift.status = 'dispute'
→ admin review
→ manual resolution
```

---

## ⚙️ ТРИГГЕРЫ И АВТОМАТИЗАЦИЯ

### Supabase Triggers (планируется)

```sql
-- Автообновление рейтинга после новой оценки
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET rating = (
    SELECT AVG(rating)
    FROM ratings
    WHERE to_user_id = NEW.to_user_id
  )
  WHERE id = NEW.to_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rating_updated
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();
```

---

**Все переходы состояний валидируются на уровне API.**
