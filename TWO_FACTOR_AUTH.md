# Two-Factor Authentication (2FA) System

## Overview

Система двухфакторной аутентификации для админов на основе TOTP (Time-based One-Time Password). Использует стандартные приложения-аутентификаторы (Google Authenticator, Authy и др.).

## Files Created

### API Routes:
- `app/api/admin/2fa/setup/route.ts` - генерация секрета и QR-кода
- `app/api/admin/2fa/verify/route.ts` - проверка токена и активация 2FA
- `app/api/admin/2fa/disable/route.ts` - отключение 2FA с проверкой токена

### Components:
- `components/admin/TwoFactorSetup.tsx` - UI для настройки 2FA
- `app/admin/settings/page.tsx` - страница настроек безопасности

### Database:
- `supabase/migrations/021_two_factor_auth.sql` - добавление колонок в users

## Database Schema

```sql
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
CREATE INDEX idx_users_two_factor_enabled ON users(two_factor_enabled) WHERE two_factor_enabled = true;
```

### Helper Functions:
- `user_has_2fa_enabled(user_uuid)` - проверка статуса 2FA
- `get_2fa_stats()` - статистика использования 2FA среди админов

## Flow

### 1. Setup (Настройка)

**Endpoint**: `POST /api/admin/2fa/setup`

```typescript
// Request: no body needed
// Response:
{
  secret: "JBSWY3DPEHPK3PXP",     // Base32 секрет для ручного ввода
  qrCode: "data:image/png;base64,..." // QR-код в формате Data URL
  otpauthUrl: "otpauth://totp/..."     // OTPAuth URL
}
```

**Process**:
1. Генерирует новый случайный секрет (OTPAuth.Secret)
2. Создает TOTP объект с параметрами:
   - **Issuer**: "Шеф-Монтаж"
   - **Label**: email админа
   - **Algorithm**: SHA1
   - **Digits**: 6
   - **Period**: 30 секунд
3. Генерирует QR-код для сканирования
4. Сохраняет секрет в БД (НЕ включает 2FA!)
5. Возвращает данные для отображения в UI

### 2. Verify (Подтверждение)

**Endpoint**: `POST /api/admin/2fa/verify`

```typescript
// Request:
{
  token: "123456"  // 6-значный код из аутентификатора
}

// Response:
{
  success: true
}
```

**Process**:
1. Получает токен из запроса
2. Загружает two_factor_secret из БД
3. Создает TOTP объект с сохраненным секретом
4. Валидирует токен с window: 1 (±30 сек для синхронизации)
5. Если валиден - устанавливает two_factor_enabled = true
6. Возвращает успех

### 3. Disable (Отключение)

**Endpoint**: `POST /api/admin/2fa/disable`

```typescript
// Request:
{
  token: "123456"  // Требуется токен для подтверждения
}

// Response:
{
  success: true
}
```

**Process**:
1. Проверяет что 2FA включена
2. Требует валидный токен для подтверждения
3. Устанавливает two_factor_enabled = false
4. Очищает two_factor_secret = null
5. Возвращает успех

## UI Component

### States (Состояния)

1. **idle** - начальное состояние
   - Показывает описание 2FA
   - Кнопка "Настроить 2FA"

2. **verify** - настройка и подтверждение
   - Отображает QR-код (200x200px)
   - Показывает секрет для ручного ввода
   - Поле ввода 6-значного кода
   - Кнопка "Подтвердить и включить 2FA"

### Features

- **QR Code Display** - Image component с data URL
- **Manual Secret** - копируемый код в моноширинном шрифте
- **Token Input** - только цифры, макс 6 символов, большой шрифт
- **Error Handling** - красный текст с иконкой X
- **Loading States** - disable кнопок во время загрузки
- **Auto-validation** - кнопка verify активна только при 6 цифрах

## Security

### Validation Window

```typescript
totp.validate({ token, window: 1 })
```

- **window: 1** = ±1 период (±30 секунд)
- Позволяет компенсировать рассинхронизацию времени
- Защита от повторного использования токена

### Access Control

- Только пользователи с role = 'admin' могут настроить 2FA
- Проверка роли на каждом endpoint
- RLS политики на таблице users

### Secret Storage

