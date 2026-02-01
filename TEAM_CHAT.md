# Team Group Chat Feature

## Overview

Групповой чат для бригады позволяет всем участникам (шеф + workers) общаться в реальном времени. Сообщения синхронизируются через Supabase Realtime.

## Files Created/Modified

### New Files:
- `supabase/migrations/018_team_messages.sql` - таблица для сообщений
- `components/teams/TeamChat.tsx` - компонент чата с real-time
- `app/shef/teams/[id]/chat/page.tsx` - страница чата

### Modified Files:
- `app/shef/teams/[id]/page.tsx` - добавлена кнопка "Чат бригады"

## Database Schema

### Table: `team_messages`

```sql
CREATE TABLE team_messages (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL (max 1000 chars),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes:
- `idx_team_messages_team_id` - для фильтрации по бригаде
- `idx_team_messages_sender_id` - для фильтрации по отправителю
- `idx_team_messages_created_at` - для сортировки по времени

### RLS Policies:
1. **View messages** - только участники бригады и шеф
2. **Send messages** - только участники бригады и шеф
3. **Delete messages** - только свои сообщения

## Features

### 1. **Real-time Updates**
- Использует Supabase Realtime channels
- Автоматическая синхронизация новых сообщений
- Без перезагрузки страницы

### 2. **Message Display**
- Bubble style layout
- Свои сообщения справа (оранжевый)
- Чужие сообщения слева (серый)
- Аватары отправителей
- Имя отправителя
- Timestamp с умным форматированием

### 3. **Auto-scroll**
- Автоматический скролл вниз при новых сообщениях
- Smooth scroll animation

### 4. **Input Features**
- Character counter (1000 max)
- Enter to send
- Disabled state во время отправки
- Loading indicator
- Auto-focus after send

### 5. **Error Handling**
- Toast notifications для ошибок
- Try/catch обработка
- Graceful fallbacks

## Component Props

### TeamChat

```typescript
interface Props {
  teamId: string          // ID бригады
  initialMessages: Message[]  // Начальные сообщения с сервера
}

interface Message {
  id: string
  team_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}
```

## Usage Flow

1. **Открыть бригаду** `/shef/teams/[id]`
2. **Нажать "Чат бригады"**
3. **Перейти в чат** `/shef/teams/[id]/chat`
4. **Видеть историю сообщений** (последние 100)
5. **Написать сообщение**
6. **Real-time обновление** для всех участников

## Real-time Implementation

### Subscribe to changes:

```typescript
supabase
  .channel(`team_chat_${teamId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'team_messages',
      filter: `team_id=eq.${teamId}`
    },
    async (payload) => {
      // Fetch sender info
      const { data: sender } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', payload.new.sender_id)
        .single()

      setMessages(prev => [...prev, { ...payload.new, sender }])
    }
  )
  .subscribe()
```

### Cleanup:

```typescript
return () => {
  supabase.removeChannel(channel)
}
```

## Message Formatting

### Time Display Logic:

```typescript
const formatTime = (timestamp: string) => {
  const diffMins = Math.floor((now - date) / 60000)

  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffMins < 1440) return '14:30' // HH:mm
  return '15 янв, 14:30' // dd MMM, HH:mm
}
```

## UI Components

### Header:
```
┌─────────────────────────────────┐
│ ← [💬] Основная бригада   [Инфо]│
│   👥 6 участников               │
└─────────────────────────────────┘
```

### Message Bubble:
```
┌─────────────────┐
│ 👤 Иван Петров  │ (Sender name)
│ ┌─────────────┐ │
│ │ Привет всем!│ │ (Message content)
│ └─────────────┘ │
│   14:30         │ (Timestamp)
└─────────────────┘
```

### Input:
```
┌─────────────────────────────────┐
│ [Написать сообщение...]  [📤]  │
│                    125/1000     │
└─────────────────────────────────┘
```

## Styling

### Own Messages:
- Background: `bg-orange-500`
- Text: `text-white`
- Position: `flex-row-reverse` (right side)
- Border radius: `rounded-br-sm` (sharp bottom-right)

### Other Messages:
- Background: `bg-white/10`
- Text: `text-white`
- Position: `flex-row` (left side)
- Border radius: `rounded-bl-sm` (sharp bottom-left)
- Avatar: gradient from blue-500 to blue-600

## Performance Optimizations

1. **Message Limit** - загружаем только последние 100 сообщений
2. **Lazy Loading** - можно добавить pagination для старых сообщений
3. **Memoization** - использовать React.memo для message items
4. **Debounce** - для character counter updates

## Security

### RLS Ensures:
- ✅ Только участники бригады видят сообщения
- ✅ Только участники могут отправлять
- ✅ Нельзя отправить за другого пользователя
- ✅ sender_id = auth.uid() проверяется на уровне БД

## Testing Checklist

- [ ] Отправка сообщения как шеф
- [ ] Получение сообщения как worker
- [ ] Real-time синхронизация между 2+ пользователями
- [ ] Автоскролл при новом сообщении
- [ ] Форматирование времени
- [ ] Character limit (1000)
- [ ] Отображение аватаров
- [ ] Empty state (нет сообщений)
- [ ] Error handling (нет сети)
- [ ] Длинные сообщения (word wrap)
- [ ] Emoji поддержка

## Future Enhancements

1. **Typing indicators** - "Иван печатает..."
2. **Read receipts** - "Прочитано"
3. **Message reactions** - 👍 ❤️ 😂
4. **File attachments** - отправка фото/документов
5. **Message search** - поиск по истории
6. **Voice messages** - голосовые сообщения
7. **Mentions** - @username упоминания
8. **Message editing** - редактирование отправленных
9. **Pagination** - загрузка старых сообщений
10. **Unread counter** - количество непрочитанных

## Related Features

- Teams management (`/shef/teams`)
- Team members (`team_members` table)
- User profiles (`users` table)
- Notifications (можно интегрировать)

## API Endpoints (Future)

Можно добавить REST API для:
- `POST /api/teams/[id]/messages` - отправка сообщения
- `GET /api/teams/[id]/messages` - история с pagination
- `DELETE /api/teams/[id]/messages/[messageId]` - удаление

## Notes

- Используется Supabase Realtime для live updates
- Сообщения хранятся навсегда (можно добавить TTL)
- Character limit: 1000 символов
- Загружаем последние 100 сообщений
- Auto-scroll работает через useRef + scrollIntoView
- Toast Provider используется для notifications
- Dark theme применён ко всем компонентам
