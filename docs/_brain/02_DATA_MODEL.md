# 02_DATA_MODEL.md

> **Последнее обновление:** 31.01.2026  
> **Статус:** MVP (9-10 таблиц)

---

## 🗄️ SUPABASE DATABASE SCHEMA

### Ключевые принципы
- **RLS включен** на всех таблицах
- **UUID** для всех ID
- **created_at/updated_at** везде
- **Soft deletes** (is_deleted) для критичных данных
- **JSONB** для гибких данных (preferences, metadata)

---

## 📊 ТАБЛИЦЫ

### 1. users
**Описание:** Основные профили всех пользователей

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'worker' | 'client' | 'shef'
  avatar_url TEXT,
  
  -- Верификация
  is_verified BOOLEAN DEFAULT false,
  gosuslugi_verified BOOLEAN DEFAULT false,
  
  -- Репутация
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_shifts INTEGER DEFAULT 0,
  successful_shifts INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_telegram ON users(telegram_id);
```

**Связи:**
- → worker_profiles (1:1)
- → client_profiles (1:1)
- → shifts (1:N как заказчик)
- → applications (1:N как исполнитель)
- → ratings (1:N как оценивающий/оцениваемый)

---

### 2. worker_profiles
**Описание:** Дополнительные данные исполнителей

```sql
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Навыки и специализация
  categories TEXT[], -- ['montazhnik', 'dekorator', 'elektrik']
  bio TEXT,
  experience_years INTEGER,
  tools_available TEXT[], -- ['shurupovert', 'boltorez']
  
  -- Статус
  status VARCHAR(20) DEFAULT 'available', -- 'available' | 'busy' | 'banned'
  ban_reason TEXT,
  ban_until TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_worker_user ON worker_profiles(user_id);
CREATE INDEX idx_worker_status ON worker_profiles(status);
```

**Связи:**
- → users (N:1)

---

### 3. client_profiles
**Описание:** Дополнительные данные заказчиков

```sql
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Компания
  company_name VARCHAR(200),
  company_inn VARCHAR(12),
  legal_address TEXT,
  contact_person VARCHAR(100),
  
  -- Статистика
  shifts_published INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_client_user ON client_profiles(user_id);
```

**Связи:**
- → users (N:1)

---

### 4. shifts
**Описание:** Смены (заказы)

```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id),
  
  -- Основная информация
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'montazhnik', 'dekorator'...
  
  -- Локация
  location_address TEXT NOT NULL,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  
  -- Время
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Оплата и требования
  pay_amount DECIMAL(10,2) NOT NULL,
  required_workers INTEGER DEFAULT 1,
  required_rating DECIMAL(3,2) DEFAULT 0,
  tools_required TEXT[],
  
  -- Статус
  status VARCHAR(20) DEFAULT 'open', 
  -- 'open' | 'in_progress' | 'completed' | 'cancelled'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shifts_client ON shifts(client_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_category ON shifts(category);
```

**Связи:**
- → users (N:1 как client)
- → applications (1:N)
- → shift_workers (1:N)
- → ratings (1:N)
- → payments (1:N)

---

### 5. applications
**Описание:** Отклики исполнителей на смены

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', 
  -- 'pending' | 'accepted' | 'rejected'
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(shift_id, worker_id)
);

CREATE INDEX idx_applications_shift ON applications(shift_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);
```

**Связи:**
- → shifts (N:1)
- → users (N:1 как worker)

---

### 6. shift_workers
**Описание:** Назначенные исполнители на смену (после одобрения)

```sql
CREATE TABLE shift_workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Статус выполнения
  status VARCHAR(20) DEFAULT 'assigned', 
  -- 'assigned' | 'on_way' | 'checked_in' | 'completed'
  
  -- Check-in данные
  check_in_time TIMESTAMP,
  check_in_photo_url TEXT,
  check_in_lat DECIMAL(10,8),
  check_in_lng DECIMAL(11,8),
  
  -- Check-out
  check_out_time TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(shift_id, worker_id)
);

CREATE INDEX idx_shift_workers_shift ON shift_workers(shift_id);
CREATE INDEX idx_shift_workers_worker ON shift_workers(worker_id);
```

**Связи:**
- → shifts (N:1)
- → users (N:1 как worker)

---

### 7. ratings
**Описание:** Оценки после смены

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(shift_id, from_user_id, to_user_id)
);

CREATE INDEX idx_ratings_to ON ratings(to_user_id);
CREATE INDEX idx_ratings_shift ON ratings(shift_id);
```

**Связи:**
- → shifts (N:1)
- → users (N:1 как from)
- → users (N:1 как to)

---

### 8. payments
**Описание:** Платежи через ЮКасса

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id),
  client_id UUID REFERENCES users(id),
  worker_id UUID REFERENCES users(id),
  
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 1200.00,
  
  status VARCHAR(20) DEFAULT 'pending', 
  -- 'pending' | 'paid' | 'failed' | 'refunded'
  
  payment_method VARCHAR(50),
  yukassa_payment_id VARCHAR(100),
  
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_shift ON payments(shift_id);
CREATE INDEX idx_payments_status ON payments(status);
```

**Связи:**
- → shifts (N:1)
- → users (N:1 как client)
- → users (N:1 как worker)

---

### 9. favorites
**Описание:** Избранные исполнители/заказчики

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, favorite_user_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
```

---

### 10. blocked_users
**Описание:** Чёрный список

```sql
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, blocked_user_id)
);

CREATE INDEX idx_blocked_user ON blocked_users(user_id);
```

---

### 11. notifications
**Описание:** История уведомлений

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  data JSONB,
  
  is_read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

---

## 🔗 ДИАГРАММА СВЯЗЕЙ

```
users (центр)
├─→ worker_profiles (1:1)
├─→ client_profiles (1:1)
├─→ shifts (1:N как client)
├─→ applications (1:N как worker)
├─→ favorites (1:N)
└─→ blocked_users (1:N)

shifts
├─→ applications (1:N)
├─→ shift_workers (1:N)
├─→ ratings (1:N)
└─→ payments (1:N)
```

---

## 📝 ПРИМЕРЫ ЗАПРОСОВ

### Получить смены с откликами
```typescript
const { data } = await supabase
  .from('shifts')
  .select(`
    *,
    applications (
      *,
      worker:users (id, full_name, rating)
    )
  `)
  .eq('client_id', userId)
```

### Создать отклик
```typescript
const { data, error } = await supabase
  .from('applications')
  .insert({
    shift_id: shiftId,
    worker_id: userId,
    message: 'Готов выйти!'
  })
```

### Пересчитать рейтинг
```typescript
const { data: ratings } = await supabase
  .from('ratings')
  .select('rating')
  .eq('to_user_id', userId)

const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

await supabase
  .from('users')
  .update({ rating: avgRating })
  .eq('id', userId)
```

---

**Эта схема покрывает MVP.**
