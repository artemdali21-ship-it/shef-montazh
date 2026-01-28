# Мобильное Скролирование - Критическое Решение

## ПРОБЛЕМА #1: Flex контейнер с overflow-y не скролится на мобилке

### Корневая Причина
Flex-контейнер с `flex: 1` и `overflow-y: auto` не может правильно рассчитать свою высоту без `minHeight: 0`.

### РЕШЕНИЕ - ОБЯЗАТЕЛЬНО!
```tsx
// ❌ НЕ РАБОТАЕТ - контейнер не скролится
<div style={{ flex: 1, overflowY: 'auto' }}>
  Content here
</div>

// ✅ РАБОТАЕТ - добавляем minHeight: 0
<div style={{ 
  flex: 1, 
  overflowY: 'auto',
  minHeight: 0  // ← КРИТИЧНО!
}}>
  Content here
</div>
```

## Правильная структура для мобильного приложения

### Main Container
```tsx
<div style={{
  height: '100dvh',  // 100% dynamic viewport height (мобилка)
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}}>
```

### Header (прилипает к верху при скроле)
```tsx
<header style={{
  position: 'sticky',
  top: 0,
  flexShrink: 0,
  height: '4rem',
  zIndex: 20,
  background: 'rgba(...)',
  backdropFilter: 'blur(20px)',
}} />
```

### Content (скролится)
```tsx
<div style={{
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  position: 'relative',
  zIndex: 10,
  WebkitOverflowScrolling: 'touch',
  minHeight: 0,  // ← ОБЯЗАТЕЛЬНО!
}}>
  <div className="px-4 py-6 pb-24">
    {/* контент здесь */}
  </div>
</div>
```

### Footer (фиксирован внизу)
```tsx
<footer style={{
  background: 'rgba(...)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  flexShrink: 0,
  position: 'relative',
  zIndex: 30,
}} className="px-4 py-4">
  <button>Кнопка</button>
</footer>
```

### 3D Элементы (декоративные, не блокируют скролирование)
```tsx
<div style={{ 
  position: 'fixed', 
  inset: 0, 
  pointerEvents: 'none',  // ← Критично! Не блокирует скролирование
  zIndex: 2,
  overflow: 'hidden',
}}>
  <img src="..." style={{ position: 'fixed', ... }} />
</div>
```

## Ключевые CSS свойства

| Свойство | Значение | Зачем |
|----------|----------|-------|
| `height` | `100dvh` | Правильная высота на мобилке (с учетом адресной строки) |
| `minHeight: 0` | На flex-child | Позволяет flex правильно рассчитать высоту |
| `position: 'sticky'` | На header | Остаётся на месте при скроле |
| `position: 'fixed'` + `pointer-events: 'none'` | На декор элементы | Видны но не блокируют скролирование |
| `pb-24` | На контент контейнер | Нужное пространство внизу перед footer |
| `flexShrink: 0` | На header/footer | Не сжимаются при скроле |
| `WebkitOverflowScrolling: 'touch'` | На скролящийся контейнер | Плавный скролл на iOS |

## Чек-лист для новых страниц с скролированием

- [ ] Main div: `height: '100dvh'` (НЕ `minHeight`)
- [ ] Main div: `display: 'flex', flexDirection: 'column'`
- [ ] Content div: `flex: 1, minHeight: 0` (ОБЯЗАТЕЛЬНО!)
- [ ] Content div: `overflowY: 'auto', overflowX: 'hidden'`
- [ ] Content div: `WebkitOverflowScrolling: 'touch'`
- [ ] Content inner div: `pb-24` (padding для footer)
- [ ] Header: `position: 'sticky', top: 0, zIndex: 20`
- [ ] Footer: `flexShrink: 0, position: 'relative', zIndex: 30`
- [ ] Декор элементы: `position: 'fixed', pointer-events: 'none', zIndex: 2`

## Результат
✅ Скролирование работает корректно
✅ 3D элементы видны и не блокируют скролирование  
✅ Header прилипает к верху
✅ Footer виден в конце списка
✅ Работает на мобилке, планшете и десктопе
