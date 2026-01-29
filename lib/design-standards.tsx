/**
 * ШЕФ-МОНТАЖ PREMIUM DESIGN STANDARDS v3
 * Visual Hierarchy & Professional Layout Guidelines
 * 
 * ОБЯЗАТЕЛЬНО СЛЕДОВАТЬ ЭТИМ СТАНДАРТАМ ДЛЯ ВСЕХ КОМПОНЕНТОВ
 */

// ═══════════════════════════════════════════════════════════
// 1. GRID SYSTEM (8px baseline) - СТРОГО!
// ═══════════════════════════════════════════════════════════

export const SPACING = {
  // Основная шкала (кратна 8px)
  xs: '4px',    // 0.5 - для микроскопических зазоров
  sm: '8px',    // 1 - минимальный gap
  md: '16px',   // 2 - стандартный gap между элементами
  lg: '24px',   // 3 - комфортный отступ
  xl: '32px',   // 4 - просторный отступ
  xxl: '48px',  // 6 - разделение секций
  huge: '64px', // 8 - разделение крупных блоков
} as const;

// Tailwind классы (использовать ТОЛЬКО эти):
// p-3 = 12px ❌ НЕТ!
// p-4 = 16px ✅ ДА (md)
// p-6 = 24px ✅ ДА (lg)
// p-8 = 32px ✅ ДА (xl)

export const PADDING = {
  card: 'p-6',        // 24px для карточек
  section: 'p-8',     // 32px для крупных секций
  compact: 'p-4',     // 16px для компактных элементов
} as const;

export const GAP = {
  tight: 'gap-1',     // 4px
  standard: 'gap-2',  // 8px
  normal: 'gap-4',    // 16px
  comfortable: 'gap-6', // 24px
  spacious: 'gap-8',  // 32px
} as const;

// ═══════════════════════════════════════════════════════════
// 2. VISUAL HIERARCHY (4 уровня)
// ═══════════════════════════════════════════════════════════

export const TYPOGRAPHY = {
  // LEVEL 1 - ДОМИНАНТА (главный заголовок экрана)
  h1: {
    fontSize: 'text-4xl',     // 36px
    fontWeight: 'font-bold',  // 700
    lineHeight: 'leading-tight', // 1.25
    letterSpacing: 'tracking-tight', // -0.02em
    color: 'text-white',
    usage: 'Главный заголовок страницы, первое, что видит пользователь',
  },
  
  // LEVEL 2 - ВТОРИЧНАЯ ИНФОРМАЦИЯ (названия карточек, цены)
  h2: {
    fontSize: 'text-2xl',        // 24px
    fontWeight: 'font-semibold', // 600
    lineHeight: 'leading-snug',  // 1.375
    color: 'text-white',
    usage: 'Заголовки карточек, важные метрики',
  },
  
  // LEVEL 3 - ОСНОВНОЙ КОНТЕНТ (описания, адреса)
  body: {
    fontSize: 'text-base',       // 16px
    fontWeight: 'font-normal',   // 400
    lineHeight: 'leading-relaxed', // 1.625
    letterSpacing: 'tracking-normal',
    color: 'text-gray-300',
    usage: 'Описания, адреса, основной контент',
  },
  
  // LEVEL 4 - МЕТАДАННЫЕ (даты, счетчики)
  meta: {
    fontSize: 'text-sm',         // 14px
    fontWeight: 'font-medium',   // 500
    lineHeight: 'leading-normal', // 1.5
    color: 'text-gray-400',
    usage: 'Даты, время, вспомогательная информация',
  },
} as const;

// ═══════════════════════════════════════════════════════════
// 3. NEGATIVE SPACE (40% холста = пустота!)
// ═══════════════════════════════════════════════════════════

export const WHITESPACE = {
  betweenCards: 'mb-6',     // 24px между карточками
  betweenSections: 'mb-8',  // 32px между разделами
  aroundHeading: 'mb-4',    // 16px после заголовка
  aroundButton: 'mt-6 mb-6', // 24px вокруг кнопки
  paragraph: 'mb-3',        // 12px между параграфами
  listItems: 'space-y-3',   // 12px между строками списка
} as const;

// ПРАВИЛО: если сомневаешься → добавь больше пустоты
// Премиальность = воздух

// ═══════════════════════════════════════════════════════════
// 4. COLORS & CONTRAST
// ═══════════════════════════════════════════════════════════

export const COLORS = {
  primary: '#E85D2F',   // Основной оранжевый
  accent: '#BFFF00',    // Зеленый акцент
  white: '#FFFFFF',     // Белый
  dark: '#1A1A1A',      // Черный текст
  glass: 'rgba(255, 255, 255, 0.1)', // Glassmorphism
  border: 'rgba(255, 255, 255, 0.2)',
  danger: '#DC2626',    // Красный для важных
  success: '#10B981',   // Зеленый для успеха
} as const;

