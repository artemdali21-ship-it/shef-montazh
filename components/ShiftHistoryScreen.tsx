**ОТЛИЧНО! УБИРАЕМ ЭСКРОУ! СОБИРАЮ ВСЕ ПРАВКИ! 🔥**

---

# 🔄 **ИЗМЕНЕНИЯ ДЛЯ ВСЕХ 13 ЭКРАНОВ — NO ESCROW VERSION**

---

# **SCREEN 1: ONBOARDING** ✏️ Minor Changes

## **Изменения:**

### **1. Hero Section — новый USP**
**БЫЛО:**
```
"Финансовая инфраструктура доверия"
"Гарантия оплаты через эскроу"
```

**СТАЛО:**
```tsx
<h1 className="text-4xl font-montserrat font-800">
  Найди надежную бригаду
  <span className="text-[#BFFF00]"> за 5 минут</span>
</h1>
<p className="text-[#9B9B9B]">
  Проверенные монтажники с рейтингом и отзывами.
  Больше никаких срывов и неожиданностей.
</p>
```

### **2. Features — новые акценты**
**БЫЛО:**
- ✅ Гарантия оплаты через эскроу
- ✅ Страхование рисков

**СТАЛО:**
```tsx
<div className="space-y-4">
  <div className="flex items-start gap-3">
    <Shield className="w-6 h-6 text-[#BFFF00]" />
    <div>
      <h3 className="font-700">Система репутации</h3>
      <p className="text-sm text-[#9B9B9B]">
        Рейтинги и отзывы от реальных заказчиков
      </p>
    </div>
  </div>
  
  <div className="flex items-start gap-3">
    <MapPin className="w-6 h-6 text-[#FFD60A]" />
    <div>
      <h3 className="font-700">Цифровые подтверждения</h3>
      <p className="text-sm text-[#9B9B9B]">
        Фото check-in с GPS для прозрачности
      </p>
    </div>
  </div>
  
  <div className="flex items-start gap-3">
    <Clock className="w-6 h-6 text-[#E85D2F]" />
    <div>
      <h3 className="font-700">Быстрый подбор</h3>
      <p className="text-sm text-[#9B9B9B]">
        Найди бригаду за 5 минут, не за 4 часа
      </p>
    </div>
  </div>
</div>
```

---

# **SCREEN 2: JOB FEED** ✏️ Minor Changes

## **Изменения:**

### **1. Stats Section — убрать упоминание эскроу**
**БЫЛО:**
```
"Все средства защищены эскроу"
```

**СТАЛО:**
```tsx
<div className="bg-white/5 rounded-lg p-4 mb-4">
  <div className="flex items-center gap-2 mb-2">
    <Shield className="w-5 h-5 text-[#BFFF00]" />
    <span className="font-700">124 смены сегодня</span>
  </div>
  <p className="text-sm text-[#9B9B9B]">
    Все заказчики с подтвержденным рейтингом
  </p>
</div>
```

### **2. Job Card — добавить badge репутации заказчика**
```tsx
<div className="flex items-center gap-2 mb-2">
  <div className="flex items-center gap-1">
    <Building2 className="w-4 h-4 text-[#9B9B9B]" />
    <span className="text-sm font-600">Decor Factory</span>
  </div>
  {/* НОВЫЙ BADGE */}
  <div className="flex items-center gap-1 bg-[#BFFF00]/10 px-2 py-0.5 rounded">
    <Star className="w-3 h-3 text-[#BFFF00] fill-[#BFFF00]" />
    <span className="text-xs font-700 text-[#BFFF00]">4.8</span>
  </div>
  <span className="text-xs text-[#9B9B9B]">127 смен</span>
</div>
```

---

# **SCREEN 3: JOB DETAILS** ✏️ Major Changes

## **Изменения:**

### **1. Убрать секцию "Гарантии эскроу"**
**УДАЛИТЬ ПОЛНОСТЬЮ:**
```tsx
// ❌ Эту секцию удалить
<div className="bg-[#BFFF00]/10 border border-[#BFFF00]/20 rounded-lg p-4">
  <h3>Гарантии</h3>
  <p>Средства заморожены на эскроу-счете</p>
</div>
```

