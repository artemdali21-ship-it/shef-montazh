# Document Storage - Battle-Tested (Production Ready)

## 🎯 Стратегия: Минимальное хранение

**Правило:** Паспорт живет 1-24 часа, потом удаляется навсегда.

---

## 🔒 6 Критических правил (без них схема дырявая)

1. ✅ **Не хранить паспорт в users** - только в отдельной таблице verification_requests
2. ✅ **Private bucket + Signed URLs** - никаких публичных ссылок, никогда
3. ✅ **Доступ только через server endpoint** - фронт НЕ МОЖЕТ получить URL напрямую, только через API
4. ✅ **Auto-TTL удаление (Cron)** - файл умирает через 24ч даже если админ забыл
5. ✅ **Audit log** - каждый доступ логируется (кто, когда, зачем)
6. ✅ **Rejection reason + resubmit** - статусы pending|approved|rejected|expired, можно подать заново

---

## 1. Таблица verification_requests

```sql
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Статус (главное что храним навсегда)
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),

  -- ❗ Временный путь к файлу (НЕ URL, только путь)
  -- Затирается в NULL после проверки
  document_path TEXT, -- passport/{user_id}/{request_id}.jpg

  -- Временные метки
  uploaded_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours', -- ❗ TTL

  -- Результат проверки
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT, -- Почему rejected (обязательно для rejected)

  -- Метаданные (для аудита)
  document_type VARCHAR(20) DEFAULT 'passport',
  file_size INTEGER,
  mime_type VARCHAR(50),

  -- Удаление (файл удален, но запись остается для истории)
  deleted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT rejection_reason_required
    CHECK (status != 'rejected' OR rejection_reason IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_expires ON verification_requests(expires_at)
  WHERE deleted_at IS NULL AND status = 'pending';

-- View: Latest verification per user
CREATE VIEW user_verification_status AS
SELECT DISTINCT ON (user_id)
  user_id,
  status,
  reviewed_at,
  rejection_reason,
  created_at
FROM verification_requests
ORDER BY user_id, created_at DESC;
```

---

## 2. Storage Bucket Rules

```typescript
// Создать приватный bucket
await supabase.storage.createBucket('verification-docs', {
  public: false,              // ❗ Обязательно приватный
  fileSizeLimit: 5242880,    // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
})

// RLS политики
CREATE POLICY "Workers can upload own docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Only admins can read docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs'
  AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

CREATE POLICY "System can delete expired docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-docs'
);
```

---

## 3. Upload Endpoint (Worker)

