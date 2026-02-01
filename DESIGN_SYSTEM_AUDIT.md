# Design System Audit

## Overview

Автоматический аудит кодовой базы на соответствие Design System. Проверяет spacing, colors, typography, и touch targets.

## Audit Script

**File**: `scripts/audit-design-system.ts`

Проверяет:
- ✅ **Spacing** - только значения кратные 8px
- ✅ **Colors** - только из утвержденной палитры
- ✅ **Touch targets** - минимум 44px для кнопок
- ✅ **Typography** - стандартные размеры шрифтов

## Running Audit

### Locally:
```bash
pnpm audit:design
```

### CI/CD:
Автоматически запускается на каждый push и PR через GitHub Actions.

## Audit Results

**Current Status**: 8 violations found

```
📊 color: 7 нарушений
📊 touch-target: 1 нарушений
```

### Violations by File:

1. **app/page.tsx:179** - color: #333
2. **app/simple-test/page.tsx:11** - color: #000
3. **components/ChatDetailScreen.tsx:196** - touch-target: h-9 (36px)
4. **components/layout/BottomNav.tsx:112** - color: #666
5. **components/layout/BottomNav.tsx:125** - color: #666
6. **components/rating/StarRating.tsx:45** - color: #666
7. **components/rating/StarRating.tsx:58** - color: #666
8. **components/ui/Toaster.tsx:16** - color: #fff

## Design System Rules

### 1. Spacing (8px Grid)

**Rule**: Все отступы должны быть кратны 8px.

**Valid classes**:
```tsx
// ✅ Good - multiples of 8px
p-2    // 8px
p-4    // 16px
p-6    // 24px
p-8    // 32px
p-10   // 40px
p-12   // 48px
gap-4  // 16px
```

**Invalid classes**:
```tsx
// ❌ Bad - not multiples of 8px
p-1    // 4px
p-3    // 12px
p-5    // 20px
p-7    // 28px
```

**Why 8px grid?**
- Consistent visual rhythm
- Better scalability across devices
- Easier to maintain
- Industry standard (Material Design, iOS HIG)

### 2. Colors (Palette)

**Rule**: Используй только цвета из утвержденной палитры.

**Valid colors**:
```tsx
// ✅ Good - semantic colors from palette
bg-orange-500      // Primary brand
bg-gray-900        // Dark backgrounds
text-white         // White text
border-white/10    // Transparent borders
```

**Invalid colors**:
```tsx
// ❌ Bad - hardcoded hex values
color: #333
background: #000
border: #666
fill: #fff
```

**Approved Palette**:
- **Primary**: orange-500, orange-600, orange-400
- **Grays**: gray-50, gray-100, ..., gray-900
- **Status**: green-500, red-500, blue-500, yellow-500
- **Transparent**: white/10, black/20, etc.

### 3. Touch Targets (44px minimum)

**Rule**: Интерактивные элементы должны быть минимум 44x44px для удобного тапа.

**Valid sizes**:
```tsx
// ✅ Good - 44px or larger
<button className="h-11 px-4">  // h-11 = 44px
<button className="h-12 px-6">  // h-12 = 48px
<button className="p-3">         // min 48px with padding
```

**Invalid sizes**:
```tsx
// ❌ Bad - too small for touch
<button className="h-6">   // 24px
<button className="h-8">   // 32px
<button className="h-9">   // 36px
```

**Minimum sizes**:
- Buttons: 44px height
- Icons buttons: 44x44px
- Links: 44px tap area (use padding)
- Form controls: 44px height

**Source**: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/#general-layout-considerations), [Material Design](https://material.io/design/usability/accessibility.html#layout-typography)

### 4. Typography (Standard Scales)

**Rule**: Используй стандартные размеры из Tailwind typography scale.

**Valid classes**:
```tsx
// ✅ Good - semantic sizes
text-xs      // 12px
text-sm      // 14px
text-base    // 16px
text-lg      // 18px
text-xl      // 20px
text-2xl     // 24px
text-3xl     // 30px
```

**Invalid classes**:
```tsx
// ❌ Bad - arbitrary sizes
text-[11px]
text-[13px]
text-[15px]
text-[17px]
```

