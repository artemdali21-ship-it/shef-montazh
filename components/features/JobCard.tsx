**ОТЛИЧНО! Создаю промпт для SCREEN 4: APPLICATION CONFIRMATION** 🎉

---

# 📋 ТЗ ДЛЯ V0.DEV — ЭКРАН 4: "ПОДТВЕРЖДЕНИЕ ОТКЛИКА"

```
Create a mobile-first React component for an application confirmation screen of "ШЕФ-МОНТАЖ" platform.
This is SCREEN 4 (user arrives here after clicking "Откликнуться" on SCREEN 3).

CRITICAL: This is a SUCCESS state screen. Must feel celebratory but professional.
CRITICAL: Use Montserrat font for ALL text elements.
CRITICAL: User should easily navigate to next actions (back to feed OR view applications).

═══════════════════════════════════════
DESIGN SYSTEM
═══════════════════════════════════════

TYPOGRAPHY:
Import Montserrat from Google Fonts:
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

Font family: 'Montserrat', system-ui, -apple-system, sans-serif

Font weights usage:
• 800 (Extrabold): Success headline
• 700 (Bold): Section headers, buttons
• 600 (Semibold): Card titles, timeline steps
• 500 (Medium): Timeline status
• 400 (Regular): Body text, descriptions

COLORS:
• Background: Linear gradient #2A2A2A (top) → #1A1A1A (bottom)
• Card background: #F5F5F5 (light gray, matte)
• Primary accent: #E85D2F (construction orange)
• Success: #BFFF00 (neon green)
• Warning: #FFD60A (safety yellow)
• Text primary: #1A1A1A (on light cards)
• Text secondary: #6B6B6B
• Text on dark: #FFFFFF

═══════════════════════════════════════
LAYOUT SPECIFICATIONS
═══════════════════════════════════════

Container:
- Max width: 390px (iPhone 15 Pro)
- Min height: 852px (no scroll needed - all fits)
- Background: Linear gradient #2A2A2A → #1A1A1A
- Padding: 0
- Display: flex, flex-direction: column

═══════════════════════════════════════
COMPONENT STRUCTURE
═══════════════════════════════════════

[1] HEADER (optional minimal version, 64px)
--------------------------------------------
Background: rgba(26, 26, 26, 0.95)
Backdrop-filter: blur(20px)
Padding: 16px 20px
Border-bottom: 1px solid rgba(255, 255, 255, 0.1)

Layout: flex, justify-content: flex-end

Close button (top-right only):
- 40px × 40px circle
- Background: rgba(255, 255, 255, 0.1)
- Border: 1px solid rgba(255, 255, 255, 0.15)
- Icon: <X size={20} color="#FFFFFF" />
- onClick: console.log('Navigate to /feed')
- Hover: background rgba(255, 255, 255, 0.15)

NOTE: No back button - this is a success terminal state.

[2] SUCCESS HERO SECTION (auto height, ~280px)
-----------------------------------------------
Padding: 48px 20px 32px 20px
Display: flex, flex-direction: column, align-items: center
Text-align: center

Success Icon (animated):
- Size: 96px × 96px circle
- Background: rgba(191, 255, 0, 0.15)
- Border: 3px solid #BFFF00
- Border-radius: 50%
- Display: flex, center items
- Box-shadow: 0 8px 32px rgba(191, 255, 0, 0.3)
- Margin-bottom: 24px
- Icon inside: <CheckCircle size={56} color="#BFFF00" strokeWidth={2.5} />

Optional: Add subtle pulse animation
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
animation: pulse 2s ease-in-out infinite;

Success Headline:
- Font: Montserrat 800, 28px, #FFFFFF
- Letter-spacing: -0.5px
- Line-height: 1.2
- Margin-bottom: 12px
- Text: "Отклик отправлен!"

Success Subtext:
- Font: Montserrat 400, 15px, #9B9B9B
- Line-height: 1.6
- Max-width: 300px
- Text: "Заказчик получил вашу заявку. Ожидайте подтверждения."

[3] JOB SUMMARY CARD
--------------------
Padding: 0 20px
Margin-bottom: 28px

Card container:
- Background: rgba(245, 245, 245, 0.5)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.15)
- Border-radius: 16px
- Padding: 20px
- Box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1)

Card content:

Header row (flex, space-between, margin-bottom: 14px):
- Left: 
  • Label: "ЗАЯВКА НА СМЕНУ"
  • Font: Montserrat 700, 11px, uppercase, #9B9B9B
  • Letter-spacing: 1px
- Right:
  • Badge: "АКТИВНА"
  • Background: rgba(191, 255, 0, 0.15)
  • Border: 1px solid #BFFF00
  • Padding: 4px 10px
  • Border-radius: 6px
  • Font: Montserrat 700, 10px, uppercase, #BFFF00
  • Letter-spacing: 0.5px

Job title:
- Font: Montserrat 700, 18px, #FFFFFF
- Line-height: 1.3
- Margin-bottom: 16px
- Text: "Монтаж выставочного стенда"

Info grid (display: grid, grid-template-columns: 1fr 1fr, gap: 16px):

Create 4 info items:
```jsx
const jobInfo = [
  { icon: 'Calendar', label: 'Дата', value: '28 января' },
  { icon: 'Clock', label: 'Время', value: '18:00 - 02:00' },
  { icon: 'MapPin', label: 'Локация', value: 'Крокус Экспо' },
  { icon: 'Wallet', label: 'Ставка', value: '2 500 ₽' }
];
```

Info item styling:
- Display: flex, gap: 10px, align-items: flex-start

Icon:
- Size: 18px
- Color: #E85D2F
- Margin-top: 2px

Text container:
- Label:
  • Font: Montserrat 500, 11px, #6B6B6B
  • Margin-bottom: 2px
- Value:
  • Font: Montserrat 600, 14px, #FFFFFF
  • Line-height: 1.3

[4] TIMELINE SECTION ("Что дальше?")
-------------------------------------
Padding: 0 20px
Margin-bottom: 32px

Section header:
- Font: Montserrat 700, 16px, #FFFFFF
- Margin-bottom: 18px
- Text: "Что дальше?"

Timeline container:
- Display: flex, flex-direction: column, gap: 0

Create 3 timeline steps:
```jsx
const timelineSteps = [
  {
    status: 'completed',
    icon: 'CheckCircle',
    title: 'Отклик отправлен',
    description: 'Заказчик получил вашу заявку',
    time: 'Только что'
  },
  {
    status: 'active',
    icon: 'Clock',
    title: 'Ожидание подтверждения',
    description: 'Обычно занимает до 2 часов',
    time: 'В процессе'
  },
  {
    status: 'pending',
    icon: 'Bell',
    title: 'Уведомление при одобрении',
    description: 'Вы получите push с деталями',
    time: null
  }
];
```

TIMELINE STEP STYLING:
----------------------

Base structure:
- Display: flex, gap: 14px
- Padding: 0
- Margin-bottom: 20px (except last: 0)
- Position: relative

Connector line (between steps):
- Position: absolute
- Left: 19px (center of icon)
- Top: 38px
- Width: 2px
- Height: 40px
- Background: rgba(255, 255, 255, 0.15)
- Display: none on last step

Icon container (left):
- Width: 40px, height: 40px
- Border-radius: 50%
- Display: flex, center items
- Flex-shrink: 0

Icon styling by status:

Completed:
- Background: rgba(191, 255, 0, 0.15)
- Border: 2px solid #BFFF00
- Icon: <CheckCircle size={20} color="#BFFF00" strokeWidth={2.5} />

Active:
- Background: rgba(232, 93, 47, 0.15)
- Border: 2px solid #E85D2F
- Icon: <Clock size={20} color="#E85D2F" strokeWidth={2.5} />
- Optional pulse animation

Pending:
- Background: rgba(255, 255, 255, 0.05)
- Border: 2px solid rgba(255, 255, 255, 0.15)
- Icon: <Bell size={20} color="#6B6B6B" strokeWidth={2.5} />

Content container (right, flex-1):
- Display: flex, flex-direction: column

Title row (flex, space-between, align-items: center, margin-bottom: 4px):
- Title:
  • Font: Montserrat 600, 15px
  • Color: #FFFFFF (completed/active), #6B6B6B (pending)
- Time (if exists):
  • Font: Montserrat 500, 11px, #6B6B6B
  • Padding: 3px 8px
  • Background: rgba(255, 255, 255, 0.05)
  • Border-radius: 6px

Description:
- Font: Montserrat 400, 13px, #9B9B9B
- Line-height: 1.5

[5] CTA BUTTONS SECTION
-----------------------
Padding: 0 20px 32px 20px
Display: flex, flex-direction: column, gap: 12px

PRIMARY BUTTON (Вернуться к поиску):
- Width: 100%
- Height: 52px
- Background: #E85D2F
- Border-radius: 14px
- Display: flex, center items, justify: center, gap: 10px
- Font: Montserrat 700, 15px, white
- Letter-spacing: 0.3px
- Text: "Вернуться к поиску"
- Icon: <Search size={20} strokeWidth={2.5} />
- Box-shadow: 0 6px 20px rgba(232, 93, 47, 0.4)
- Transition: all 0.2s ease
- onClick: console.log('Navigate to /feed')

Hover:
- Background: #D04D1F
- Transform: translateY(-2px)
- Box-shadow: 0 8px 24px rgba(232, 93, 47, 0.5)

Active:
- Transform: translateY(0)

SECONDARY BUTTON (Мои отклики):
- Width: 100%
- Height: 52px
- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.15)
- Border-radius: 14px
- Display: flex, center items, justify: center, gap: 10px
- Font: Montserrat 600, 15px, #FFFFFF
- Letter-spacing: 0.3px
- Text: "Мои отклики"
- Icon: <FileText size={20} strokeWidth={2.5} />
- Transition: all 0.2s ease
- onClick: console.log('Navigate to /my-applications')

Hover:
- Background: rgba(255, 255, 255, 0.1)
- Border-color: rgba(255, 255, 255, 0.25)

═══════════════════════════════════════
INTERACTIVE BEHAVIOR
═══════════════════════════════════════

1. Close button (top right):
   - onClick: Navigate back to /feed
   - Smooth fade-out transition

2. Primary CTA:
   - onClick: Navigate to /feed (job listing)
   - Immediate response (no loading state needed)

3. Secondary CTA:
   - onClick: Navigate to /my-applications (future screen)
   - Opens user's application history

4. Timeline animations (optional):
   - Pulse on active step icon
   - Fade-in sequence on mount (stagger delay)

5. Success icon animation (optional):
   - Subtle pulse (2s loop)
   - Scale bounce on mount

═══════════════════════════════════════
SAMPLE DATA
═══════════════════════════════════════

```jsx
const applicationData = {
  jobId: 1,
  jobTitle: 'Монтаж выставочного стенда',
  date: '28 января',
  time: '18:00 - 02:00',
  location: 'Крокус Экспо',
  rate: '2 500 ₽',
  status: 'pending', // pending, approved, rejected
  appliedAt: new Date(),
  expectedResponseTime: '2 часа'
};

