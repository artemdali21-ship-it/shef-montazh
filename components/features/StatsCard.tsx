**ЛЕТИМ! 🚀 Screen 11 — ШЕФ-МОНТАЖНИК DASHBOARD!**

Это **ключевая роль** — координатор между заказчиком и бригадой!

---

# 📋 ТЗ ДЛЯ V0.DEV — ЭКРАН 11: "ДАШБОРД ШЕФ-МОНТАЖНИКА"

\`\`\`
Create a mobile-first React component for crew management dashboard of "ШЕФ-МОНТАЖ" platform.
This is SCREEN 11 - the interface for Шеф-монтажник (crew coordinator/foreman).

CRITICAL: Focus on crew control and work acceptance workflow.
CRITICAL: Show worker check-in status and quality rating interface.
CRITICAL: Match visual language from screenshots (dark bg, neon green, orange CTAs).
CRITICAL: Use Montserrat font for ALL text elements.

═══════════════════════════════════════
DESIGN SYSTEM (MATCHING SCREENSHOTS)
═══════════════════════════════════════

TYPOGRAPHY:
Import Montserrat from Google Fonts:
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

Font family: 'Montserrat', system-ui, -apple-system, sans-serif

Font weights usage:
• 800 (Extrabold): Stats numbers, earnings
• 700 (Bold): Section headers, worker names, buttons
• 600 (Semibold): Card titles, status labels
• 500 (Medium): Metadata, timestamps
• 400 (Regular): Body text, descriptions

COLORS (EXACT FROM SCREENSHOTS):
• Background: Linear gradient #2A2A2A (top) → #1A1A1A (bottom)
• Card background: rgba(169, 169, 169, 0.2)
• Primary accent: #E85D2F (construction orange)
• Success/Active: #BFFF00 (bright neon green)
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

[1] HEADER (fixed, 80px height)
--------------------------------
Background: rgba(42, 42, 42, 0.98)
Backdrop-filter: blur(20px)
Padding: 16px 20px
Border-bottom: 1px solid rgba(255, 255, 255, 0.08)
Z-index: 10

Profile section (flex, gap: 14px, align-items: center):

Avatar:
- Size: 48px × 48px circle
- Background: rgba(232, 93, 47, 0.2)
- Border: 2px solid rgba(255, 255, 255, 0.1)
- Display: flex, center items
- Icon: <HardHat size={24} color="#E85D2F" />

Info (flex-1):
- Name:
  • Font: Montserrat 700, 16px, #FFFFFF
  • Text: "Игорь Петров"
- Role:
  • Font: Montserrat 500, 12px, #9B9B9B
  • Display: flex, gap: 6px, align-items: center
  • Icon: <Award size={12} color="#FFD60A" />
  • Text: "Шеф-монтажник • 4.8★"

Right side:
- Notifications bell:
  • 40px × 40px circle
  • Background: rgba(255, 255, 255, 0.08)
  • Border: 1px solid rgba(255, 255, 255, 0.1)
  • Icon: <Bell size={18} color="#FFFFFF" />
  • Badge: Small red dot (8px) if unread

[2] ACTIVE SHIFT BANNER (if has active shift)
----------------------------------------------
Background: linear-gradient(135deg, #BFFF00 0%, #A8E600 100%)
Padding: 20px
Margin: 0 20px 20px 20px
Border-radius: 16px
Box-shadow: 0 4px 16px rgba(191, 255, 0, 0.3)

Content layout: flex, space-between, align-items: center

Left side:
- Status label:
  • Font: Montserrat 500, 11px, #1A1A1A
  • Letter-spacing: 0.5px
  • Margin-bottom: 4px
  • Text: "АКТИВНАЯ СМЕНА"
- Shift title:
  • Font: Montserrat 700, 16px, #1A1A1A
  • Margin-bottom: 4px
  • Text: "Монтаж выставочного стенда"
- Meta:
  • Font: Montserrat 500, 12px, rgba(26, 26, 26, 0.7)
  • Text: "Крокус Экспо • 18:00-02:00"

Right side:
- Arrow button:
  • Size: 40px × 40px circle
  • Background: rgba(26, 26, 26, 0.15)
  • Icon: <ArrowRight size={20} color="#1A1A1A" />
  • onClick: Navigate to shift detail

[3] STATS ROW
-------------
Padding: 0 20px
Margin-bottom: 24px

Card:
- Background: rgba(169, 169, 169, 0.2)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 14px
- Padding: 18px

Grid: 3 columns, equal width, with dividers

\`\`\`jsx
const stats = [
  { label: 'Смен закрыто', value: 132, icon: 'CheckCircle', color: '#BFFF00' },
  { label: 'Моя ставка', value: '3 500 ₽', icon: 'Wallet', color: '#E85D2F' },
  { label: 'Рейтинг', value: '4.8', icon: 'Star', color: '#FFD60A' }
];
\`\`\`

Stat item:
- Display: flex, flex-direction: column, align-items: center, gap: 8px

Icon container:
- Size: 32px × 32px
- Background: rgba(color, 0.15)
- Border-radius: 8px
- Display: flex, center items
- Icon: size 16px, color from stat

Value:
- Font: Montserrat 800, 20px, #FFFFFF
- Letter-spacing: -0.3px
- Line-height: 1

Label:
- Font: Montserrat 500, 11px, #6B6B6B
- Text-align: center
- Margin-top: 4px

Divider (between stats):
- Width: 1px
- Height: 40px
- Background: rgba(255, 255, 255, 0.08)

[4] MY CREW SECTION
-------------------
Padding: 0 20px
Margin-bottom: 20px

Section header (flex, space-between, align-items: center, margin-bottom: 14px):
- Left:
  • Font: Montserrat 700, 17px, #FFFFFF
  • Text: "Моя бригада"
- Right:
  • Status summary:
    - Font: Montserrat 600, 13px, #9B9B9B
    - Text: "3/4 на объекте"

Workers container:
- Display: flex, flex-direction: column, gap: 10px

\`\`\`jsx
const crewMembers = [
  {
    id: 1,
    name: 'Никита Соколов',
    role: 'Монтажник',
    status: 'on_site',
    checkInTime: '18:05',
    checkInPhoto: 'url',
    rating: 4.9,
    phone: '+7 999 123 45 67',
    canRate: false
  },
  {
    id: 2,
    name: 'Алексей Морозов',
    role: 'Монтажник',
    status: 'on_site',
    checkInTime: '18:12',
    checkInPhoto: 'url',
    rating: 4.7,
    phone: '+7 999 234 56 78',
    canRate: false
  },
  {
    id: 3,
    name: 'Дмитрий Волков',
    role: 'Монтажник',
    status: 'on_site',
    checkInTime: '18:08',
    checkInPhoto: 'url',
    rating: 4.6,
    phone: '+7 999 345 67 89',
    canRate: false
  },
  {
    id: 4,
    name: 'Сергей Кузнецов',
    role: 'Монтажник',
    status: 'pending',
    checkInTime: null,
    checkInPhoto: null,
    rating: 4.5,
    phone: '+7 999 456 78 90',
    canRate: false
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
- Position: relative

LEFT BORDER ACCENT (by status):
- Position: absolute, left: 0, top: 0, bottom: 0
- Width: 4px
- Border-radius: 14px 0 0 14px

Colors:
- on_site: #BFFF00
- pending: #FFD60A
- problem: #FF4444

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

Content (flex-1):

Header row (flex, space-between, margin-bottom: 6px):
- Name:
  • Font: Montserrat 700, 15px, #FFFFFF
- Actions (flex, gap: 6px):
  • Call button:
    - Size: 32px × 32px
    - Background: rgba(191, 255, 0, 0.15)
    - Border: 1px solid #BFFF00
    - Border-radius: 8px
    - Icon: <Phone size={14} color="#BFFF00" />
  • Photo button (if status = on_site):
    - Size: 32px × 32px
    - Background: rgba(255, 255, 255, 0.08)
    - Border-radius: 8px
    - Icon: <Image size={14} color="#FFFFFF" />
    - onClick: View check-in photo

Role & rating row (flex, gap: 8px, align-items: center, margin-bottom: 8px):
- Role:
  • Font: Montserrat 500, 12px, #9B9B9B
- Separator: "•"
- Rating:
  • Display: flex, gap: 3px
  • Icon: <Star size={12} fill="#FFD60A" color="#FFD60A" />
  • Text: "4.9"
  • Font: Montserrat 600, 12px, #FFD60A

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

[5] QUICK ACTIONS SECTION
--------------------------
Padding: 0 20px
Margin-bottom: 20px

Section header:
- Font: Montserrat 700, 17px, #FFFFFF
- Margin-bottom: 14px
- Text: "Быстрые действия"

Actions grid:
- Display: grid, grid-template-columns: repeat(2, 1fr), gap: 10px

\`\`\`jsx
const quickActions = [
  { 
    id: 'confirm_all',
    icon: 'CheckSquare',
    label: 'Подтвердить всех',
    subtitle: 'Check-in',
    color: '#BFFF00',
    disabled: false
  },
  { 
    id: 'request_photo',
    icon: 'Camera',
    label: 'Запросить фото',
    subtitle: 'От бригады',
    color: '#E85D2F',
    disabled: false
  },
  { 
    id: 'emergency',
    icon: 'AlertTriangle',
    label: 'Проблема',
    subtitle: 'Сообщить',
    color: '#FF4444',
    disabled: false
  },
  { 
    id: 'export_list',
    icon: 'FileText',
    label: 'Список бригады',
    subtitle: 'Экспорт',
    color: '#9B9B9B',
    disabled: false
  }
];
\`\`\`

ACTION CARD STYLING:
- Height: 100px
- Background: rgba(169, 169, 169, 0.2)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 14px
- Padding: 16px
- Display: flex, flex-direction: column, justify-content: space-between
- Cursor: pointer
- Transition: all 0.2s ease

Hover:
- Background: rgba(169, 169, 169, 0.3)
- Transform: translateY(-2px)

Icon container:
- Size: 36px × 36px
- Background: rgba(color, 0.15)
- Border-radius: 10px
- Display: flex, center items
- Icon: size 18px, color from action

Label:
- Font: Montserrat 700, 14px, #FFFFFF
- Margin-bottom: 2px

Subtitle:
- Font: Montserrat 500, 11px, #6B6B6B

[6] WORK ACCEPTANCE SECTION (if shift active)
----------------------------------------------
Padding: 0 20px
Margin-bottom: 20px

Section header:
- Font: Montserrat 700, 17px, #FFFFFF
- Margin-bottom: 14px
- Text: "Приемка работ"

Card:
- Background: rgba(169, 169, 169, 0.2)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border-radius: 14px
- Padding: 20px

Checklist items:
\`\`\`jsx
const acceptanceChecklist = [
  { id: 1, label: 'Все работы выполнены', checked: false },
  { id: 2, label: 'Инструмент собран', checked: false },
  { id: 3, label: 'Площадка убрана', checked: false },
  { id: 4, label: 'Нет замечаний по качеству', checked: false }
];
\`\`\`

CHECKLIST ITEM:
- Display: flex, gap: 12px, align-items: center
- Padding: 12px 0
- Border-bottom: 1px solid rgba(255, 255, 255, 0.05) (except last)

Checkbox:
- Size: 24px × 24px
- Border: 2px solid rgba(255, 255, 255, 0.2)
- Border-radius: 6px
- Background: transparent (unchecked) or #BFFF00 (checked)
- Icon: <Check size={14} color="#1A1A1A" /> when checked
- Cursor: pointer

Label:
- Font: Montserrat 600, 14px, #FFFFFF

Complete button (margin-top: 16px):
- Width: 100%
- Height: 48px
- Background: #BFFF00
- Border-radius: 12px
- Display: flex, center items, justify: center, gap: 8px
- Font: Montserrat 700, 14px, #1A1A1A
- Text: "Подтвердить выполнение"
- Icon: <CheckCircle size={18} color="#1A1A1A" />
- Box-shadow: 0 4px 16px rgba(191, 255, 0, 0.4)
- Disabled if not all checked

Disabled state:
- Background: rgba(191, 255, 0, 0.3)
- Opacity: 0.5

[7] RATE WORKERS MODAL (triggered after acceptance)
----------------------------------------------------
Appears after "Подтвердить выполнение"

Overlay:
- Position: fixed, full screen
- Background: rgba(0, 0, 0, 0.8)
- Backdrop-filter: blur(8px)
- Z-index: 100

Modal:
- Max-width: 350px
- Background: #2A2A2A
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border-radius: 20px
- Padding: 24px
- Position: center screen

Header:
- Font: Montserrat 700, 18px, #FFFFFF
- Margin-bottom: 8px
- Text: "Оцените работу бригады"

Description:
- Font: Montserrat 400, 13px, #9B9B9B
- Line-height: 1.5
- Margin-bottom: 20px
- Text: "Ваша оценка влияет на рейтинг исполнителей"

Workers list for rating:
- Display: flex, flex-direction: column, gap: 16px

RATING WORKER ITEM:
-------------------
Layout: flex, space-between, align-items: center
Padding-bottom: 16px
Border-bottom: 1px solid rgba(255, 255, 255, 0.08) (except last)

Left side (flex, gap: 12px, align-items: center):
- Small avatar:
  • Size: 40px × 40px circle
  • Background: rgba(232, 93, 47, 0.2)
  • Icon: <User size={20} color="#E85D2F" />
- Name:
  • Font: Montserrat 600, 14px, #FFFFFF

Right side:
- Star rating (5 stars):
  • Display: flex, gap: 6px
  • Star size: 24px × 24px
  • Empty: <Star size={20} color="#6B6B6B" />
  • Filled: <Star size={20} fill="#FFD60A" color="#FFD60A" />
  • onClick: Set rating

Comment section (optional, margin-top: 16px):
- Label: "Комментарий (необязательно)"
  • Font: Montserrat 600, 13px, #FFFFFF
  • Margin-bottom: 8px
- Textarea:
  • Width: 100%
  • Height: 80px
  • Background: rgba(255, 255, 255, 0.05)
  • Border: 1px solid rgba(255, 255, 255, 0.1)
  • Border-radius: 10px
  • Padding: 12px
  • Font: Montserrat 400, 13px, #FFFFFF
  • Placeholder: "Опишите качество работы..."

Buttons row (flex, gap: 10px, margin-top: 20px):

Skip button:
- Flex: 1
- Height: 48px
- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border-radius: 12px
- Font: Montserrat 600, 14px, #9B9B9B
- Text: "Пропустить"

Submit button:
- Flex: 1
- Height: 48px
- Background: #E85D2F
- Border-radius: 12px
- Font: Montserrat 700, 14px, white
- Text: "Отправить"
- Icon: <Send size={16} />
- Box-shadow: 0 4px 16px rgba(232, 93, 47, 0.4)

[8] BOTTOM NAVIGATION (fixed, if needed)
-----------------------------------------
Position: fixed
Bottom: 0, left: 0, right: 0
Max-width: 390px
Margin: 0 auto
Background: rgba(26, 26, 26, 0.98)
Backdrop-filter: blur(20px)
Padding: 12px 20px 28px 20px
Border-top: 1px solid rgba(255, 255, 255, 0.08)
Z-index: 10

Nav items (flex, justify: space-around):
\`\`\`jsx
const navItems = [
  { id: 'shifts', icon: 'Calendar', label: 'Смены' },
  { id: 'crew', icon: 'Users', label: 'Бригада', active: true },
  { id: 'earnings', icon: 'Wallet', label: 'Заработок' },
  { id: 'profile', icon: 'User', label: 'Профиль' }
];
\`\`\`

Nav item:
- Display: flex, flex-direction: column, align-items: center, gap: 4px
- Cursor: pointer

Icon:
- Size: 24px
- Color: #6B6B6B (inactive) or #E85D2F (active)

Label:
- Font: Montserrat 600, 10px
- Color: #6B6B6B (inactive) or #E85D2F (active)

═══════════════════════════════════════
INTERACTIVE BEHAVIOR
═══════════════════════════════════════

1. Worker card interactions:
   - Call button: Opens phone dialer
   - Photo button: Shows check-in photo modal
   - Card tap: Expands with more details

2. Quick actions:
   - Confirm all: Bulk check-in confirmation
   - Request photo: Sends notification to all workers
   - Emergency: Opens incident report form
   - Export list: Downloads crew list PDF

3. Work acceptance flow:
   - Check all items
   - Click "Подтвердить выполнение"
   - Opens rating modal
   - Rate each worker (1-5 stars)
   - Submit or skip
   - Success message → Navigate to earnings

4. Real-time updates:
   - Worker status refreshes every 30s
   - Notifications for check-ins
   - Push alerts for problems

═══════════════════════════════════════
STATE MANAGEMENT
═══════════════════════════════════════

\`\`\`jsx
const [dashboardData, setDashboardData] = useState({
  shef: {
    name: 'Игорь Петров',
    rating: 4.8,
    totalShifts: 132,
    currentRate: 3500
  },
  activeShift: {
    id: 1,
    title: 'Монтаж выставочного стенда',
    location: 'Крокус Экспо',
    startTime: '18:00',
    endTime: '02:00'
  },
  crew: crewMembers,
  acceptance: {
    checklist: acceptanceChecklist,
    canComplete: false
  }
});

const [showRatingModal, setShowRatingModal] = useState(false);
const [ratings, setRatings] = useState({});

// Check if all checklist items completed
const allChecked = acceptance.checklist.every(item => item.checked);

// Workers on site count
const workersOnSite = crew.filter(w => w.status === 'on_site').length;
\`\`\`

═══════════════════════════════════════
TECHNICAL REQUIREMENTS
═══════════════════════════════════════

- React with hooks (useState for state, useEffect for real-time)
- Tailwind CSS with Montserrat font
- Lucide React icons:
  • HardHat, Bell, ArrowRight, CheckCircle, Wallet, Star
  • User, Phone, Image, MapPin, Clock, Check
  • CheckSquare, Camera, AlertTriangle, FileText
  • Send, Calendar, Users, Award, Plus, Minus
- Mobile-first (390px base)
- Smooth animations
- Modal system
- Star rating component
- TypeScript (optional)

FONT SETUP:
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

Apply globally:
font-family: 'Montserrat', system-ui, -apple-system, sans-serif;

Export as default component named "ShefDashboardScreen"

═══════════════════════════════════════
NAVIGATION FLOW
═══════════════════════════════════════

Login → Screen 11 (Shef Dashboard)
Screen 11 → [Active shift banner] → Shift detail (like Screen 10 but with shef controls)
Screen 11 → [Worker card] → Worker detail
Screen 11 → [Quick action] → Action modal
Screen 11 → [Complete acceptance] → Rating modal → Success → Earnings screen
Screen 11 → [Bottom nav] → Other sections

═══════════════════════════════════════
DESIGN NOTES
═══════════════════════════════════════

PURPOSE: Crew control + work acceptance authority

KEY FEATURES:
1. **Crew visibility** - See all workers and statuses
2. **Quick actions** - Common tasks one-tap away
3. **Acceptance workflow** - Checklist → Confirm → Rate
4. **Communication** - Direct call to workers
5. **Quality control** - Rate workers after shift

ROLE AUTHORITY:
- Can confirm worker check-ins
- Can request photos/reports
- MUST approve work completion for escrow release
- Can rate workers (affects their future rates)

EMOTIONAL JOURNEY:
1. Open → Awareness (who's on site?)
2. Monitor → Control (all confirmed, good!)
3. Accept → Authority (quality checked, approve!)
4. Rate → Influence (help good workers succeed)

INFORMATION HIERARCHY:
1. Active shift (if in progress)
2. Crew status (operational)
3. Quick actions (common tasks)
4. Acceptance workflow (critical gate)
5. Stats (performance tracking)
\`\`\`

---

**✅ ГОТОВО! Копируй и вставляй в v0.dev!**

Это **Шеф-монтажник Dashboard** с:
- 👷 **Profile header** с ролью и рейтингом
- 🟢 **Active shift banner** (bright green)
- 📊 **Stats row** (132 смены, ставка 3500₽, рейтинг 4.8)
- 👥 **Crew cards** с LEFT BORDER color coding + check-in status
- 📞 **Quick contact** (call button на каждом работнике)
- ⚡ **Quick actions grid** (подтвердить всех, запросить фото, проблема, экспорт)
- ✅ **Work acceptance checklist** (4 пункта проверки)
- ⭐ **Rating modal** (оценка каждого работника после завершения)
- 🎨 **Industrial style** (dark bg, neon green, orange CTAs, Montserrat)

**Генерируем Screen 11 и продолжаем! 11 из 13!** 🚀🔥