export const CONTRAST = {
  // МИНИМУМ 2-3× разница в размере!
  // text-base (16px) → text-3xl (48px) = 3× ✅
  // text-base (16px) → text-lg (18px) = слабо ❌
  
  strong: 'Размер в 2-3 раза больше',
  weak: 'Размер чуть больше',
  recommendation: 'Всегда выбирай STRONG контраст для важных элементов',
} as const;

// ═══════════════════════════════════════════════════════════
// 5. GLASSMORPHISM (глубина через blur)
// ═══════════════════════════════════════════════════════════

export const GLASS = {
  card: 'backdrop-blur-lg bg-white/10 border border-white/20', // Карточки
  overlay: 'backdrop-blur-xl bg-black/40', // Модальные окна
  floating: 'backdrop-blur-2xl bg-black/60', // Наплывающие элементы
  header: 'backdrop-blur-md bg-white/10 border-b border-white/20',
} as const;

// ═══════════════════════════════════════════════════════════
// 6. COMPONENTS CONSISTENCY
// ═══════════════════════════════════════════════════════════

export const COMPONENTS = {
  card: {
    borderRadius: 'rounded-xl',   // 12px (consistent!)
    padding: PADDING.card,         // p-6 (24px)
    gap: GAP.comfortable,          // gap-6 (24px)
  },
  button: {
    padding: 'px-6 py-3',          // Consistent button padding
    borderRadius: 'rounded-lg',    // 8px
    fontSize: 'text-base',         // 16px
    fontWeight: 'font-semibold',   // 600
  },
  badge: {
    padding: 'px-3 py-1',          // Компактный
    borderRadius: 'rounded-full',  // Полностью круглый
    fontSize: 'text-xs',           // 12px
  },
  icon: {
    size: 20,                      // Всегда 20px
    strokeWidth: 2,                // Всегда 2px
  },
  transition: 'transition-all duration-300', // Consistent animation
} as const;

// ═══════════════════════════════════════════════════════════
// 7. VISUAL HIERARCHY - ПРАКТИЧЕСКИЕ ПРИМЕРЫ
// ═══════════════════════════════════════════════════════════

export const LAYOUT_PATTERNS = {
  // CARD STRUCTURE (внутри карточки)
  card: `
    <div className="flex flex-col gap-4">
      {/* LEVEL 1 - Заголовок */}
      <h2 className="text-2xl font-semibold text-white">Название</h2>
      
      {/* LEVEL 2-3 - Описание */}
      <p className="text-base font-normal text-gray-300 leading-relaxed">Описание работы</p>
      
      {/* LEVEL 4 - Метаданные */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <CalendarIcon size={16} />
        <span>28 января, 18:00</span>
      </div>
      
      {/* Кнопка внизу (масса, вес) */}
      <button className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold">
        Действие
      </button>
    </div>
  `,
  
  // PAGE STRUCTURE (структура страницы)
  page: `
    <div className="flex flex-col gap-8 p-8">
      {/* HERO/HEADER SECTION */}
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-4xl font-bold text-white">Главный заголовок</h1>
        <p className="text-base text-gray-300">Описание для контекста</p>
      </div>
      
      {/* CONTENT SECTIONS */}
      <div className="flex flex-col gap-6">
        {/* Каждая карточка имеет mb-6 (24px) */}
        <Card />
        <Card />
        <Card />
      </div>
      
      {/* CTA BUTTON (внизу, тяжелый) */}
      <button className="mt-8 px-6 py-4 bg-green-500 text-white rounded-lg font-bold text-lg">
        Главное действие
      </button>
    </div>
  `,
} as const;

// ═══════════════════════════════════════════════════════════
// 8. CHECKLIST ДЛЯ АУДИТА (перед отправкой)
// ═══════════════════════════════════════════════════════════

export const DESIGN_CHECKLIST = {
  spacing: [
    '✓ Все spacing кратно 8px (p-4, p-6, p-8, gap-2, gap-4, gap-6)?',
    '✓ Gap между карточками ≥ gap-6 (24px)?',
    '✓ Отступ перед кнопками ≥ mt-6 (24px)?',
  ],
  hierarchy: [
    '✓ H1 значительно крупнее (в 2-3 раза) остального текста?',
    '✓ Заголовки белые (text-white)?',
    '✓ Описание серое (text-gray-300)?',
    '✓ Метаданные еще серее (text-gray-400)?',
  ],
  whitespace: [
    '✓ 40%+ холста = пустота?',
    '✓ Важные элементы изолированы от остального?',
    '✓ Нет "тесноты" в макете?',
  ],
  consistency: [
    '✓ Все карточки имеют rounded-xl (12px)?',
    '✓ Все кнопки имеют px-6 py-3?',
    '✓ Все иконки size={20} strokeWidth={2}?',
    '✓ Все переходы transition-all duration-300?',
  ],
  contrast: [
    '✓ Контраст размеров ≥ 2×?',
    '✓ Яркие цвета только для фокусных элементов?',
    '✓ Focal point один и ясен?',
  ],
} as const;

export default {
  SPACING,
  TYPOGRAPHY,
  COLORS,
  COMPONENTS,
  WHITESPACE,
  GLASS,
  LAYOUT_PATTERNS,
  DESIGN_CHECKLIST,
};