- Секрет хранится в Base32 формате
- Секрет сохраняется ДО активации 2FA (безопасный flow)
- При отключении секрет полностью удаляется (null)

## TOTP Parameters

```typescript
{
  issuer: 'Шеф-Монтаж',      // Название сервиса в приложении
  label: user.email,          // Метка аккаунта
  algorithm: 'SHA1',          // Алгоритм хеширования (стандарт)
  digits: 6,                  // Длина кода
  period: 30,                 // Период обновления (секунды)
}
```

## Compatible Apps

Работает со всеми TOTP-совместимыми приложениями:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Bitwarden
- LastPass Authenticator

## Navigation

```
/admin/settings → Настройки безопасности → TwoFactorSetup
```

Доступ через меню админ панели:
- Settings icon → Настройки

## Testing Checklist

- [ ] Setup генерирует уникальный секрет
- [ ] QR-код корректно отображается
- [ ] Секрет можно ввести вручную
- [ ] Токен валидируется корректно
- [ ] Неверный токен отклоняется
- [ ] 2FA активируется после verify
- [ ] Disable требует валидный токен
- [ ] Секрет удаляется при disable
- [ ] Только админы имеют доступ
- [ ] Error states отображаются корректно

## Usage Example

### Admin Flow:

1. Админ идет в `/admin/settings`
2. Нажимает "Настроить 2FA"
3. Сканирует QR-код в Google Authenticator
4. Вводит 6-значный код из приложения
5. Нажимает "Подтвердить и включить 2FA"
6. 2FA активирована ✓

### Login Flow (Future):

После активации 2FA, при логине:
1. Ввод email/password
2. **Требуется 2FA код** (если two_factor_enabled = true)
3. Ввод 6-значного кода
4. Вход разрешен только при валидном коде

**Note**: Login flow с 2FA пока не реализован. Требуется middleware для проверки кода при входе.

## Statistics

Функция для мониторинга адаптации 2FA:

```sql
SELECT * FROM get_2fa_stats();

-- Returns:
-- total_admins: 10
-- admins_with_2fa: 3
-- percentage: 30.00
```

## Future Enhancements

1. **Login Integration** - требовать 2FA код при входе
2. **Backup Codes** - одноразовые коды восстановления
3. **Recovery Flow** - восстановление доступа при потере телефона
4. **2FA Enforcement** - обязательная 2FA для всех админов
5. **Session Management** - показывать активные сессии
6. **2FA History** - логировать успешные/неудачные попытки
7. **SMS 2FA** - альтернатива TOTP через SMS
8. **Email 2FA** - резервный канал через email
9. **Trusted Devices** - запоминание доверенных устройств
10. **Admin Dashboard** - статистика использования 2FA

## Dependencies

```json
{
  "otpauth": "^9.4.1",        // TOTP генерация и валидация
  "qrcode": "^1.5.4",         // QR-код генерация
  "@types/qrcode": "^1.5.6"   // TypeScript типы
}
```

## Security Best Practices

1. **Never log secrets** - секреты не должны попадать в логи
2. **Use HTTPS** - всегда используйте HTTPS в production
3. **Rate limiting** - ограничьте количество попыток verify
4. **Audit logging** - логируйте включение/отключение 2FA
5. **Backup codes** - всегда предлагайте backup коды
6. **Clear instructions** - понятные инструкции для пользователей

## Common Issues

### QR-код не сканируется:
- Убедитесь что QR достаточно большой (200x200px)
- Используйте ручной ввод секрета как fallback
- Проверьте что otpauthUrl корректный

### Токен не принимается:
- Проверьте синхронизацию времени на сервере
- Window: 1 дает ±30 секунд погрешности
- Убедитесь что секрет правильно сохранен в БД

### 2FA не активируется:
- Проверьте что verify route сохраняет two_factor_enabled
- Проверьте RLS политики на users таблице
- Проверьте что пользователь действительно admin

## Notes

- Секрет генерируется случайно (криптографически стойкий)
- Один секрет = один QR-код = одна настройка в приложении
- При повторном setup старый секрет перезаписывается
- Disable полностью удаляет секрет (нужно setup заново)
- 2FA работает офлайн (не требует интернета на телефоне)
- TOTP синхронизирован по времени (не по счетчику)
