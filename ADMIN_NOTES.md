# Admin Notes Feature

## Overview

Система заметок для администраторов, позволяющая оставлять комментарии и примечания о пользователях. Полезно для отслеживания предупреждений, истории взаимодействий, причин решений и другой важной информации.

## Files Created

### New Files:
- `supabase/migrations/020_admin_notes.sql` - таблица заметок с RLS
- `components/admin/AdminNotes.tsx` - компонент управления заметками
- `app/admin/users/[id]/page.tsx` - страница детального просмотра пользователя

## Database Schema

### Table: `admin_notes`

```sql
CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fields:
- **id** - UUID, primary key
- **user_id** - ссылка на пользователя (CASCADE при удалении)
- **admin_id** - ссылка на админа (SET NULL если админ удалён)
- **note** - текст заметки (обязательное поле)
- **created_at** - дата создания (автоматически)

### Indexes:
- `idx_admin_notes_user_id` - поиск по пользователю
- `idx_admin_notes_admin_id` - поиск по админу
- `idx_admin_notes_created_at` - сортировка по дате (DESC)

### RLS Policies:
- **Admins can view notes** - только админы могут читать
- **Admins can insert notes** - только админы могут создавать
- **Admins can delete notes** - только админы могут удалять
- Админ может создавать заметки только от своего имени (admin_id = auth.uid())

## Features

### 1. **Add Note Form**

Форма для добавления заметки:
- Textarea с placeholder "Добавить заметку о пользователе..."
- Character counter (max 1000 символов)
- Button "Добавить заметку" с иконкой Plus
- Loading state во время отправки
- Validation: не пустая заметка

### 2. **Notes List**

Список заметок с информацией:
- Аватар/инициалы админа
- Имя админа (или "Удалённый админ" если админ удалён)
- Дата и время создания
- Текст заметки (с поддержкой переносов строк)
- Кнопка удаления
- Badge с количеством заметок в заголовке

### 3. **Empty State**

Когда заметок нет:
- Иконка StickyNote (серая)
- "Заметок пока нет"
- "Добавьте первую заметку о пользователе"

### 4. **Delete Confirmation**

При удалении:
- Confirmation dialog: "Удалить заметку?"
- Loading state на кнопке удаления
- Toast notification: "Заметка удалена"

## User Detail Page

### Components:

1. **Header**:
   - Back button (к списку пользователей)
   - Заголовок "Профиль пользователя"
   - Email
   - Button "История" (к timeline)

2. **User Info Card**:
   - Аватар (или инициалы)
   - Имя с Shield icon (если admin/shef)
   - Email, телефон, дата регистрации
   - Роль badge (цветной)
   - Ban status (если заблокирован)
   - Active status (если активен)

3. **Statistics Cards**:
   - **Смены**: завершено/всего
   - **Рейтинг**: средняя оценка
   - **Заработано**: общая сумма
   - **Споры**: количество споров

4. **Admin Notes Component**:
   - Интегрированный компонент заметок

## Usage

### View User Detail:
```
/admin/users/123e4567-e89b-12d3-a456-426614174000
```

### Add Note:
1. Navigate to user detail page
2. Scroll to "Заметки админа" section
3. Type note in textarea
4. Click "Добавить заметку"

### Delete Note:
1. Click trash icon on note
2. Confirm deletion
3. Note removed from list

## Database Functions

### get_user_notes_count(user_uuid):
```sql
SELECT get_user_notes_count('user-id');
-- Returns: count of notes for user
```

### get_recent_admin_notes(limit_count):
```sql
SELECT * FROM get_recent_admin_notes(10);
-- Returns: last 10 notes across all users with user/admin names
```

## Component Props

### AdminNotes Component:

```typescript
interface Props {
  userId: string  // User ID to show notes for
}
```

## API Operations

### Load Notes:
```typescript
const { data } = await supabase
  .from('admin_notes')
  .select(`
    *,
    admin:admin_id (
      id,
      full_name,
      avatar_url
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

### Add Note:
```typescript
const { error } = await supabase
  .from('admin_notes')
  .insert({
    user_id: userId,
    admin_id: currentAdmin.id,
    note: noteText
  })
```

### Delete Note:
```typescript
const { error } = await supabase
  .from('admin_notes')
  .delete()
  .eq('id', noteId)
```

## Use Cases

### 1. Warning History:
```
"Пользователь получил предупреждение за нарушение правил
поведения в чате. Следующее нарушение приведет к бану."
```

### 2. Support Notes:
```
"Пользователь обратился с вопросом о выплате. Проблема
решена, выплата будет произведена в течение 3 рабочих дней."
```

### 3. Investigation Notes:
```
"Проверяется подозрение в мошенничестве. Пользователь
создает фиктивные смены и отменяет их. Под наблюдением."
```

### 4. Quality Notes:
```
"Отличный исполнитель! Всегда качественно выполняет
работу, много положительных отзывов. Рекомендуется
для приоритетного назначения."
```

### 5. Resolution Notes:
```
"Спор разрешен в пользу клиента. Пользователь согласен
с решением, конфликт исчерпан. Дополнительных мер не требуется."
```

## Styling

- **Dark theme** - bg-white/5, backdrop-blur-xl
- **Border** - border-white/10
- **Text colors** - white for headings, gray-300/400 for text
- **Button** - orange-500 primary action
- **Delete button** - red-400 with hover effect
- **Note cards** - white/5 with hover effect
- **Badge** - orange-500/20 with count

## Security

- **RLS Enabled** - только админы имеют доступ
- **Admin verification** - проверка роли при всех операциях
- **Cascade deletion** - заметки удаляются при удалении пользователя
- **SET NULL** - admin_id становится NULL если админ удалён
- **Validation** - проверка на пустые заметки

## Testing Checklist

- [ ] Add note for user
- [ ] View notes list
- [ ] Delete note with confirmation
- [ ] Empty state when no notes
- [ ] Admin avatar displays correctly
- [ ] Date formatting correct
- [ ] Character counter works
- [ ] Form validation (empty note)
- [ ] Loading states work
- [ ] Toast notifications display
- [ ] Deleted admin shows as "Удалённый админ"
- [ ] Multi-line notes display correctly
- [ ] Only admins can access
- [ ] Non-admins see error/redirect

## Future Enhancements

1. **Note Categories** - tag notes (warning, positive, investigation)
2. **Note Templates** - predefined note templates
3. **Mentions** - @mention other admins in notes
4. **Search** - search within notes
5. **Edit Notes** - ability to edit existing notes
6. **Note Attachments** - attach files/images to notes
7. **Private Notes** - notes visible only to specific admins
8. **Note Notifications** - notify admins of new notes
9. **Export Notes** - download all notes for user
10. **Note History** - track edits to notes

## Related Features

- User management (`/admin/users`)
- User history (`/admin/users/[id]/history`)
- Audit logs (`/admin/logs`)
- Disputes (`/admin/disputes`)

## Performance

- Notes loaded on page load (not lazy)
- No pagination (assumes reasonable number of notes per user)
- Consider pagination if user has 50+ notes
- Real-time updates not implemented (refresh to see new notes)

## Best Practices

1. **Be Professional** - notes may be reviewed or audited
2. **Be Specific** - include dates, details, context
3. **Be Factual** - stick to facts, not opinions
4. **Be Concise** - keep notes brief but informative
5. **Use Timestamps** - system adds timestamps automatically
6. **Document Actions** - record what actions were taken
7. **Follow Up** - add notes after resolving issues

## Example Workflow

### User Support Case:
1. User contacts support about payment issue
2. Admin investigates → adds note: "User reported missing payment for shift #123"
3. Admin finds issue → adds note: "Payment was stuck in processing. Manually triggered."
4. Issue resolved → adds note: "Payment processed successfully. User notified."

### Ban Decision:
1. User reported for violations
2. Admin reviews → adds note: "User received multiple complaints about behavior"
3. Admin decides → adds note: "User banned for 7 days. Reason: harassment in chat"
4. Ban expires → adds note: "Ban expired. User warned about future violations"

## Dependencies

- **supabase** - database operations
- **lucide-react** - icons
- **ToastProvider** - notifications

## Notes

- Notes are **permanent** - no automatic deletion
- Notes are **admin-only** - users cannot see them
- Notes support **multi-line text** with whitespace-pre-wrap
- Character limit: **1000 characters**
- Newest notes shown **first** (descending order)
- Admin info fetched via **join** for efficiency
- Toast notifications for **all operations**
