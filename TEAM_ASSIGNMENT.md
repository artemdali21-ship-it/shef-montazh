# Team Assignment Feature

## Overview

Функция группового назначения бригады на смену позволяет клиенту (шеф-монтажнику) назначить всю бригаду на смену одним кликом вместо добавления каждого участника по отдельности.

## Files Created/Modified

### New Files:
- `components/shifts/AssignTeamButton.tsx` - компонент кнопки и модального окна для назначения бригады

### Modified Files:
- `app/client/shifts/[id]/monitoring/page.tsx` - добавлена кнопка AssignTeamButton

## Features

### 1. **Выбор бригады из списка**
- Показывает все бригады текущего клиента
- Отображает количество участников в каждой бригаде
- Превью аватаров участников (до 5 + счетчик остальных)
- Disabled state для пустых бригад

### 2. **Автоматическое создание shift_workers**
- Создает записи `shift_workers` для всех участников бригады
- Статус: `assigned`
- Проверка на дубликаты - пропускает уже назначенных работников

### 3. **Уведомления участникам**
- Автоматически создает уведомления для всех назначенных работников
- Тип: `shift_assigned`
- Содержит информацию о смене и бригаде

### 4. **Статус назначения**
- Показывает сколько участников было назначено
- Информирует если кто-то уже был назначен
- Loader во время процесса назначения

## Component Props

### AssignTeamButton

```typescript
interface Props {
  shiftId: string        // ID смены
  clientId: string       // ID клиента (для загрузки его бригад)
  onSuccess: () => void  // Callback после успешного назначения
}
```

## Usage Example

```tsx
import AssignTeamButton from '@/components/shifts/AssignTeamButton'

<AssignTeamButton
  shiftId={shiftId}
  clientId={userId}
  onSuccess={() => {
    refreshData()
    loadShift()
  }}
/>
```

## Flow

1. **Клиент открывает страницу мониторинга смены**
   - `/client/shifts/[id]/monitoring`

2. **Нажимает "Назначить бригаду"**
   - Открывается модальное окно со списком бригад

3. **Выбирает бригаду**
   - Показывается подтверждение с количеством участников

4. **Подтверждает назначение**
   - Создаются `shift_workers` для всех участников
   - Создаются уведомления
   - Показывается toast с результатом

5. **Обновляется список исполнителей**
   - Callback `onSuccess()` обновляет данные
   - В WorkerStatusList появляются новые участники

## Database Operations

### Queries:

1. **Load teams:**
```sql
SELECT *,
  team_members(
    worker_id,
    worker:users(id, full_name, avatar_url)
  )
FROM teams
WHERE shef_id = ?
ORDER BY created_at DESC
```

2. **Check existing assignments:**
```sql
SELECT worker_id
FROM shift_workers
WHERE shift_id = ?
```

3. **Insert shift_workers:**
```sql
INSERT INTO shift_workers (shift_id, worker_id, status)
VALUES (?, ?, 'assigned')
```

4. **Insert notifications:**
```sql
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (?, 'shift_assigned', ?, ?, ?)
```

## Edge Cases Handled

1. **Пустая бригада**
   - Button disabled
   - Toast error при попытке назначения

2. **Дублирование назначений**
   - Проверка существующих `shift_workers`
   - Пропуск уже назначенных
   - Информативное сообщение о пропущенных

3. **Все участники уже назначены**
   - Toast warning
   - Операция не выполняется

4. **Ошибка при назначении**
   - Try/catch обработка
   - Toast error с деталями
   - Loader сбрасывается

## Styling

- **Dark theme** с glassmorphism
- **Blue accent** для team-related features
- **Animations**: loading spinner, hover effects
- **Responsive**: mobile-first подход
- **Avatar previews**: gradient backgrounds, overlap effect

## Testing

### Manual Testing Steps:

1. **Создать бригаду** (`/shef/teams/create`)
2. **Добавить участников** в бригаду
3. **Создать смену** (`/create-shift`)
4. **Открыть мониторинг** (`/client/shifts/[id]/monitoring`)
5. **Нажать "Назначить бригаду"**
6. **Выбрать бригаду** из списка
7. **Проверить:**
   - Появились ли участники в WorkerStatusList
   - Получили ли работники уведомления
   - Работает ли проверка на дубликаты (попробовать назначить снова)

### Edge Cases to Test:

- [ ] Назначение пустой бригады
- [ ] Повторное назначение той же бригады
- [ ] Назначение когда все участники уже в смене
- [ ] Назначение большой бригады (10+ человек)
- [ ] Отмена в модальном окне
- [ ] Ошибка сети во время назначения

## Future Enhancements

1. **Bulk notifications** - группировка уведомлений
2. **Assignment history** - история назначений бригад
3. **Team performance stats** - показывать статистику работы бригады
4. **Quick assign** - быстрое назначение избранной бригады
5. **Undo assignment** - отмена назначения всей бригады
6. **Team availability check** - проверка доступности участников

## Related Features

- Teams management (`/shef/teams`)
- Shift monitoring (`/client/shifts/[id]/monitoring`)
- Notifications (`notifications` table)
- Worker status (`shift_workers` table)

## Notes

- Используется новая структура БД с junction table `team_members` вместо массива `worker_ids`
- Совместимо с RLS policies для teams и shift_workers
- Toast notifications интегрированы через ToastProvider
- Client-side component для интерактивности