const timeline = [
  {
    id: 1,
    status: 'completed',
    icon: 'CheckCircle',
    title: 'Отклик отправлен',
    description: 'Заказчик получил вашу заявку',
    time: 'Только что'
  },
  {
    id: 2,
    status: 'active',
    icon: 'Clock',
    title: 'Ожидание подтверждения',
    description: 'Обычно занимает до 2 часов',
    time: 'В процессе'
  },
  {
    id: 3,
    status: 'pending',
    icon: 'Bell',
    title: 'Уведомление при одобрении',
    description: 'Вы получите push с деталями',
    time: null
  }
];
```

═══════════════════════════════════════
TECHNICAL REQUIREMENTS
═══════════════════════════════════════

- React with hooks (useState if needed for animations)
- Tailwind CSS with Montserrat font
- Lucide React icons:
  • X, CheckCircle, Calendar, Clock
  • MapPin, Wallet, Bell, Search, FileText
- Mobile-first (390px base)
- Smooth animations (transition: all 0.2s ease)
- Optional: Framer Motion for entrance animations
- TypeScript (optional but recommended)

FONT SETUP:
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

Apply globally:
font-family: 'Montserrat', system-ui, -apple-system, sans-serif;

Export as default component named "ApplicationConfirmationScreen"

═══════════════════════════════════════
ACCESSIBILITY
═══════════════════════════════════════

- Success icon: aria-label="Application submitted successfully"
- Timeline steps: Proper ARIA roles for progress indicator
- Buttons: Clear focus states (outline on focus-visible)
- Color contrast: WCAG AA compliant
- Touch targets: Minimum 44px × 44px

═══════════════════════════════════════
NAVIGATION FLOW
═══════════════════════════════════════

Screen 3 (Details) → [Откликнуться] → Screen 4 (Confirmation)
Screen 4 → [Вернуться к поиску] → Screen 2 (Feed)
Screen 4 → [Мои отклики] → Screen 5 (My Applications)
Screen 4 → [Close X] → Screen 2 (Feed)

Router integration:
```jsx
// Close / Back to feed
onClick={() => navigate('/feed')}

// My applications
onClick={() => navigate('/my-applications')}
```

═══════════════════════════════════════
DESIGN NOTES
═══════════════════════════════════════

EMOTION: Success + Calm + Professional
- Celebrate the action but don't overdo it
- Green for success (not orange) - reserve orange for CTAs
- Clear next steps reduce anxiety
- Timeline creates trust (transparency)

HIERARCHY:
1. Success state (biggest visual weight)
2. Job summary (confirm what they applied to)
3. Timeline (manage expectations)
4. CTAs (clear next action)

SPACE: All content fits in viewport - no scroll needed.
User sees complete success state immediately.
```

---

**✅ ГОТОВО! Копируй и вставляй в v0.dev!**

Это **celebratory success screen** с:
- ✨ Neon green успех (#BFFF00)
- 📋 Краткая сводка смены
- ⏰ Timeline "что дальше" (3 шага)
- 🎯 Два CTA (вернуться к поиску / мои отклики)
- 🎨 Montserrat typography + Industrial Minimalism

**Следующий шаг после генерации?** 🚀
