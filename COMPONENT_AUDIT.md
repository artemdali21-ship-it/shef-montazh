# Component Standardization Checklist

## ✅ Already Verified & Compliant

### Buttons
- [x] `/components/custom/custom-button.tsx` - All 5 states implemented, uses tokens

### Cards
- [x] `/components/features/shift-card.tsx` - Proper spacing, border-radius
- [x] `/components/features/user-card.tsx` - Proper border-radius 12px
- [x] `/components/features/job-card.tsx` - Compliant

### Typography
- [x] All text sizes in 12px, 14px, 16px, 18px, 20px, 24px, 32px ranges
- [x] Line heights 1.4-1.6 throughout

### 3D/Floating Elements
- [x] `/components/layouts/Background3D.tsx` - z-index negative, pointer-events-none, opacity 0.5-0.7

### Messages
- [x] `/components/messages/ChatPreview.tsx` - Proper spacing (p-4)

## 🔍 Components to Review

### Priority High (May have non-standard values)
- [ ] `/components/verification/GosuslugiButton.tsx` - Check padding/border-radius
- [ ] `/components/settings/ToggleSwitch.tsx` - Check sizing
- [ ] `/components/custom/custom-toggle.tsx` - Check sizing
- [ ] `/components/custom/custom-input.tsx` - Check height, padding
- [ ] `/components/custom/custom-avatar.tsx` - Check sizing

### Priority Medium (Layout components)
- [ ] `/components/layout/BottomNav.tsx` - Check spacing, touch targets
- [ ] `/components/layout/bottom-navigation.tsx` - Check spacing, touch targets
- [ ] `/components/Header.tsx` - Check spacing

### Priority Low (Feature components)
- [ ] `/components/rating/StarRating.tsx` - Check sizing
- [ ] `/components/search/WorkerSearch.tsx` - Check responsive
- [ ] All other components - General audit

## Quick Audit Template

For each component, check:

```
[COMPONENT NAME]
- [ ] No padding/margin: 10px, 13px, 15px, 18px, 20px, 22px, etc.
- [ ] No border-radius: 0px, 4px, 6px, 10px, 14px, 20px
- [ ] No arbitrary colors: Only use design tokens
- [ ] No arbitrary shadows: Only --shadow-sm, --shadow-md, --shadow-lg
- [ ] No arbitrary text sizes: Only 12, 14, 16, 18, 20, 24, 32, 36px
- [ ] Buttons have min-height: 44px
- [ ] 3D elements: z-index ≤ 0, pointer-events: none, opacity 0.5-0.7
- [ ] All transitions use cubic-bezier(0.4, 0, 0.2, 1)
```

## Automated Check Commands

```bash
# Find non-standard padding values
grep -r "p-\[1[0-5]px\]\|p-\[20px\]\|p-\[2[2-9]px\]" components/

# Find non-standard margin values  
grep -r "m-\[1[0-5]px\]\|m-\[20px\]\|m-\[2[2-9]px\]" components/

# Find non-standard border-radius
grep -r "rounded-\[0px\]\|rounded-\[4px\]\|rounded-\[6px\]\|rounded-\[10px\]" components/

# Find arbitrary shadows
grep -r "shadow-\[.*px\]" components/

# Find arbitrary colors
grep -r "bg-\[#\|text-\[#" components/
```

## Standards Reference

### Spacing Scale (8px base)
- 8px (p-2, m-2)
- 12px (p-3, m-3)
- 16px (p-4, m-4)
- 20px (p-5, m-5)
- 24px (p-6, m-6)
- 32px (p-8, m-8)

### Border Radius Scale
- 8px (rounded-lg in Tailwind, or --radius-sm)
- 12px (rounded-xl in Tailwind, or --radius-md)
- 16px (rounded-2xl in Tailwind, or --radius-lg)
- 24px (rounded-3xl in Tailwind, or --radius-xl)

### Text Sizes
- 10px: `text-caption`
- 12px: `text-body-small`
- 14px: `text-body` (default)
- 16px: `text-body-large` or `text-h3`
- 18px: `text-xl` (Tailwind)
- 20px: `text-h2`
- 24px: `text-h1`
- 32px: `text-3xl` (Tailwind)
- 36px: `text-display`

### Shadows
- SM: `0 1px 2px rgba(0, 0, 0, 0.05)` - `--shadow-sm`
- MD: `0 4px 12px rgba(0, 0, 0, 0.08)` - `--shadow-md`
- LG: `0 8px 24px rgba(0, 0, 0, 0.12)` - `--shadow-lg`

---

**Last Updated**: 2/2/2026
**Status**: 🟢 Ready for Component Audit
