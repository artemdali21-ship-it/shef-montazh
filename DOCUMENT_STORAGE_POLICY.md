# Document Storage Policy - Хранение паспортов и документов

## ⚠️ Критическая важность

Хранение паспортов/документов - **зона максимального риска**:
- Юридически: ФЗ-152 "О персональных данных" + GDPR
- Репутационно: утечка паспортов = смерть компании
- Штрафы: до 75 000 ₽ физлицо, до 500 000 ₽ компания

**Без четкой политики это бомба.**

---

## 📐 Правила хранения (compliance)

### 1. Storage Setup

**Supabase Storage:**
```typescript
// Создать приватный bucket
await supabase.storage.createBucket('documents', {
  public: false, // ❗ НИКОГДА не делать public
  fileSizeLimit: 10485760, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'application/pdf'
  ]
})

// RLS политики на bucket
CREATE POLICY "Only admins can read documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Структура папок:**
```
documents/
├── {user_id}/
│   ├── passport/
│   │   ├── main.jpg
│   │   └── registration.jpg
│   ├── certificates/
│   │   └── cert_001.pdf
│   └── inn/
│       └── inn.jpg
```

---

### 2. Access Control (кто видит)

**Правила:**
```typescript
// ✅ Admin может видеть все документы
// ✅ User может видеть только свои документы
// ❌ НИКТО другой не может видеть

async function canAccessDocument(
  userId: string,
  documentPath: string
): Promise<boolean> {
  const user = await getUser(userId)

  // Admin - полный доступ
  if (user.role === 'admin') return true

  // User может только свои документы
  const documentUserId = documentPath.split('/')[0]
  return documentUserId === userId
}
```

---

### 3. Audit Log (кто открывал)

**Таблица:**
```sql
CREATE TABLE document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path TEXT NOT NULL,
  accessed_by UUID NOT NULL REFERENCES users(id),
  access_type VARCHAR(20) NOT NULL, -- 'view' | 'download' | 'delete'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_document_access_log_document ON document_access_log(document_path);
CREATE INDEX idx_document_access_log_user ON document_access_log(accessed_by);
CREATE INDEX idx_document_access_log_time ON document_access_log(created_at DESC);
```

**Логирование:**
```typescript
async function logDocumentAccess(params: {
  documentPath: string
  accessedBy: string
  accessType: 'view' | 'download' | 'delete'
  ipAddress?: string
  userAgent?: string
}) {
  await supabase.from('document_access_log').insert({
    document_path: params.documentPath,
    accessed_by: params.accessedBy,
    access_type: params.accessType,
    ip_address: params.ipAddress,
    user_agent: params.userAgent
  })
}

// При каждом просмотре документа
async function viewDocument(documentPath: string, userId: string) {
  // Проверка доступа
  if (!await canAccessDocument(userId, documentPath)) {
    throw new Error('Access denied')
  }

  // Логируем
  await logDocumentAccess({
    documentPath,
    accessedBy: userId,
    accessType: 'view',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  })

  // Получаем signed URL (действует 60 секунд)
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(documentPath, 60)

  return data.signedUrl
}
```

---

### 4. Retention Policy (сколько хранить)

**Правила:**
```typescript
// Документы хранятся пока:
// 1. User активен (logged in за последние 12 месяцев)
// 2. ИЛИ есть незакрытые споры/смены