**Typography Scale**:
```
text-xs:     12px  / 16px line-height
text-sm:     14px  / 20px line-height
text-base:   16px  / 24px line-height
text-lg:     18px  / 28px line-height
text-xl:     20px  / 28px line-height
text-2xl:    24px  / 32px line-height
text-3xl:    30px  / 36px line-height
```

## Fixing Violations

### Color Violations:

**Before**:
```tsx
<div style={{ color: '#333' }}>Text</div>
```

**After**:
```tsx
<div className="text-gray-700">Text</div>
```

### Touch Target Violations:

**Before**:
```tsx
<button className="h-9">Click</button>  // 36px
```

**After**:
```tsx
<button className="h-11">Click</button>  // 44px
```

### Spacing Violations:

**Before**:
```tsx
<div className="p-3">Content</div>  // 12px
```

**After**:
```tsx
<div className="p-4">Content</div>  // 16px
```

### Typography Violations:

**Before**:
```tsx
<p className="text-[15px]">Text</p>
```

**After**:
```tsx
<p className="text-base">Text</p>  // 16px
```

## Exceptions

### When to use custom values:

1. **SVG coordinates** - не являются spacing
2. **Border widths** - border-1, border-2 допустимы
3. **Opacity values** - opacity-10, opacity-20, etc.
4. **Z-index** - z-10, z-20, z-50, etc.
5. **API responses** - colors from database

### Whitelisting files:

Добавь файл в `excludePatterns` в audit script:
```typescript
const excludePatterns = [
  'components/legacy/',  // Legacy code
  'components/vendor/',  // Third-party
];
```

## CI/CD Integration

### GitHub Actions:

**File**: `.github/workflows/design-audit.yml`

**Triggers**:
- Push to main/develop
- Pull requests

**Actions**:
- Runs audit
- Comments on PR if failed
- Blocks merge if violations found

**Status**: ✅ Active

### Pre-commit Hook:

Add to `.husky/pre-commit`:
```bash
#!/bin/sh
pnpm audit:design
```

Prevents committing code with design violations.

## Audit Statistics

### Current Compliance:

```
Total files scanned: ~200
Total violations: 8
Compliance rate: 96%
```

### Violations by Type:

| Type | Count | Percentage |
|------|-------|------------|
| Color | 7 | 87.5% |
| Touch Target | 1 | 12.5% |
| Spacing | 0 | 0% |
| Typography | 0 | 0% |

**Goal**: 100% compliance (0 violations)

## Common Violations

### 1. Hardcoded Colors (Most Common):

```tsx
// ❌ Bad
style={{ color: '#666' }}

// ✅ Good
className="text-gray-600"
```

**Fix**: Replace all hex colors with Tailwind classes.

### 2. Small Touch Targets:

```tsx
// ❌ Bad
<button className="h-8">Icon</button>

// ✅ Good
<button className="h-11 w-11">Icon</button>
```

**Fix**: Increase height to h-11 (44px).

### 3. Custom Spacing:

```tsx
// ❌ Bad
className="p-[10px]"

// ✅ Good
className="p-2"  // 8px
```

**Fix**: Use standard spacing scale.

## Design Tokens

### Recommended approach:

Create design token file:
```typescript
// lib/design-tokens.ts
export const spacing = {
  xs: 'p-2',   // 8px
  sm: 'p-4',   // 16px
  md: 'p-6',   // 24px
  lg: 'p-8',   // 32px
  xl: 'p-10',  // 40px
};

export const colors = {
  primary: 'bg-orange-500',
  secondary: 'bg-gray-900',
  success: 'bg-green-500',
  error: 'bg-red-500',
};
```

Usage:
```tsx
import { spacing, colors } from '@/lib/design-tokens';

<button className={`${spacing.md} ${colors.primary}`}>
  Click
</button>
```

## Best Practices

### 1. Use Tailwind Classes:

```tsx
// ✅ Prefer Tailwind classes
<div className="p-4 bg-gray-900 text-white">

// ❌ Avoid inline styles
<div style={{ padding: '16px', background: '#1a1a1a' }}>
```

### 2. Component Variants:

