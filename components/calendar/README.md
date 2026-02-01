# Calendar Components

Calendar system for displaying worker shifts using react-big-calendar.

## Installation

```bash
npm install react-big-calendar date-fns
```

## Components

### ShiftCalendar

Reusable calendar component that can be embedded anywhere.

```tsx
import ShiftCalendar from '@/components/calendar/ShiftCalendar'

const shifts = [
  {
    id: '1',
    title: 'Монтаж стенда',
    start: new Date('2024-01-20T10:00:00'),
    end: new Date('2024-01-20T18:00:00'),
    status: 'assigned',
    pay_amount: 5000,
    location: 'Crocus Expo',
    client_name: 'Иван Иванов'
  }
]

<ShiftCalendar
  shifts={shifts}
  onSelectSlot={(slot) => console.log('Selected:', slot)}
  onSelectEvent={(event) => console.log('Event:', event)}
  view="month"
/>
```

### DayView

Shows detailed list of shifts for a specific day.

```tsx
import DayView from '@/components/calendar/DayView'

<DayView
  date={new Date()}
  shifts={shifts}
  onBackToCalendar={() => setView('month')}
/>
```

## Usage

### Full Calendar Page

The full calendar page at `app/(worker)/calendar/page.tsx` includes:

- Monthly view with color-coded shifts
- Click on any date to see day view
- Legend showing status colors
- Custom toolbar with navigation
- Automatic data loading from Supabase

**Features:**
- ✅ Month/Day view toggle
- ✅ Color coding by status
- ✅ Click to see shift details
- ✅ Navigation between months
- ✅ Today button
- ✅ Shift count display

### Color Coding

Shifts are color-coded by status:

- **Orange** (`assigned`) - Назначена
- **Green** (`checked_in`) - Отмечен
- **Dark Green** (`completed`) - Завершена
- **Red** (`cancelled`) - Отменена
- **Gray** (default) - Неизвестный статус

## Data Structure

```typescript
interface ShiftEvent {
  id: string
  title: string
  start: Date        // Start date and time
  end: Date          // End date and time
  status: string     // assigned, checked_in, completed, cancelled
  pay_amount: number
  location: string
  client_name: string
}
```

## Fetching Data

The calendar page fetches shifts from Supabase:

```typescript
const { data } = await supabase
  .from('shift_workers')
  .select(`
    id,
    status,
    shifts (
      id,
      title,
      date,
      start_time,
      end_time,
      pay_amount,
      location_address,
      users!client_id (full_name)
    )
  `)
  .eq('worker_id', user.id)
```

## Styling

Custom styles are in `app/globals.css` with the `.rbc-*` prefix.

Key customizations:
- Dark theme colors
- Rounded corners
- Hover effects
- Custom toolbar (hidden default, using custom)
- Event styling with status colors

## Navigation

```tsx
// Go to specific date
setCurrentDate(new Date('2024-12-25'))

// Switch views
setView('month') // or 'week', 'day'

// Handle date changes
const handleNavigate = (newDate: Date) => {
  setCurrentDate(newDate)
  // Load data for new date range if needed
}
```

## Customization

### Custom Event Renderer

```tsx
const CustomEvent = ({ event }: any) => (
  <div className="custom-event">
    <strong>{event.title}</strong>
    <div>{event.pay_amount} ₽</div>
  </div>
)

<Calendar
  components={{
    event: CustomEvent
  }}
/>
```

### Custom Toolbar

The default toolbar is hidden and replaced with a custom one. See `CustomToolbar` component in the calendar page for implementation.

## Localization

Calendar uses Russian locale from date-fns:

```typescript
import { ru } from 'date-fns/locale'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  getDay,
  locales: { ru }
})
```

All messages are translated to Russian in the `messages` prop.

## Performance

- Data is loaded once on mount
- Calendar efficiently renders visible dates only
- Events are sorted by date
- Day view filters shifts client-side for instant navigation

## Future Enhancements

Potential improvements:
- Week view implementation
- Drag and drop to reschedule
- Create new shifts from calendar
- Filter by status
- Export to iCal
- Print view