async function shouldDeleteDocuments(userId: string): Promise<boolean> {
  const user = await getUser(userId)

  // Проверка 1: Активность
  const lastLogin = user.last_login_at
  const monthsSinceLogin = differenceInMonths(new Date(), lastLogin)

  if (monthsSinceLogin < 12) {
    return false // Активен, не удалять
  }

  // Проверка 2: Открытые споры
  const openDisputes = await supabase
    .from('disputes')
    .select('id')
    .or(`raised_by.eq.${userId},shift_id.in.(SELECT id FROM shifts WHERE client_id=${userId})`)
    .eq('status', 'open')

  if (openDisputes.data && openDisputes.data.length > 0) {
    return false // Есть споры, не удалять
  }

  // Проверка 3: Активные смены
  const activeShifts = await supabase
    .from('shifts')
    .select('id')
    .eq('client_id', userId)
    .in('status', ['open', 'in_progress'])

  if (activeShifts.data && activeShifts.data.length > 0) {
    return false // Есть активные смены, не удалять
  }

  return true // Можно удалять
}
```

**Cron job (раз в месяц):**
```typescript
// app/api/cron/cleanup-documents/route.ts
export async function GET() {
  const inactiveUsers = await supabase
    .from('users')
    .select('id')
    .lt('last_login_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000))

  for (const user of inactiveUsers.data || []) {
    if (await shouldDeleteDocuments(user.id)) {
      // Удаляем документы
      await deleteUserDocuments(user.id)

      // Логируем удаление
      await logDocumentAccess({
        documentPath: `${user.id}/*`,
        accessedBy: 'system',
        accessType: 'delete'
      })

      // Уведомляем пользователя (последний шанс)
      await sendEmail(user.email, {
        subject: 'Ваши документы будут удалены через 30 дней',
        body: 'Войдите в аккаунт чтобы сохранить документы'
      })
    }
  }

  return Response.json({ success: true })
}
```

---

### 5. Encryption (шифрование)

**At Rest (на диске):**
- Supabase Storage использует AES-256 encryption по умолчанию ✅
- Ключи управляются Supabase

**In Transit (при передаче):**
- HTTPS обязательно ✅
- Signed URLs с коротким TTL (60 секунд)

**Дополнительно (опционально):**
```typescript
// Шифрование файлов перед загрузкой (если нужна paranoia security)
import crypto from 'crypto'

async function uploadEncryptedDocument(file: File, userId: string) {
  // Генерируем ключ шифрования для user
  const userKey = await getUserEncryptionKey(userId)

  // Шифруем файл
  const cipher = crypto.createCipheriv('aes-256-gcm', userKey, iv)
  const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()])

  // Загружаем зашифрованный файл
  await supabase.storage
    .from('documents')
    .upload(`${userId}/passport/main.encrypted`, encrypted)

  // Сохраняем IV для расшифровки
  await supabase.from('document_metadata').insert({
    user_id: userId,
    file_path: `${userId}/passport/main.encrypted`,
    iv: iv.toString('hex'),
    auth_tag: cipher.getAuthTag().toString('hex')
  })
}
```

---

### 6. User Rights (права пользователя)

**GDPR compliance:**
```typescript
// 1. Право на доступ (получить копию своих данных)
async function exportUserDocuments(userId: string) {
  const files = await supabase.storage
    .from('documents')
    .list(userId)

  const zip = new JSZip()

  for (const file of files) {
    const { data } = await supabase.storage
      .from('documents')
      .download(`${userId}/${file.name}`)

    zip.file(file.name, data)
  }

  return await zip.generateAsync({ type: 'blob' })
}

// 2. Право на удаление (удалить все свои данные)
async function deleteUserDocuments(userId: string) {
  // Удаляем все файлы
  const { data: files } = await supabase.storage
    .from('documents')
    .list(userId)

  for (const file of files) {
    await supabase.storage
      .from('documents')
      .remove([`${userId}/${file.name}`])
  }

  // Логируем
  await logDocumentAccess({
    documentPath: `${userId}/*`,
    accessedBy: userId,
    accessType: 'delete'
  })
}

// 3. Право на исправление (заменить документ)
async function replaceDocument(
  userId: string,
  documentType: 'passport' | 'certificate',
  newFile: File
) {
  // Удаляем старый
  await supabase.storage
    .from('documents')
    .remove([`${userId}/${documentType}/main.jpg`])

  // Загружаем новый
  await supabase.storage
    .from('documents')
    .upload(`${userId}/${documentType}/main.jpg`, newFile)

  // Сбрасываем статус верификации
  await supabase
    .from('worker_profiles')
    .update({ verification_status: 'pending' })
    .eq('user_id', userId)
}
```

---

### 7. Breach Response (что делать при утечке)

**Если произошла утечка:**

**Шаг 1: Немедленная реакция (0-1 час)**
```typescript
// 1. Заблокировать доступ к bucket
await supabase.storage.updateBucket('documents', {
  public: false // Убедиться что приватный
})

// 2. Сменить все ключи доступа
await rotateStorageKeys()