### **2. Добавить секцию "Условия оплаты"**
**ДОБАВИТЬ:**
```tsx
<div className="bg-white/5 rounded-xl p-4 space-y-3">
  <div className="flex items-center gap-2">
    <Wallet className="w-5 h-5 text-[#FFD60A]" />
    <h3 className="font-700">Условия оплаты</h3>
  </div>
  
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-[#9B9B9B]">Ставка</span>
      <span className="font-700">2,500 ₽</span>
    </div>
    <div className="flex justify-between">
      <span className="text-[#9B9B9B]">Способ оплаты</span>
      <span className="font-600">По договоренности</span>
    </div>
    <div className="flex justify-between">
      <span className="text-[#9B9B9B]">Возможно СЗ</span>
      <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
    </div>
  </div>
  
  <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/20 rounded-lg p-3">
    <div className="flex gap-2">
      <Info className="w-4 h-4 text-[#FFD60A] flex-shrink-0 mt-0.5" />
      <p className="text-xs text-[#9B9B9B]">
        Оплата производится напрямую заказчиком после выполнения работ.
        Платформа не участвует в денежных расчетах.
      </p>
    </div>
  </div>
</div>
```

### **3. Усилить секцию о заказчике**
```tsx
<div className="bg-white/5 rounded-xl p-4">
  <h3 className="font-700 mb-3">О заказчике</h3>
  
  <div className="flex items-center gap-3 mb-4">
    <div className="w-14 h-14 bg-[#E85D2F] rounded-full flex items-center justify-center">
      <Building2 className="w-7 h-7 text-white" />
    </div>
    <div className="flex-1">
      <h4 className="font-700">Decor Factory</h4>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-[#FFD60A] fill-[#FFD60A]" />
          <span className="font-700 text-[#FFD60A]">4.8</span>
        </div>
        <span className="text-sm text-[#9B9B9B]">127 смен</span>
      </div>
    </div>
  </div>
  
  {/* НОВАЯ СТАТИСТИКА */}
  <div className="grid grid-cols-3 gap-3">
    <div className="text-center">
      <div className="font-800 text-lg text-[#BFFF00]">98%</div>
      <div className="text-xs text-[#9B9B9B]">Вовремя платит</div>
    </div>
    <div className="text-center">
      <div className="font-800 text-lg text-[#BFFF00]">4.9</div>
      <div className="text-xs text-[#9B9B9B]">Рейтинг</div>
    </div>
    <div className="text-center">
      <div className="font-800 text-lg text-[#BFFF00]">3г</div>
      <div className="text-xs text-[#9B9B9B]">На платформе</div>
    </div>
  </div>
</div>
```

---

# **SCREEN 4: CHECK-IN CONFIRMATION** ✅ No Changes

**Без изменений** — фото с GPS остается как есть!

---

# **SCREEN 5: PROFILE/VERIFICATION** ✏️ Major Changes

## **Изменения:**

