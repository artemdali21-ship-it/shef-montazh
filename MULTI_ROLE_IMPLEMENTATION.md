## СИСТЕМА МНОЖЕСТВЕННЫХ РОЛЕЙ - ПОЛНАЯ РЕАЛИЗАЦИЯ

### Завершённые Компоненты

#### 1. **RoleSwitcher** ✓
- Компонент: `/components/auth/RoleSwitcher.tsx`
- Выпадающее меню в header с:
  - Текущей активной ролью
  - Списком всех доступных ролей
  - Кнопкой "Добавить роль"
  - Кнопкой "Выйти"
- Переключение ролей в 1 клик без перезагрузки страницы

#### 2. **Role Picker Page** ✓
- Страница: `/app/role-picker/page.tsx`
- Экран при входе если несколько ролей
- Отображает все доступные роли с иконками и описаниями
- Ссылка на добавление новой роли
- Если 1 роль — автоматический редирект в кабинет

#### 3. **Add Role Page** ✓
- Страница: `/app/settings/add-role/page.tsx`
- Выбор новой роли для добавления
- Фильтрует уже имеющиеся роли
- После выбора редирект на заполнение профиля

#### 4. **API Endpoints** ✓

**GET `/api/user/roles?telegramId=XXX`**
- Возвращает все роли пользователя
- Возвращает текущую активную роль

**POST `/api/auth/switch-role`**
- Параметры: `telegramId`, `newRole`
- Переключает активную роль
- Создаёт профиль если не существует

**POST `/api/auth/register`**
- Поддерживает добавление новой роли к существующему пользователю
- Проверяет есть ли уже такая роль

**POST `/api/auth/logout`**
- Очищает текущую роль
- Возвращает `multipleRoles: true/false`
- Если multiple roles — редирект на role-picker

**GET `/api/auth/me`** (обновлён)
- Возвращает `roles: UserRole[]`
- Возвращает `current_role: UserRole`

#### 5. **Login Flow** ✓
- `TelegramAutoLogin.tsx` проверяет количество ролей
- Если 1 роль → автоматический вход
- Если несколько ролей → редирект на role-picker
- Профиль обновляется, профиль не сбрасывается

#### 6. **Logout Flow** ✓
- `LogoutButton.tsx` вызывает `/api/auth/logout`
- Если несколько ролей → редирект на role-picker
- Если 1 роль → редирект на главную

#### 7. **useSession Hook** ✓
- Файл: `/lib/hooks/useSession.ts`
- Возвращает:
  - `user` — полные данные пользователя
  - `roles` — все доступные роли
  - `currentRole` — текущая активная роль
  - `isAuthenticated` — аутентифицирован ли

### База Данных

**Миграция:** `/supabase/migrations/035_multi_role_support.sql`

Добавлены колонки к `users` таблице:
- `roles TEXT[]` — массив всех ролей
- `current_role TEXT` — текущая активная роль
- `profile_completed BOOLEAN` — профиль заполнен

### Типы TypeScript

**File:** `/types/session.ts`

Обновлены:
- `Session` — добавлено поле `roles: UserRole[]`
- `UserByTelegramResponse` — добавлено `roles`
- `RegisterResponse` — добавлено `roles`
- `LogoutResponse` — добавлено `multipleRoles`

### Миграция Существующих Данных

Если уже есть пользователи со старой структурой:

```sql
-- Создать записи в user_roles из существующих users.role
INSERT INTO user_roles (user_id, role, is_active)
SELECT id, role, true FROM users WHERE role IS NOT NULL;

-- Удалить старую колонку role (после миграции)
ALTER TABLE users DROP COLUMN role;
```

### Workflow: Первая Регистрация

1. Пользователь открывает приложение
2. Выбирает роль на `/auth/register`
3. Заполняет профиль
4. Система создаёт запись в `users` с `roles = ['worker']`
5. Редирект в кабинет роли

### Workflow: Добавление Второй Роли

1. Пользователь идёт в Settings → "Добавить роль"
2. Выбирает новую роль на `/settings/add-role`
3. Заполняет профиль для новой роли
4. Система обновляет `users.roles = ['worker', 'client']`
5. Показывает role-picker для выбора активной роли

### Workflow: Вход с Несколькими Ролями

1. Пользователь открывает приложение с Telegram ID
2. `TelegramAutoLogin` проверяет `users.roles`
3. Если roles.length > 1 → редирект на `/role-picker`
4. Пользователь выбирает роль
5. Система обновляет `current_role`
6. Редирект в кабинет выбранной роли

### Workflow: Выход из Роли

1. Пользователь нажимает "Выйти" в RoleSwitcher
2. API обнуляет `current_role`
3. Если несколько ролей → показывает role-picker
4. Если 1 роль → редирект на главную

### Проверка Функциональности

```
✓ Первая регистрация с одной ролью
✓ Переключение между ролями в header
✓ Добавление второй роли в settings
✓ Вход автоматически редиректит на role-picker при нескольких ролях
✓ Выход показывает role-picker если несколько ролей
✓ Профили не сбрасываются при смене ролей
✓ RoleSwitcher показывает текущую роль
✓ API endpoints возвращают все роли
```

### Файлы Изменены

- `/app/api/auth/me/route.ts` — добавлены roles и current_role
- `/app/api/auth/logout/route.ts` — добавлена логика multipleRoles
- `/components/common/LogoutButton.tsx` — обновлен редирект
- `/components/auth/TelegramAutoLogin.tsx` — добавлена проверка multiple roles
- `/lib/hooks/useSession.ts` — новый hook для сессии
- `/types/session.ts` — обновлены типы

### Готовые Компоненты (Уже Существовали)

- `/components/auth/RoleSwitcher.tsx`
- `/app/role-picker/page.tsx`
- `/app/settings/add-role/page.tsx`
- `/app/api/auth/switch-role/route.ts`
- `/app/api/user/roles/route.ts`