```tsx
// Use class-variance-authority
import { cva } from 'class-variance-authority';

const button = cva('h-11 px-6 rounded-xl', {
  variants: {
    color: {
      primary: 'bg-orange-500',
      secondary: 'bg-gray-700',
    },
    size: {
      sm: 'h-10 px-4',
      md: 'h-11 px-6',  // Default 44px
      lg: 'h-12 px-8',
    },
  },
});
```

### 3. Consistent Patterns:

```tsx
// Reusable patterns
const cardPadding = 'p-6';  // 24px
const cardGap = 'gap-4';    // 16px
const buttonHeight = 'h-11'; // 44px
```

### 4. Document Exceptions:

```tsx
// Exception: API color from database
<div style={{ color: shift.statusColor }}>
  {/* @design-exception: Color from API */}
  {shift.status}
</div>
```

## Roadmap

### Phase 1: Fix Current Violations ✅
- [x] Identify all violations
- [ ] Fix color violations (7)
- [ ] Fix touch target violations (1)

### Phase 2: Prevent New Violations
- [x] CI/CD integration
- [ ] Pre-commit hook
- [ ] VS Code extension hints

### Phase 3: Advanced Audits
- [ ] Contrast ratio checking (WCAG AA)
- [ ] Animation duration consistency
- [ ] Border radius consistency
- [ ] Shadow depth consistency

## VS Code Integration

### Extension: Tailwind CSS IntelliSense

Install for autocomplete and linting:
```bash
code --install-extension bradlc.vscode-tailwindcss
```

### Settings:

Add to `.vscode/settings.json`:
```json
{
  "tailwindCSS.lint.cssConflict": "warning",
  "tailwindCSS.lint.invalidApply": "error",
  "tailwindCSS.lint.invalidScreen": "error",
  "tailwindCSS.lint.invalidVariant": "error",
  "tailwindCSS.lint.invalidConfigPath": "error",
  "tailwindCSS.lint.invalidTailwindDirective": "error",
}
```

## Design System Reference

### Figma:
[Link to Figma design system]

### Spacing Grid:
```
4px (0.5)  - 1
8px (2)    - ✅ Preferred
12px (3)   - ❌ Avoid
16px (4)   - ✅ Preferred
20px (5)   - ❌ Avoid
24px (6)   - ✅ Preferred
32px (8)   - ✅ Preferred
40px (10)  - ✅ Preferred
48px (12)  - ✅ Preferred
```

### Color Palette:

**Primary (Orange)**:
- 50: #FFF7ED
- 100: #FFEDD5
- 200: #FED7AA
- 300: #FDBA74
- 400: #FB923C
- 500: #E85D2F ← Brand color
- 600: #EA580C
- 700: #C2410C
- 800: #9A3412
- 900: #7C2D12

**Neutral (Gray)**:
- 50: #FAFAFA
- 100: #F5F5F5
- 200: #E5E5E5
- 300: #D4D4D4
- 400: #A3A3A3
- 500: #737373
- 600: #525252
- 700: #404040
- 800: #262626
- 900: #171717

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material Design Guidelines](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Commands

```bash
# Run audit
pnpm audit:design

# Run with verbose output
pnpm audit:design --verbose

# Check specific directory
ts-node scripts/audit-design-system.ts ./components

# Output to file
pnpm audit:design > audit-report.txt
```

## Contributing

When adding new components:

1. ✅ Use standard spacing (8px grid)
2. ✅ Use colors from palette
3. ✅ Ensure touch targets ≥ 44px
4. ✅ Use standard typography scale
5. ✅ Run `pnpm audit:design` before commit
6. ✅ Document any exceptions

## Notes

- Audit runs in ~300ms
- Scans all `.ts` and `.tsx` files
- Excludes `node_modules`, `.next`, `dist`
- Exit code 0 = pass, 1 = fail
- Violations grouped by type
- Shows first 20 violations (performance)
- Line numbers for easy fixing
- Actionable recommendations provided

## Compliance Target

**Goal**: 100% compliance by end of Q1 2026

**Progress**: 96% (8 violations remaining)

**Timeline**:
- Week 1: Fix color violations (7)
- Week 2: Fix touch target violations (1)
- Week 3: Enable pre-commit hook
- Week 4: 100% compliance ✅