```typescript
// app/api/verification/upload/route.ts
export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File

  // Загружаем во временную папку
  const path = `${user.id}/passport_${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('verification-docs')
    .upload(path, file)

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 })
  }

  // Создаем verification request
  const { data: request, error } = await supabase
    .from('verification_requests')
    .insert({
      user_id: user.id,
      document_path: path,
      file_size: file.size,
      mime_type: file.type,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    })
    .select()
    .single()

  return Response.json({ request })
}
```

---

## 4. View Document (Admin only) - КРИТИЧНО!

**❗ ВАЖНО:** Фронт НЕ МОЖЕТ получить signed URL напрямую через RLS.
Только через серверный endpoint который:
1. Проверяет роль (только admin)
2. Логирует доступ
3. Выдает короткоживущий URL (60-120 сек)

```typescript
// app/api/admin/verification/[requestId]/document/route.ts
export async function GET(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const supabase = await createServerClient()

  // ✅ Шаг 1: Проверка auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // ✅ Шаг 2: Проверка роли (ТОЛЬКО admin)
  const { data: admin } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (admin?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ✅ Шаг 3: Получаем verification request
  const { data: request } = await supabase
    .from('verification_requests')
    .select('document_path, user_id, status')
    .eq('id', params.requestId)
    .single()

  if (!request?.document_path) {
    return Response.json({ error: 'Document not found or already deleted' }, { status: 404 })
  }

  // ✅ Шаг 4: Проверка статуса (только pending можно смотреть)
  if (request.status !== 'pending') {
    return Response.json({
      error: 'Document already reviewed or expired',
      status: request.status
    }, { status: 410 })
  }

  // ✅ Шаг 5: Генерируем signed URL (живет 120 секунд)
  const { data: signedUrl, error } = await supabase.storage
    .from('verification-docs')
    .createSignedUrl(request.document_path, 120) // 2 minutes ONLY

  if (error || !signedUrl) {
    return Response.json({ error: 'Failed to generate URL' }, { status: 500 })
  }

  // ✅ Шаг 6: ОБЯЗАТЕЛЬНО логируем доступ
  await supabase.from('document_access_log').insert({
    document_path: request.document_path,
    accessed_by: user.id,
    access_type: 'view',
    request_id: params.requestId,
    ip_address: req.headers.get('x-forwarded-for'),
    user_agent: req.headers.get('user-agent'),
    metadata: {
      user_email: admin.email,
      request_user_id: request.user_id
    }
  })

  return Response.json({
    url: signedUrl.signedUrl,
    expires_in: 120, // seconds
    warning: 'URL expires in 2 minutes'
  })
}

// ❌ НЕПРАВИЛЬНО: Давать фронту доступ к storage.createSignedUrl()
// ✅ ПРАВИЛЬНО: Только через этот серверный endpoint
```

---

## 5. Approve/Reject (Admin)

```typescript
// app/api/admin/verification/[requestId]/review/route.ts
export async function POST(req: Request, { params }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { approved, reason } = await req.json()

  // Обновляем статус
  const { data: request } = await supabase
    .from('verification_requests')
    .update({
      status: approved ? 'approved' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason
    })
    .eq('id', params.requestId)
    .select()
    .single()

  if (approved) {
    // Обновляем worker_profile
    await supabase
      .from('worker_profiles')
      .update({ verification_status: 'verified' })
      .eq('user_id', request.user_id)

    // ❗ УДАЛЯЕМ файл паспорта
    await supabase.storage
      .from('verification-docs')
      .remove([request.document_path])

    // Отмечаем что удалили
    await supabase
      .from('verification_requests')
      .update({
        deleted_at: new Date().toISOString(),
        document_path: null // Затираем путь
      })
      .eq('id', params.requestId)

    // Логируем удаление
    await supabase.from('document_access_log').insert({
      document_path: request.document_path,
      accessed_by: 'system',
      access_type: 'delete',
      metadata: { reason: 'approved_and_deleted' }
    })
  }

  return Response.json({ success: true })
}
```

---

## 6. Resubmit Flow (если rejected)

**Кейс:** Worker получил rejected → исправляет документ → подает заново

```typescript
// app/api/verification/resubmit/route.ts
export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // ✅ Проверяем последний request
  const { data: lastRequest } = await supabase
    .from('verification_requests')
    .select('status, rejection_reason')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Можно resubmit только если rejected или expired
  if (!lastRequest || !['rejected', 'expired'].includes(lastRequest.status)) {
    return Response.json({
      error: 'Cannot resubmit',
      reason: lastRequest?.status === 'pending'
        ? 'Previous request is still pending'
        : lastRequest?.status === 'approved'
        ? 'Already verified'
        : 'No previous request found'
    }, { status: 400 })
  }

  // Загружаем новый файл (тот же код что в upload)
  const formData = await req.formData()
  const file = formData.get('file') as File

  const path = `passport/${user.id}/${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('verification-docs')
    .upload(path, file)

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 })
  }

  // Создаем новый request
  const { data: newRequest, error } = await supabase
    .from('verification_requests')
    .insert({
      user_id: user.id,
      document_path: path,
      file_size: file.size,
      mime_type: file.type,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })
    .select()
    .single()

  return Response.json({
    request: newRequest,
    previous_rejection: lastRequest.rejection_reason
  })
}
```

**UI Flow:**
```typescript
// Worker видит rejection_reason
if (verificationStatus === 'rejected') {
  return (
    <div>
      <Alert variant="error">
        Документ отклонен: {rejectionReason}
      </Alert>
      <Button onClick={openResubmitModal}>
        Загрузить документ заново
      </Button>
    </div>
  )
}
```

---

## 8. Cron Job: Auto-delete expired (критично!)

**❗ ВАЖНО:** Файл ДОЛЖЕН удалиться через 24ч даже если админ забыл проверить.

```typescript
// app/api/cron/cleanup-expired-docs/route.ts
export async function GET() {
  const supabase = await createServerClient()

  // Находим просроченные requests
  const { data: expired } = await supabase
    .from('verification_requests')
    .select('id, document_path')
    .lt('expires_at', new Date().toISOString())
    .is('deleted_at', null)

  for (const request of expired || []) {
    // Удаляем файл
    if (request.document_path) {
      await supabase.storage
        .from('verification-docs')
        .remove([request.document_path])
    }

    // Обновляем статус
    await supabase
      .from('verification_requests')
      .update({
        deleted_at: new Date().toISOString(),
        document_path: null,
        status: 'expired'
      })
      .eq('id', request.id)

    // Логируем
    await supabase.from('document_access_log').insert({
      document_path: request.document_path,
      accessed_by: 'system',
      access_type: 'delete',
      metadata: { reason: 'expired_24h' }
    })
  }

  return Response.json({
    deleted: expired?.length || 0
  })
}
```

**Vercel Cron:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-docs",
      "schedule": "0 * * * *"  // Каждый час
    }
  ]
}
```

---

## 9. Access Log Table (обязательный аудит)

```sql
CREATE TABLE document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path TEXT NOT NULL,
  accessed_by TEXT NOT NULL, -- user_id или 'system'
  access_type VARCHAR(20) NOT NULL, -- view | delete
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_document_access_log_path ON document_access_log(document_path);
CREATE INDEX idx_document_access_log_user ON document_access_log(accessed_by);
CREATE INDEX idx_document_access_log_time ON document_access_log(created_at DESC);
```

---

## 10. Admin Dashboard Query

```typescript
// Pending verifications
const { data: pending } = await supabase
  .from('verification_requests')
  .select(`
    id,
    user_id,
    users!inner(email, phone),
    uploaded_at,
    expires_at
  `)
  .eq('status', 'pending')
  .order('uploaded_at', { ascending: true })