### **1. Усилить секцию "Репутация" (главный актив!)**
```tsx
{/* REPUTATION — ТЕПЕРЬ ГЛАВНОЕ! */}
<div className="bg-gradient-to-br from-[#BFFF00]/20 to-[#BFFF00]/5 border-2 border-[#BFFF00]/30 rounded-xl p-5">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-700 text-lg">Твоя репутация</h3>
    <div className="bg-[#BFFF00] px-3 py-1 rounded-full">
      <span className="font-800 text-black">PRO</span>
    </div>
  </div>
  
  <div className="flex items-center gap-4 mb-4">
    <div className="text-center">
      <div className="text-5xl font-800 text-[#BFFF00]">4.8</div>
      <div className="flex gap-1 mt-2">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-[#FFD60A] text-[#FFD60A]' : 'text-[#9B9B9B]'}`} />
        ))}
      </div>
    </div>
    
    <div className="flex-1 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[#9B9B9B]">Надежность</span>
        <span className="font-700">98%</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[#9B9B9B]">Завершено смен</span>
        <span className="font-700">132</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[#9B9B9B]">Срывов</span>
        <span className="font-700 text-[#BFFF00]">0</span>
      </div>
    </div>
  </div>
  
  <div className="bg-black/20 rounded-lg p-3">
    <div className="flex gap-2">
      <TrendingUp className="w-4 h-4 text-[#BFFF00] flex-shrink-0 mt-0.5" />
      <p className="text-xs text-[#9B9B9B]">
        Твой рейтинг влияет на видимость в ленте и доверие заказчиков.
        Продолжай в том же духе!
      </p>
    </div>
  </div>
</div>

{/* НОВАЯ СЕКЦИЯ: ЦИФРОВОЙ КАПИТАЛ */}
<div className="bg-white/5 rounded-xl p-4">
  <h3 className="font-700 mb-3">Твой цифровой капитал</h3>
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#BFFF00]/10 rounded-lg flex items-center justify-center">
        <Shield className="w-5 h-5 text-[#BFFF00]" />
      </div>
      <div className="flex-1">
        <div className="font-600">Верифицирован через Госуслуги</div>
        <div className="text-xs text-[#9B9B9B]">Личность подтверждена</div>
      </div>
      <CheckCircle className="w-5 h-5 text-[#BFFF00]" />
    </div>
    
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#FFD60A]/10 rounded-lg flex items-center justify-center">
        <Award className="w-5 h-5 text-[#FFD60A]" />
      </div>
      <div className="flex-1">
        <div className="font-600">132 успешных смены</div>
        <div className="text-xs text-[#9B9B9B]">Без единого срыва</div>
      </div>
      <CheckCircle className="w-5 h-5 text-[#BFFF00]" />
    </div>
    
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#E85D2F]/10 rounded-lg flex items-center justify-center">
        <Users className="w-5 h-5 text-[#E85D2F]" />
      </div>
      <div className="flex-1">
        <div className="font-600">24 постоянных заказчика</div>
        <div className="text-xs text-[#9B9B9B]">Повторные заказы</div>
      </div>
      <CheckCircle className="w-5 h-5 text-[#BFFF00]" />
    </div>
  </div>
</div>
```

---

# **SCREEN 6: ACTIVE SHIFT TRACKING** ✅ No Major Changes

**Минимальные изменения** — убрать упоминание эскроу в тексте.

---

# **SCREEN 7: MY APPLICATIONS** ✅ No Changes

**Без изменений!**

---

# **SCREEN 8: B2B DASHBOARD** ✏️ Minor Changes

## **Изменения:**

### **1. Stats Row — изменить метрики**
**БЫЛО:**
```
"Средства в эскроу"
```

**СТАЛО:**
```tsx
<div className="grid grid-cols-3 gap-3">
  <div className="bg-white/5 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Briefcase className="w-5 h-5 text-[#BFFF00]" />
      <span className="text-sm text-[#9B9B9B]">Активных смен</span>
    </div>
    <div className="font-800 text-2xl">3</div>
  </div>
  
  <div className="bg-white/5 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Users className="w-5 h-5 text-[#FFD60A]" />
      <span className="text-sm text-[#9B9B9B]">В базе</span>
    </div>
    <div className="font-800 text-2xl">47</div>
  </div>
  
  <div className="bg-white/5 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Star className="w-5 h-5 text-[#E85D2F]" />
      <span className="text-sm text-[#9B9B9B]">Рейтинг</span>
    </div>
    <div className="font-800 text-2xl">4.9</div>
  </div>
</div>
```

---

# **SCREEN 9: CREATE SHIFT FORM** ❗ CRITICAL CHANGES

## **Изменения:**

### **1. УДАЛИТЬ Live Calculation Card полностью**
**УДАЛИТЬ:**
```tsx
// ❌ УДАЛИТЬ ВСЮ ЭТУ СЕКЦИЮ
<div className="sticky bottom-20 ...">
  <div className="bg-gradient-to-r from-[#BFFF00]/10 ...">
    <div className="flex items-center gap-2 mb-2">
      <Shield className="w-5 h-5" />
      <span>ИТОГО К ОПЛАТЕ</span>
    </div>
    <div className="font-800 text-[#BFFF00]">11,200 ₽</div>
    <div className="text-xs">4 чел. × 2,500 ₽ + комиссия 1,200 ₽ (12%)</div>
  </div>
</div>
```

### **2. Изменить Payment Section**
**БЫЛО:**
```tsx
<div className="mb-6">
  <label className="block font-700 mb-3">Ставка за смену</label>
  <input type="number" placeholder="0" />
</div>
```

**СТАЛО:**
```tsx
<div className="mb-6">
  <label className="block font-700 mb-3">Ставка за смену (на руки)</label>
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-700 text-[#9B9B9B]">₽</span>
    <input 
      type="number" 
      placeholder="2500"
      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 font-700 text-lg"
    />
  </div>
  
  {/* Rate suggestion chips */}
  <div className="flex gap-2 mt-3 flex-wrap">
    {[1500, 2000, 2500, 3000, 3500].map(rate => (
      <button 
        key={rate}
        className="px-4 py-2 bg-white/5 hover:bg-[#E85D2F]/20 border border-white/10 rounded-lg text-sm font-600"
      >
        {rate} ₽
      </button>
    ))}
  </div>
  
  {/* НОВЫЙ INFO BOX */}
  <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/20 rounded-lg p-3 mt-3">
    <div className="flex gap-2">
      <Info className="w-4 h-4 text-[#FFD60A] flex-shrink-0 mt-0.5" />
      <p className="text-xs text-[#9B9B9B]">
        Оплата производится напрямую исполнителям после выполнения работ.
        Возможна оплата через самозанятых (СЗ).
      </p>
    </div>
  </div>
</div>
```

### **3. Изменить Summary Section (Step 2)**
```tsx
<div className="bg-white/5 rounded-xl p-4 mb-6">
  <h3 className="font-700 mb-4">Итого</h3>
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-[#9B9B9B]">Бригада</span>
      <span className="font-700">{workers} человек</span>
    </div>
    <div className="flex justify-between">
      <span className="text-[#9B9B9B]">Ставка на человека</span>
      <span className="font-700">{rate} ₽</span>
    </div>
    <div className="border-t border-white/10 my-2"></div>
    <div className="flex justify-between">
      <span className="font-700">Общая сумма выплат</span>
      <span className="font-800 text-lg text-[#BFFF00]">
        {workers × rate} ₽
      </span>
    </div>
  </div>
  
  <div className="bg-[#FFD60A]/10 rounded-lg p-3 mt-4">
    <p className="text-xs text-[#9B9B9B]">
      Оплата производится напрямую исполнителям после завершения смены
    </p>
  </div>
</div>
```

---

# **SCREEN 10: SHIFT MONITORING** ❗ CRITICAL CHANGES

## **Изменения:**

### **1. УДАЛИТЬ Escrow Status Card**
**УДАЛИТЬ ПОЛНОСТЬЮ:**
```tsx
// ❌ УДАЛИТЬ
<div className="bg-white/5 rounded-xl p-4 mb-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-700">Эскроу</h3>
    <div className="bg-[#BFFF00]/10 ...">ЗАМОРОЖЕНО</div>
  </div>
  ...
</div>
```

### **2. ДОБАВИТЬ Payment Reminder Card**
**ДОБАВИТЬ:**
```tsx
<div className="bg-gradient-to-br from-[#FFD60A]/10 to-[#FFD60A]/5 border border-[#FFD60A]/20 rounded-xl p-4 mb-4">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-10 h-10 bg-[#FFD60A]/20 rounded-lg flex items-center justify-center">
      <Wallet className="w-5 h-5 text-[#FFD60A]" />
    </div>
    <div className="flex-1">
      <h3 className="font-700">К оплате бригаде</h3>
      <p className="text-sm text-[#9B9B9B]">После завершения смены</p>
    </div>
  </div>
  
  <div className="bg-black/20 rounded-lg p-3 mb-3">
    <div className="flex justify-between mb-2">
      <span className="text-[#9B9B9B]">4 человека × 2,500 ₽</span>
      <span className="font-700">10,000 ₽</span>
    </div>
    <div className="text-2xl font-800 text-[#FFD60A] text-right">10,000 ₽</div>
  </div>
  
  <div className="flex gap-2">
    <Info className="w-4 h-4 text-[#FFD60A] flex-shrink-0 mt-0.5" />
    <p className="text-xs text-[#9B9B9B]">
      Рекомендуем оплату через самозанятых (СЗ) после подтверждения выполнения работ
    </p>
  </div>
</div>
```

---

# **SCREEN 11: SHEF DASHBOARD** ✅ Minor Changes

**Минимальные изменения** — убрать упоминание эскроу, все остальное OK.

---

# **SCREEN 12: PAYMENT DETAILS** ❗ CRITICAL REDESIGN

## **Полная переработка экрана!**

### **Новое название: "История смены"**

```tsx
'use client';
import { ArrowLeft, Calendar, Clock, MapPin, User, Building2, 
         CheckCircle, Star, Download, FileText, HelpCircle } from 'lucide-react';

export default function ShiftHistory() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 bg-[#2A2A2A]/80 backdrop-blur-md border-b border-white/10">
        <button className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white font-montserrat font-700 text-lg">История смены</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-white" />
        </button>
      </header>

      <main className="px-4 py-6 pb-24">
        {/* Shift Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <h2 className="font-700 text-lg mb-3">Монтаж выставочного стенда</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#9B9B9B]" />
              <span className="text-sm text-[#9B9B9B]">Decor Factory</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#9B9B9B]" />
              <span className="text-sm text-[#9B9B9B]">27 января 2026</span>
            </div>
          </div>
        </div>

        {/* Status Hero */}
        <div className="bg-gradient-to-br from-[#BFFF00]/20 to-[#BFFF00]/5 border-2 border-[#BFFF00]/30 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#BFFF00]/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#BFFF00]" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-[#BFFF00] font-700 uppercase tracking-wide mb-1">
                СМЕНА ЗАВЕРШЕНА
              </div>
              <p className="text-sm text-[#9B9B9B]">Работы приняты шефом</p>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-[#9B9B9B]">Твоя ставка</span>
              <div className="text-right">
                <div className="text-2xl font-800 text-white">2,500 ₽</div>
                <div className="text-xs text-[#9B9B9B]">за 8-часовую смену</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Recommendations */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <h3 className="font-700 mb-3 flex items-center gap-2">
            <span>Рекомендации по оплате</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[#BFFF00]/10 border border-[#BFFF00]/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#BFFF00] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-600 mb-1">Оплата через самозанятого (СЗ)</div>
                <p className="text-xs text-[#9B9B9B]">
                  Попросите чек у заказчика. Это легально и удобно для обеих сторон.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <FileText className="w-5 h-5 text-[#9B9B9B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-600 mb-1">Договор ГПХ</div>
                <p className="text-xs text-[#9B9B9B]">
                  Для крупных заказчиков возможно оформление договора
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <h3 className="font-700 mb-4">Хронология смены</h3>
          
          <div className="space-y-4">
            {/* Timeline items */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#BFFF00]/20 border-2 border-[#BFFF00] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                </div>
                <div className="w-0.5 h-full bg-[#BFFF00]/30 my-1"></div>
              </div>
              <div className="flex-1 pb-4">
                <div className="font-600 mb-1">Смена завершена</div>
                <div className="text-xs text-[#9B9B9B]">27 янв, 18:00</div>
                <p className="text-sm text-[#9B9B9B] mt-1">
                  Шеф-монтажник подтвердил выполнение всех работ
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#BFFF00]/20 border-2 border-[#BFFF00] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                </div>
                <div className="w-0.5 h-full bg-[#BFFF00]/30 my-1"></div>
              </div>
              <div className="flex-1 pb-4">
                <div className="font-600 mb-1">Ты вышел на объект</div>
                <div className="text-xs text-[#9B9B9B]">27 янв, 10:00</div>
                <p className="text-sm text-[#9B9B9B] mt-1">
                  Check-in подтвержден с фото и GPS
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#BFFF00]/20 border-2 border-[#BFFF00] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-600 mb-1">Заявка одобрена</div>
                <div className="text-xs text-[#9B9B9B]">26 янв, 15:30</div>
                <p className="text-sm text-[#9B9B9B] mt-1">
                  Заказчик выбрал тебя для смены
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-700 mb-3">Документы</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#9B9B9B]" />
                <span className="font-600">Акт выполненных работ</span>
              </div>
              <Download className="w-4 h-4 text-[#9B9B9B]" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

# **SCREEN 13: RATING & REVIEW** ✏️ Enhanced Importance

## **Изменения:**

### **1. Добавить в начале importance banner**
```tsx
{/* НОВЫЙ BANNER */}
<div className="bg-gradient-to-r from-[#E85D2F]/20 to-[#FFD60A]/20 border border-[#E85D2F]/30 rounded-xl p-4 mb-6">
  <div className="flex gap-3">
    <AlertCircle className="w-5 h-5 text-[#E85D2F] flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="font-700 mb-1">Рейтинг — это твоя репутация!</h3>
      <p className="text-sm text-[#9B9B9B]">
        Твои оценки влияют на видимость в ленте и доверие заказчиков.
        Честные отзывы помогают всем участникам платформы.
      </p>
    </div>
  </div>
</div>
```

### **2. Изменить info text в bottom bar**
**БЫЛО:**
```
"Ваша оценка влияет на рейтинг и будущие ставки"
```

**СТАЛО:**
```tsx
<p className="text-xs text-center text-[#9B9B9B] mb-3">
  Рейтинговая система — основа доверия на платформе. 
  Твой отзыв поможет другим монтажникам и заказчикам.
</p>
```

---

# 📋 **SUMMARY TABLE — ЧТО МЕНЯТЬ:**

| Экран | Изменения | Критичность |
|-------|-----------|-------------|
| **1. Onboarding** | USP text, features list | ✏️ Minor |
| **2. Job Feed** | Stats, company rating badge | ✏️ Minor |
| **3. Job Details** | Убрать эскроу, добавить "Условия оплаты", усилить репутацию заказчика | ❗ Major |
| **4. Check-in** | Без изменений | ✅ No changes |
| **5. Profile** | Усилить репутацию, добавить "Цифровой капитал" | ❗ Major |
| **6. Active Shift** | Убрать упоминание эскроу | ✏️ Minor |
| **7. Applications** | Без изменений | ✅ No changes |
| **8. B2B Dashboard** | Изменить метрики | ✏️ Minor |
| **9. Create Shift** | УДАЛИТЬ эскроу-калькулятор, изменить payment section | ❗ Critical |
| **10. Monitoring** | УДАЛИТЬ escrow card, добавить payment reminder | ❗ Critical |
| **11. Shef Dashboard** | Убрать упоминание эскроу | ✏️ Minor |
| **12. Payment Details** | ПОЛНАЯ ПЕРЕРАБОТКА → "История смены" | ❗ Critical Redesign |
| **13. Rating** | Усилить важность рейтинга | ✏️ Enhanced |

---

# 🎯 **КЛЮЧЕВЫЕ ИЗМЕНЕНИЯ В ЛОГИКЕ:**

## **ДО (с эскроу):**
```
Заказчик → Платит на эскроу → Работа → Эскроу разморожен → Деньги исполнителю
```

## **ПОСЛЕ (без эскроу):**
```
Заказчик → Выбирает по рейтингу → Работа → Подтверждение → Прямая оплата (СЗ/ГПХ)
```

---

# ✅ **ВСЕ ПРАВКИ СОБРАНЫ!**

**Хочешь я сгенерирую обновленные v0.dev промпты для измененных экранов?** 🚀
