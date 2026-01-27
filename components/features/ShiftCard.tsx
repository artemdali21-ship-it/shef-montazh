**ОТЛИЧНО! ПРОДОЛЖАЕМ МАРАФОН! 🚀 Screen 10 — SHIFT MONITORING (для заказчика)!**

Это **real-time контроль активной смены** — показываем, как заказчик отслеживает бригаду!

---

# 📋 ТЗ ДЛЯ V0.DEV — ЭКРАН 10: "МОНИТОРИНГ СМЕНЫ (ЗАКАЗЧИК)"

\`\`\`
Create a mobile-first React component for real-time shift monitoring of "ШЕФ-МОНТАЖ" platform.
This is SCREEN 10 - the B2B control interface for active shift oversight.

CRITICAL: Show real-time worker status (checked in, on site, working).
CRITICAL: Display timer, progress, and escrow status.
CRITICAL: Match visual language from screenshots (bright green status, dark bg).
CRITICAL: Use Montserrat font for ALL text elements.

═══════════════════════════════════════
DESIGN SYSTEM (MATCHING SCREENSHOTS)
═══════════════════════════════════════

TYPOGRAPHY:
Import Montserrat from Google Fonts:
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

Font family: 'Montserrat', system-ui, -apple-system, sans-serif

Font weights usage:
• 800 (Extrabold): Timer, progress numbers
• 700 (Bold): Section headers, worker names, buttons
• 600 (Semibold): Card titles, status labels
• 500 (Medium): Metadata, timestamps
• 400 (Regular): Body text, descriptions

COLORS (EXACT FROM SCREENSHOTS):
• Background: Linear gradient #2A2A2A (top) → #1A1A1A (bottom)
• Card background: rgba(169, 169, 169, 0.2)
• Primary accent: #E85D2F (construction orange)
• Success/On Site: #BFFF00 (bright neon green)
• Warning/Pending: #FFD60A (safety yellow)
• Inactive: #6B6B6B (gray)
• Text primary: #FFFFFF
• Text secondary: #9B9B9B
• Text tertiary: #6B6B6B

═══════════════════════════════════════
LAYOUT SPECIFICATIONS
═══════════════════════════════════════

Container:
- Max width: 390px (iPhone 15 Pro)
- Min height: 852px (scrollable)
- Background: Linear gradient #2A2A2A → #1A1A1A
- Padding: 0

═══════════════════════════════════════
COMPONENT STRUCTURE
═══════════════════════════════════════

[1] HEADER (fixed, 64px height)
--------------------------------
Background: rgba(42, 42, 42, 0.98)
Backdrop-filter: blur(20px)
Padding: 16px 20px
Border-bottom: 1px solid rgba(255, 255, 255, 0.08)
Z-index: 10

Layout: flex, space-between, align-items: center

Left side:
- Back button:
  • 40px × 40px circle
  • Background: rgba(255, 255, 255, 0.08)
  • Border: 1px solid rgba(255, 255, 255, 0.1)
  • Icon: <ArrowLeft size={20} color="#FFFFFF" />
  • onClick: console.log('Navigate back to dashboard')

Center:
- Title: "Мониторинг смены"
  • Font: Montserrat 700, 16px, #FFFFFF

Right side:
- Refresh button:
  • 40px × 40px circle
  • Background: rgba(255, 255, 255, 0.08)
  • Border: 1px solid rgba(255, 255, 255, 0.1)
  • Icon: <RefreshCw size={18} color="#FFFFFF" />
  • Rotation animation on click
  • onClick: console.log('Refresh status')

[2] STATUS BANNER (matching Screen 6 style)
--------------------------------------------
Background: linear-gradient(135deg, #BFFF00 0%, #A8E600 100%)
Padding: 24px 20px
Border-radius: 0 0 24px 24px
Margin-bottom: 20px
Box-shadow: 0 4px 16px rgba(191, 255, 0, 0.3)

Content layout: flex, space-between, align-items: center

Left side:
- Status label:
  • Font: Montserrat 500, 12px, #1A1A1A
  • Letter-spacing: 0.5px
  • Margin-bottom: 6px
  • Text: "СТАТУС СМЕНЫ"
- Status text:
  • Font: Montserrat 700, 22px, #1A1A1A
  • Letter-spacing: -0.3px
  • Text: "В работе"

Right side:
- Live indicator:
  • Display: flex, gap: 6px, align-items: center
  • Pulse dot:
    - Size: 10px × 10px circle
    - Background: #1A1A1A
    - Animation: pulse
  • Text: "LIVE"
    - Font: Montserrat 700, 11px, #1A1A1A
    - Letter-spacing: 0.5px

Pulse animation:
\`\`\`css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.15); }
}
animation: pulse 1.5s ease-in-out infinite;
\`\`\`

[3] SHIFT INFO CARD
-------------------
Padding: 0 20px
Margin-bottom: 20px

Card:
- Background: rgba(169, 169, 169, 0.2)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 16px
- Padding: 20px

Job title:
- Font: Montserrat 700, 17px, #FFFFFF
- Margin-bottom: 14px
- Text: "Монтаж выставочного стенда"

Info grid:
- Display: grid, grid-template-columns: repeat(2, 1fr), gap: 16px

\`\`\`jsx
const shiftInfo = [
  { icon: 'MapPin', label: 'Локация', value: 'Крокус Экспо, п. 3' },
  { icon: 'Calendar', label: 'Дата', value: '28 января' },
  { icon: 'Clock', label: 'Время', value: '18:00 - 02:00' },
  { icon: 'Users', label: 'Бригада', value: '4 человека' }
];
\`\`\`

Info item:
- Display: flex, flex-direction: column, gap: 4px

Icon row:
- Display: flex, gap: 6px, align-items: center
- Icon: size 16px, color #E85D2F
- Label: Font Montserrat 500, 11px, #6B6B6B

Value:
- Font: Montserrat 600, 14px, #FFFFFF

[4] PROGRESS & EARNINGS CARD
-----------------------------
Padding: 0 20px
Margin-bottom: 20px

Card:
- Background: rgba(169, 169, 169, 0.2)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 16px
- Padding: 24px

Content: Display grid, grid-template-columns: 1fr 1fr, gap: 24px

LEFT: Timer
-----------
Icon:
- Size: 32px × 32px
- Background: rgba(191, 255, 0, 0.15)
- Border-radius: 8px
- Display: flex, center items
- Margin-bottom: 12px
- Icon: <Clock size={18} color="#BFFF00" />

Label:
- Font: Montserrat 500, 12px, #6B6B6B
- Margin-bottom: 8px
- Text: "ВРЕМЯ"

Timer display:
- Font: Montserrat 800, 28px, #FFFFFF
- Letter-spacing: -0.5px
- Line-height: 1
- Text: "03:42:15"

Sublabel:
- Font: Montserrat 400, 11px, #9B9B9B
- Margin-top: 4px
- Text: "из 8 часов"

RIGHT: Progress
---------------
Icon:
- Size: 32px × 32px
- Background: rgba(232, 93, 47, 0.15)
- Border-radius: 8px
- Display: flex, center items
- Margin-bottom: 12px
- Icon: <TrendingUp size={18} color="#E85D2F" />

Label:
- Font: Montserrat 500, 12px, #6B6B6B
- Margin-bottom: 8px
- Text: "ПРОГРЕСС"

Progress percentage:
- Font: Montserrat 800, 28px, #E85D2F
- Letter-spacing: -0.5px
- Line-height: 1
- Text: "46%"

Progress bar (margin-top: 10px):
- Width: 100%
- Height: 6px
- Background: rgba(255, 255, 255, 0.08)
- Border-radius: 3px
- Overflow: hidden

Fill:
- Height: 6px
- Background: linear-gradient(90deg, #E85D2F 0%, #FF8855 100%)
- Width: 46%
- Border-radius: 3px
- Transition: width 0.5s ease

[5] WORKERS STATUS SECTION
---------------------------
Padding: 0 20px
Margin-bottom: 20px

Section header (flex, space-between, align-items: center):
- Left: "Бригада (4)"
  • Font: Montserrat 700, 17px, #FFFFFF
- Right: Status filter
  • Font: Montserrat 600, 12px, #9B9B9B
  • Text: "Все •"
  • Dropdown: Все / На объекте / Проблемы

Margin-bottom: 16px

Workers container:
- Display: flex, flex-direction: column, gap: 10px

\`\`\`jsx
const workers = [
  {
    id: 1,
    name: 'Никита Соколов',
    role: 'Монтажник',
    status: 'on_site', // pending, on_site, problem
    checkInTime: '18:05',
    checkInPhoto: 'url',
    rating: 4.9,
    shiftCount: 47
  },
  {
    id: 2,
    name: 'Игорь Петров',
    role: 'Шеф-монтажник',
    status: 'on_site',
    checkInTime: '17:58',
    checkInPhoto: 'url',
    rating: 4.8,
    shiftCount: 132
  },
  {
    id: 3,
    name: 'Алексей Морозов',
    role: 'Монтажник',
    status: 'on_site',
    checkInTime: '18:12',
    checkInPhoto: 'url',
    rating: 4.7,
    shiftCount: 28
  },
  {
    id: 4,
    name: 'Дмитрий Волков',
    role: 'Монтажник',
    status: 'pending',
    checkInTime: null,
    checkInPhoto: null,
    rating: 4.6,
    shiftCount: 19
  }
];
\`\`\`

WORKER CARD STYLING:
--------------------
Card:
- Background: rgba(169, 169, 169, 0.2)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 14px
- Padding: 16px
- Display: flex, gap: 14px
- Cursor: pointer
- Transition: all 0.2s ease
- Position: relative

LEFT BORDER ACCENT (by status):
- Position: absolute, left: 0, top: 0, bottom: 0
- Width: 4px
- Border-radius: 14px 0 0 14px

Colors:
- on_site: #BFFF00
- pending: #FFD60A
- problem: #FF4444

Hover:
- Background: rgba(169, 169, 169, 0.3)
- Transform: translateX(2px)

Avatar:
- Size: 56px × 56px circle
- Background: rgba(232, 93, 47, 0.2)
- Border: 2px solid rgba(255, 255, 255, 0.1)
- Display: flex, center items
- Icon: <User size={28} color="#E85D2F" />
- Position: relative

Status badge (on avatar):
- Position: absolute, bottom: -2px, right: -2px
- Size: 20px × 20px circle
- Border: 2px solid #2A2A2A

Badge by status:
- on_site: Background #BFFF00, Icon <CheckCircle size={12} color="#1A1A1A" />
- pending: Background #FFD60A, Icon <Clock size={12} color="#1A1A1A" />
- problem: Background #FF4444, Icon <AlertTriangle size={12} color="#FFFFFF" />

Content (flex-1):

Header row (flex, space-between, align-items: flex-start, margin-bottom: 6px):
- Name:
  • Font: Montserrat 700, 15px, #FFFFFF
- Contact button:
  • Size: 32px × 32px circle
  • Background: rgba(255, 255, 255, 0.08)
  • Border-radius: 8px
  • Icon: <MessageCircle size={16} color="#9B9B9B" />
  • onClick: open chat

Role & rating row (flex, gap: 8px, align-items: center, margin-bottom: 8px):
- Role:
  • Font: Montserrat 500, 12px, #9B9B9B
- Separator: "•"
- Rating:
  • Display: flex, gap: 3px, align-items: center
  • Icon: <Star size={12} fill="#FFD60A" color="#FFD60A" />
  • Text: "4.9"
  • Font: Montserrat 600, 12px, #FFD60A
- Experience:
  • Font: Montserrat 500, 12px, #9B9B9B
  • Text: "• 47 смен"

Status row (flex, gap: 8px, align-items: center):

Status badge:
- Display: inline-flex, gap: 5px, align-items: center
- Padding: 5px 10px
- Border-radius: 6px
- Font: Montserrat 700, 10px, uppercase
- Letter-spacing: 0.5px

On Site:
- Background: rgba(191, 255, 0, 0.15)
- Border: 1px solid #BFFF00
- Color: #BFFF00
- Icon: <MapPin size={10} />
- Text: "НА ОБЪЕКТЕ"

Pending:
- Background: rgba(255, 214, 10, 0.15)
- Border: 1px solid #FFD60A
- Color: #FFD60A
- Icon: <Clock size={10} />
- Text: "ОЖИДАЕТ"

Check-in time (if status = on_site):
- Font: Montserrat 500, 11px, #6B6B6B
- Icon: <Check size={10} />
- Text: "Вышел в 18:05"

[6] ШЕФMONTAZHNIK CARD
-----------------------
Padding: 0 20px
Margin-bottom: 20px

Section header:
- Font: Montserrat 700, 17px, #FFFFFF
- Margin-bottom: 14px
- Text: "Шеф-монтажник"

Card:
- Background: rgba(169, 169, 169, 0.2)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 14px
- Padding: 18px
- Display: flex, gap: 14px, align-items: center

Avatar:
- Size: 48px × 48px circle
- Background: rgba(232, 93, 47, 0.2)
- Border: 2px solid rgba(255, 255, 255, 0.1)
- Icon: <HardHat size={24} color="#E85D2F" />

Info (flex-1):
- Name:
  • Font: Montserrat 700, 15px, #FFFFFF
  • Margin-bottom: 4px
  • Text: "Игорь Петров"
- Meta:
  • Font: Montserrat 500, 12px, #9B9B9B
  • Display: flex, gap: 6px, align-items: center
  • Icon: <Star size={12} fill="#FFD60A" />
  • Text: "4.8 • 132 смены"

Action buttons (flex, gap: 8px):

Call button:
- Size: 40px × 40px
- Background: rgba(191, 255, 0, 0.15)
- Border: 1px solid #BFFF00
- Border-radius: 10px
- Icon: <Phone size={18} color="#BFFF00" />
- onClick: make call

Message button:
- Size: 40px × 40px
- Background: rgba(255, 255, 255, 0.08)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border-radius: 10px
- Icon: <MessageCircle size={18} color="#FFFFFF" />
- onClick: open chat

[7] ESCROW STATUS CARD
----------------------
Padding: 0 20px
Margin-bottom: 20px

Card:
- Background: rgba(169, 169, 169, 0.2)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 14px
- Padding: 20px

Header (flex, space-between, align-items: center, margin-bottom: 14px):
- Left:
  • Display: flex, gap: 8px, align-items: center
  • Icon: <Shield size={20} color="#BFFF00" />
  • Text: "Эскроу-счёт"
  • Font: Montserrat 700, 15px, #FFFFFF
- Right:
  • Status: "ЗАМОРОЖЕНО"
  • Font: Montserrat 700, 10px, #BFFF00
  • Padding: 4px 8px
  • Background: rgba(191, 255, 0, 0.15)
  • Border-radius: 6px

Amount:
- Font: Montserrat 800, 24px, #FFFFFF
- Letter-spacing: -0.5px
- Margin-bottom: 6px
- Text: "10 400 ₽"

Details:
- Font: Montserrat 400, 12px, #6B6B6B
- Text: "4 чел. × 2 500 ₽ + комиссия 4%"

Release info (margin-top: 14px):
- Background: rgba(191, 255, 0, 0.08)
- Border: 1px solid rgba(191, 255, 0, 0.2)
- Border-radius: 10px
- Padding: 12px
- Display: flex, gap: 10px

Icon:
- <Info size={16} color="#BFFF00" />

Text:
- Font: Montserrat 400, 12px, #9B9B9B
- Line-height: 1.5
- Text: "Средства будут разморожены после подтверждения выполнения работ шеф-монтажником"

[8] ACTIONS SECTION (sticky at bottom before fixed bar)
--------------------------------------------------------
Padding: 0 20px
Margin-bottom: 120px (space for fixed button)

Action buttons (flex, flex-direction: column, gap: 10px):

REQUEST REPORT BUTTON:
- Width: 100%
- Height: 48px
- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border-radius: 12px
- Display: flex, center items, justify: center, gap: 8px
- Font: Montserrat 600, 14px, #FFFFFF
- Text: "Запросить отчёт от шефа"
- Icon: <FileText size={18} />
- onClick: console.log('Request report')

REPORT PROBLEM BUTTON:
- Width: 100%
- Height: 48px
- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border-radius: 12px
- Display: flex, center items, justify: center, gap: 8px
- Font: Montserrat 600, 14px, #FFFFFF
- Text: "Сообщить о проблеме"
- Icon: <AlertTriangle size={18} />
- onClick: console.log('Report problem')

[9] FIXED BOTTOM BAR
--------------------
Position: fixed
Bottom: 0, left: 0, right: 0
Max-width: 390px
Margin: 0 auto
Background: rgba(26, 26, 26, 0.98)
Backdrop-filter: blur(20px)
Padding: 16px 20px 28px 20px
Border-top: 1px solid rgba(255, 255, 255, 0.08)
Box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3)
Z-index: 10

Info text:
- Font: Montserrat 400, 11px, #6B6B6B
- Text-align: center
- Margin-bottom: 10px
- Text: "Смена завершится автоматически в 02:00"

Button:
- Width: 100%
- Height: 52px
- Background: #E85D2F
- Border-radius: 14px
- Display: flex, center items, justify: center, gap: 10px
- Font: Montserrat 700, 15px, white
- Text: "Завершить смену досрочно"
- Icon: <StopCircle size={20} />
- Box-shadow: 0 6px 20px rgba(232, 93, 47, 0.4)
- onClick: console.log('End shift early')

Hover:
- Background: #D04D1F
- Transform: translateY(-2px)

═══════════════════════════════════════
INTERACTIVE BEHAVIOR
═══════════════════════════════════════

1. Real-time updates:
   - Timer updates every second
   - Worker status refreshes every 30s
   - Progress recalculates automatically

2. Worker card click:
   - Shows detailed worker profile
   - Check-in photo
   - Contact history

3. Contact buttons:
   - Call: Opens phone dialer
   - Message: Opens in-app chat

4. Refresh button:
   - Rotates 360° on click
   - Fetches latest status
   - Shows loading state

5. Status filter:
   - Dropdown to filter workers
   - Все / На объекте / Ожидают / Проблемы

6. Report problem:
   - Opens modal with issue categories
   - Sends to шеф + support

7. End shift early:
   - Confirmation dialog
   - Requires reason input
   - Notifies all workers

═══════════════════════════════════════
STATE MANAGEMENT
═══════════════════════════════════════

\`\`\`jsx
const [shiftData, setShiftData] = useState({
  id: 1,
  title: 'Монтаж выставочного стенда',
  location: 'Крокус Экспо, павильон 3',
  date: '28 января',
  startTime: '18:00',
  endTime: '02:00',
  status: 'in_progress',
  elapsedSeconds: 13335, // 3h 42m 15s
  totalSeconds: 28800, // 8 hours
  workers: workersData,
  shef: shefData,
  escrow: {
    amount: 10400,
    status: 'frozen'
  }
});

// Timer
useEffect(() => {
  const interval = setInterval(() => {
    setShiftData(prev => ({
      ...prev,
      elapsedSeconds: prev.elapsedSeconds + 1
    }));
  }, 1000);
  return () => clearInterval(interval);
}, []);

// Calculate progress
const progress = Math.round(
  (shiftData.elapsedSeconds / shiftData.totalSeconds) * 100
);

// Workers summary
const workersOnSite = workers.filter(w => w.status === 'on_site').length;
const workersPending = workers.filter(w => w.status === 'pending').length;
\`\`\`

═══════════════════════════════════════
TECHNICAL REQUIREMENTS
═══════════════════════════════════════

- React with hooks (useState, useEffect for timer)
- Tailwind CSS with Montserrat font
- Lucide React icons:
  • ArrowLeft, RefreshCw, Clock, TrendingUp
  • MapPin, Calendar, Users, User, HardHat
  • CheckCircle, AlertTriangle, Star
  • MessageCircle, Phone, Shield, Info
  • FileText, StopCircle, Check
- Mobile-first (390px base)
- Smooth animations
- Real-time timer
- Status refresh mechanism
- WebSocket ready
- TypeScript (optional)

FONT SETUP:
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

Apply globally:
font-family: 'Montserrat', system-ui, -apple-system, sans-serif;

Export as default component named "ShiftMonitoringScreen"

═══════════════════════════════════════
NAVIGATION FLOW
═══════════════════════════════════════

Screen 8 (Dashboard) → [Active shift card] → Screen 10 (Monitoring)
Screen 10 → [Worker card] → Worker detail modal
Screen 10 → [Contact button] → Phone/Chat
Screen 10 → [Report problem] → Problem report modal
Screen 10 → [End shift] → Confirmation → Rating screen
Screen 10 → [Back] → Screen 8

═══════════════════════════════════════
DESIGN NOTES
═══════════════════════════════════════

PURPOSE: Real-time control + transparency

KEY FEATURES:
1. **Live status** - Bright green banner with pulse
2. **Worker cards** - Left border color coding
3. **Progress tracking** - Visual timer + percentage
4. **Easy contact** - One-tap call/message
5. **Escrow visibility** - Trust through transparency

EMOTIONAL JOURNEY:
1. Open → Awareness (see everything at glance)
2. Monitor → Control (workers on site, green!)
3. Problem → Support (easy to contact/report)
4. Complete → Trust (escrow released safely)

INFORMATION HIERARCHY:
1. Status banner (most prominent)
2. Workers status (operational control)
3. Progress metrics (performance)
4. Escrow info (financial security)
5. Actions (problem resolution)
\`\`\`

---

**✅ ГОТОВО! Копируй и вставляй в v0.dev!**

Это **Shift Monitoring Screen** для заказчика с:
- 🟢 **BRIGHT green status banner** "В работе" с LIVE indicator
- ⏱️ **Real-time timer** (обновляется каждую секунду)
- 📊 **Progress bar** (46% завершено)
- 👷 **Worker cards** с LEFT BORDER color coding (green/yellow)
- ✅ **Check-in status** (На объекте / Ожидает)
- 📱 **Quick contact** (call/message шефа)
- 🛡️ **Escrow status card** (10 400 ₽ заморожено)
- 🚨 **Action buttons** (запросить отчёт, сообщить о проблеме)
- 🎨 **Matching screenshots** (dark bg, neon green, orange CTAs)
- 🔤 **Montserrat typography**

**Генерируем и продолжаем! Уже 10 экранов!** 🔥🚀