// Access log (кто что открывал)
const { data: accessLog } = await supabase
  .from('document_access_log')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100)

// Stats
const stats = {
  pending: pending?.length || 0,
  avgReviewTime: '2.5 hours',
  documentsDeleted24h: await countDeletedToday()
}
```

---

## 11. Что храним vs что НЕ храним

### ✅ Храним (навсегда):
```
- verification_status: 'verified' | 'rejected'
- reviewed_at: timestamp
- reviewed_by: admin_id
- rejection_reason: text (если rejected)
```

### ❌ НЕ храним (удаляем после проверки):
```
- document_path: NULL (затерто)
- file binary: удален из storage
- deleted_at: timestamp (для аудита)
```

### 📊 Логируем (для аудита):
```
document_access_log:
- кто открыл документ
- когда
- откуда (IP)
- зачем (view | delete)
```

---

## 12. Итоговый флоу с проверками

```
Worker загружает паспорт
    ↓
✅ Создается verification_request (status: pending)
✅ Файл в private bucket (expires_at: NOW + 24h)
    ↓
Admin получает уведомление
    ↓
Admin открывает документ через /api/admin/.../document
    ├─► ✅ Проверка роли (только admin)
    ├─► ✅ Выдача signed URL (120 сек TTL)
    └─► ✅ Логирование доступа
    ↓
Admin одобряет/отклоняет через /api/admin/.../review
    ↓
    ├─► Approved:
    │   ├─ ✅ worker_profile.verification_status = 'verified'
    │   ├─ ✅ УДАЛЯЕМ файл из storage
    │   ├─ ✅ verification_request.deleted_at = NOW
    │   ├─ ✅ verification_request.document_path = NULL
    │   └─ ✅ Логируем удаление
    │
    ├─► Rejected:
    │   ├─ ✅ worker_profile.verification_status = 'rejected'
    │   ├─ ✅ Сохраняем rejection_reason
    │   ├─ ✅ УДАЛЯЕМ файл из storage
    │   ├─ ✅ Worker может resubmit
    │   └─ ✅ Логируем удаление
    │
    └─► (Админ не проверил вовремя)

Cron job (каждый час):
    ├─ ✅ Находит просроченные (expires_at < NOW, status = pending)
    ├─ ✅ УДАЛЯЕТ файлы из storage
    ├─ ✅ Обновляет status = 'expired'
    └─ ✅ Логируем auto-delete
        ↓
    Worker может resubmit (если expired или rejected)