// 3. Уведомить Роскомнадзор (обязательно по ФЗ-152)
await notifyRegulator({
  incident_type: 'data_breach',
  affected_count: affectedUsers.length,
  data_types: ['passport', 'personal_info']
})
```

**Шаг 2: Уведомление пользователей (1-24 часа)**
```typescript
// Уведомить всех пострадавших
for (const userId of affectedUsers) {
  await sendEmail(userId, {
    subject: '⚠️ Важно: инцидент с безопасностью данных',
    body: `
      Произошла утечка данных.
      Ваши документы могли быть скомпрометированы.

      Рекомендуем:
      1. Сменить пароль
      2. Включить 2FA
      3. Следить за подозрительной активностью

      Подробности: ${incidentDetailsUrl}
    `
  })

  // Telegram уведомление
  await sendTelegramMessage(userId, '⚠️ Инцидент безопасности. Проверьте email.')
}
```

**Шаг 3: Расследование (1-7 дней)**
- Анализ логов доступа
- Выявление источника утечки
- Исправление уязвимости
- Отчет для регулятора

**Шаг 4: Компенсация (опционально)**
- Бесплатная проверка кредитной истории
- Компенсация ущерба
- Юридическая поддержка

---

### 8. Admin Dashboard

**Что видит админ:**
```typescript
// Список документов на верификацию
const pendingDocs = await supabase
  .from('worker_profiles')
  .select('user_id, documents, verification_status')
  .eq('verification_status', 'pending')

// Последние обращения к документам
const recentAccess = await supabase
  .from('document_access_log')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100)

// Статистика
const stats = {
  totalDocuments: await countDocuments(),
  pendingVerification: pendingDocs.length,
  accessesToday: await countAccessesToday(),
  deletionsThisMonth: await countDeletionsThisMonth()
}
```

---

### 9. Compliance Checklist

**ФЗ-152 (Россия):**
- [x] Согласие пользователя на обработку ПД
- [x] Приватное хранилище (не public)
- [x] Логирование доступа
- [x] Право на удаление/исправление
- [x] Шифрование at rest + in transit
- [x] Уведомление о утечке <24ч
- [ ] Договор с оператором ПД (Supabase)
- [ ] Регистрация в Роскомнадзоре (если >1000 юзеров)

**GDPR (Европа):**
- [x] Right to access (export data)
- [x] Right to erasure (delete)
- [x] Right to rectification (replace)
- [x] Data portability (zip export)
- [x] Breach notification <72h
- [x] Privacy by design (default private)

---

### 10. Итоговая матрица

| Действие | Кто может | Логируется | Условия |
|----------|-----------|------------|---------|
| **Upload** | Owner | ✅ | Max 10MB, JPEG/PNG/PDF |
| **View** | Owner, Admin | ✅ | Signed URL 60sec |
| **Download** | Owner, Admin | ✅ | Signed URL 60sec |
| **Delete** | Owner, Admin | ✅ | Нет активных споров |
| **Replace** | Owner | ✅ | Сбрасывает верификацию |
| **Auto-delete** | System | ✅ | >12 мес неактивности |
| **Export (GDPR)** | Owner | ✅ | ZIP все файлы |

---

## 🎯 Checklist внедрения

- [ ] Создать приватный bucket 'documents'
- [ ] Настроить RLS политики на storage
- [ ] Создать таблицу document_access_log
- [ ] Логировать каждый доступ
- [ ] Signed URLs вместо прямых ссылок
- [ ] Cron job для cleanup (раз в месяц)
- [ ] GDPR endpoints (export/delete)
- [ ] Breach response план
- [ ] Согласие пользователя (checkbox при регистрации)
- [ ] Админ дашборд (pending docs + access log)

---

## 💡 Вывод

**Хранение паспортов - это не техническая задача, это юридическая ответственность.**

Без правильной политики:
- ❌ Штрафы до 500 000 ₽
- ❌ Репутационный ущерб
- ❌ Уголовная ответственность (ст. 137 УК РФ)

С правильной политикой:
- ✅ Compliance с ФЗ-152 + GDPR
- ✅ Защита от утечек
- ✅ Аудит всех действий
- ✅ Права пользователей соблюдены