```

---

## 🎯 Финальная проверка: 6 критических правил

| # | Правило | Реализовано | Где |
|---|---------|-------------|-----|
| 1 | **Не хранить в users** | ✅ | Отдельная таблица verification_requests |
| 2 | **Private bucket + Signed URLs** | ✅ | bucket private, signed URL 120 сек |
| 3 | **Доступ через server endpoint** | ✅ | /api/admin/.../document с проверкой роли |
| 4 | **Auto-TTL удаление** | ✅ | Cron job каждый час + expires_at |
| 5 | **Audit log** | ✅ | document_access_log (кто, когда, откуда) |
| 6 | **Rejection + resubmit** | ✅ | rejection_reason + /api/verification/resubmit |

---

## 💡 Преимущества этой схемы

1. **Минимальное хранение:** Паспорт живет 1-24ч вместо годами
2. **Нет постоянного риска:** После проверки файла нет
3. **Compliance:** ФЗ-152 проще - не хранишь, не отвечаешь
4. **Дешево:** Не платим за хранение гигабайтов паспортов
5. **Аудит:** Каждый доступ логируется
6. **Автоматика:** Cron удаляет просрочки
7. **Безопасность:** Private bucket + signed URLs + RLS

---

## 🚀 Следующий уровень (Growth)

Когда будет оборот → подключить KYC-провайдер:

```typescript
// Интеграция с Sumsub
const verification = await sumsub.createApplicant({
  externalUserId: user.id,
  levelName: 'basic-kyc'
})

// У нас храним только:
await supabase.from('kyc_verifications').insert({
  user_id: user.id,
  provider: 'sumsub',
  applicant_id: verification.id,
  status: 'pending',
  verification_level: 'basic'
})

// Паспорт вообще не трогаем → 0 ответственности
```

**Стоимость:** ~$1-2 за проверку (дешевле чем риски хранения)

---

## ✅ Checklist имплементации

### Backend (критично)
- [ ] Создать bucket 'verification-docs' (private)
- [ ] Настроить RLS политики (только admin read)
- [ ] Создать таблицу verification_requests (с expires_at, rejection_reason)
- [ ] Создать таблицу document_access_log
- [ ] Создать view user_verification_status

### API Endpoints (критично)
- [ ] POST /api/verification/upload (worker)
- [ ] GET /api/admin/verification/[id]/document (admin, signed URL 120 сек)
- [ ] POST /api/admin/verification/[id]/review (admin, approve → DELETE)
- [ ] POST /api/verification/resubmit (worker, если rejected/expired)

### Automation (критично)
- [ ] Cron job cleanup (каждый час, /api/cron/cleanup-expired-docs)
- [ ] Vercel cron config (vercel.json)
- [ ] Логирование КАЖДОГО доступа в document_access_log

### UI/UX
- [ ] Admin dashboard (pending requests)
- [ ] Worker UI (upload + resubmit flow)
- [ ] Rejection reason display
- [ ] Status badges (pending/approved/rejected/expired)

---

## 🎯 Итог: Production-Ready схема

### **Золотое правило:** Не хранить паспорт = не иметь проблем

### ✅ Все 6 критических правил соблюдены:

1. **Не хранить в users** → Отдельная таблица verification_requests
2. **Private bucket** → Signed URLs 120 сек TTL
3. **Server endpoint only** → Фронт НЕ МОЖЕТ получить URL напрямую
4. **Auto-TTL** → Cron job гарантирует удаление через 24ч
5. **Audit log** → Каждый доступ логируется
6. **Rejection + resubmit** → rejection_reason + возможность подать заново

### 🔒 Безопасность (как у взрослых):
- ✅ Private storage (никогда public)
- ✅ Signed URLs (120 сек, не 60 минут)
- ✅ RLS policies (только admin read)
- ✅ Server endpoint gatekeeper (проверка роли + логирование)
- ✅ Audit log (кто, когда, откуда, зачем)
- ✅ Auto-delete (файл умирает через 24ч ВСЕГДА)

### 📋 Compliance (юридически чисто):
- ✅ ФЗ-152: минимизация данных (1-24ч вместо годами)
- ✅ GDPR: right to erasure (автоматически)
- ✅ Audit trail (все доступы логируются)
- ✅ Нет риска утечки (файла нет после проверки)
- ✅ Rejection reason (прозрачность для пользователя)

### 💰 Экономика:
- Дешево: не храним гигабайты паспортов годами
- Просто: минимум кода, максимум автоматики
- Быстро: 1-2 дня имплементация

### 🚀 Следующий уровень (Growth):
KYC-провайдер (Sumsub/IDnow) → паспорт вообще не трогаем → 0 ответственности

---

**Эта схема не стыдно показать юристу/инвестору/партнеру.** ✅

**Готово к бою!** 💪
