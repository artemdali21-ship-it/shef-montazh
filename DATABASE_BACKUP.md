# Database Backup System

## Overview

Система резервного копирования базы данных PostgreSQL. Поддерживает ручные бэкапы через API и автоматические через cron job.

## Files Created

### API Route:
- `app/api/admin/backup/route.ts` - API для запроса ручного бэкапа

### Components:
- `components/admin/BackupManager.tsx` - UI для управления бэкапами
- `backup-script.sh` - shell скрипт для автоматических бэкапов

### Integration:
- `app/admin/settings/page.tsx` - добавлен BackupManager

## API Route

**Endpoint**: `POST /api/admin/backup`

```typescript
// Response:
{
  message: "Backup feature requires configuration",
  instructions: [
    "1. Upgrade to Supabase Pro ($25/month) for automatic daily backups",
    "2. Or setup pg_dump cron job on your server",
    "3. Store backups in S3/Cloud Storage"
  ]
}
```

**Security**:
- Только админы могут запрашивать бэкапы
- Проверка роли на endpoint
- Логирование запросов в audit_logs (future)

## Backup Methods

### 1. Supabase Pro (Recommended)

**Pros**:
- Автоматические daily backups
- Point-in-time recovery
- Хранение 7 последних копий
- Восстановление в 1 клик через dashboard
- Managed сервис (без настройки)

**Cons**:
- Стоимость: $25/месяц
- Привязка к Supabase

**Setup**:
```bash
# Upgrade в Supabase Dashboard
1. Settings → Billing → Upgrade to Pro
2. Settings → Database → Backups → Configure
3. Enable automatic backups
```

### 2. Manual pg_dump (Self-hosted)

**Pros**:
- Бесплатно
- Полный контроль
- Гибкая настройка (частота, retention)
- Можно хранить где угодно

**Cons**:
- Требует настройки сервера
- Нужен мониторинг
- Ручное восстановление

## Cron Job Setup

### 1. Создать скрипт

```bash
# Копируем скрипт на сервер
cp backup-script.sh /usr/local/bin/backup-chef-montazh.sh
chmod +x /usr/local/bin/backup-chef-montazh.sh
```

### 2. Настроить переменные

Отредактировать `/usr/local/bin/backup-chef-montazh.sh`:

```bash
DB_URL="postgresql://postgres:[password]@db.project.supabase.co:5432/postgres"
BACKUP_DIR="/var/backups/chef-montazh"
S3_BUCKET="s3://your-bucket/backups/"  # опционально
```

### 3. Добавить в crontab

```bash
crontab -e

# Добавить строку (каждую ночь в 3:00)
0 3 * * * /usr/local/bin/backup-chef-montazh.sh >> /var/log/chef-montazh-backup.log 2>&1
```

### 4. Проверить работу

```bash
# Запустить вручную
/usr/local/bin/backup-chef-montazh.sh

# Проверить логи
tail -f /var/log/chef-montazh-backup.log

# Проверить файлы
ls -lh /var/backups/chef-montazh/
```

## Backup Script Features

### Compression

```bash
gzip "$BACKUP_DIR/$FILENAME"
```

- Сжимает .sql файл в .sql.gz
- Экономит 80-90% места
- Прозрачное восстановление (gunzip)

### Retention

```bash
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +7 -delete
```

- Удаляет бэкапы старше 7 дней
- Настраиваемый период (-mtime +N)
- Автоматическая очистка места

### S3 Upload (Optional)

```bash
aws s3 cp "$BACKUP_DIR/$FILENAME.gz" $S3_BUCKET
```

**Prerequisites**:
```bash
# Установить AWS CLI
sudo apt install awscli

# Настроить credentials
aws configure
```

**Benefits**:
- Offsite storage (защита от сбоя сервера)
- Дешево (S3 Glacier)
- Автоматическое версионирование
- Высокая доступность

## Restore Process

### From local backup:

```bash
# Распаковать
gunzip backup-2026-01-31_03-00-00.sql.gz

# Восстановить
psql $DB_URL < backup-2026-01-31_03-00-00.sql
```

### From S3:

```bash
# Скачать
aws s3 cp s3://bucket/backup-2026-01-31.sql.gz ./

# Распаковать и восстановить
gunzip backup-2026-01-31.sql.gz
psql $DB_URL < backup-2026-01-31.sql
```

### From Supabase Pro:

1. Dashboard → Database → Backups
2. Выбрать backup из списка
3. Click "Restore"
4. Confirm

## UI Component

### BackupManager Features

- **Info Card** - рекомендации по Supabase Pro
- **Manual Backup Button** - запрос ручного бэкапа
- **Loading State** - индикатор выполнения
- **Instructions Alert** - показывает инструкции по настройке

### Integration

Добавлен на страницу `/admin/settings`:
```typescript
<BackupManager />
```

## Monitoring

### Cron Job Logs

```bash
# Просмотр логов
tail -100 /var/log/chef-montazh-backup.log

# Проверка последнего запуска
grep "Backup completed" /var/log/chef-montazh-backup.log | tail -1
```

### Backup Size Tracking

```bash
# Размер последнего бэкапа
ls -lh /var/backups/chef-montazh/ | tail -1

# Общий размер всех бэкапов
du -sh /var/backups/chef-montazh/
```

### Alert on Failure

Добавить в скрипт:
```bash
# Email при ошибке
if [ $? -ne 0 ]; then
  echo "Backup failed at $(date)" | mail -s "BACKUP FAILED" admin@example.com
fi
```

## Best Practices

### 1. Test Restores Regularly

```bash
# Каждый месяц тестируй восстановление:
# 1. Создай тестовую БД
# 2. Восстанови последний backup
# 3. Проверь целостность данных
```

### 2. Multiple Storage Locations

- Local disk (быстрый доступ)
- S3/Cloud Storage (offsite)
- Optional: третья копия в другом регионе

### 3. Encryption

```bash
# Шифрование бэкапа
gpg -c backup-2026-01-31.sql.gz

# Расшифровка
gpg backup-2026-01-31.sql.gz.gpg
```

### 4. Monitoring

- Setup alerting при неудачных бэкапах
- Мониторинг размера бэкапов (резкий рост = проблема)
- Проверка свободного места на диске

## Supabase Pro vs Self-Hosted

| Feature | Supabase Pro | Self-Hosted Cron |
|---------|--------------|------------------|
| **Cost** | $25/month | Free (storage only) |
| **Setup** | 1 click | Manual configuration |
| **Automatic** | Yes | Requires cron setup |
| **Point-in-time** | Yes | No (daily only) |
| **Storage** | Managed | Your server/S3 |
| **Restore** | 1 click UI | Manual psql command |
| **Monitoring** | Built-in dashboard | Custom scripts |
| **Reliability** | SLA backed | Your responsibility |

## Recommended Strategy

### For Production:

1. **Primary**: Supabase Pro automatic backups
2. **Secondary**: Weekly pg_dump to S3 (extra safety)
3. **Test restores**: Monthly

### For Development/Staging:

1. Weekly cron job to local disk
2. Keep last 4 backups (1 month)
3. No S3 upload needed

## Security Considerations

1. **Never commit DATABASE_URL** - use environment variables
2. **Encrypt sensitive backups** - use GPG
3. **Restrict access** - chmod 600 на backup files
4. **Secure S3 bucket** - private с IAM policies
5. **Rotate credentials** - периодически меняй DB password
6. **Audit access** - логируй кто скачивал бэкапы

## Troubleshooting

### pg_dump not found:
```bash
sudo apt install postgresql-client
```

### Connection refused:
- Проверь DATABASE_URL корректность
- Проверь firewall rules
- Supabase требует IP whitelisting в production

### Disk full:
- Увеличь retention policy (удаляй старые чаще)
- Используй S3 вместо local storage
- Enable compression (gzip)

### Slow backups:
- Запускай в off-peak hours (ночью)
- Используй --format=custom для pg_dump (быстрее)
- Exclude ненужные таблицы

## Future Enhancements

1. **Backup Dashboard** - UI для просмотра всех бэкапов
2. **One-click Restore** - восстановление через UI
3. **Incremental Backups** - только изменения
4. **Backup Verification** - автопроверка целостности
5. **Multi-region** - копии в разных регионах
6. **Backup Encryption** - автоматическое шифрование
7. **Slack Notifications** - уведомления о статусе
8. **Retention Policies** - гибкие правила хранения
9. **Backup Analytics** - статистика размеров/времени
10. **Auto-restore Testing** - автоматическое тестирование

## Cron Schedule Examples

```bash
# Каждый день в 3:00
0 3 * * * /path/to/backup-script.sh

# Каждый час
0 * * * * /path/to/backup-script.sh

# Каждые 4 часа
0 */4 * * * /path/to/backup-script.sh

# Каждый понедельник в 2:00
0 2 * * 1 /path/to/backup-script.sh

# Каждое 1-е число месяца
0 3 1 * * /path/to/backup-script.sh
```

## Notes

- pg_dump создает логический backup (SQL команды)
- Для больших БД (>100GB) используй pg_basebackup
- Supabase Free tier не имеет автобэкапов
- DATABASE_URL нужен для pg_dump доступа
- В Vercel/Netlify нет cron - используй отдельный сервер
- Бэкапы должны храниться вне production сервера
- Тестируй restore ПЕРЕД критической ситуацией

## Emergency Contacts

В случае критической ситуации:
1. Проверь последний успешный backup
2. Оцени потерю данных (с какого времени)
3. Восстанови из ближайшего backup
4. Notify пользователей о downtime
5. Investigate причину сбоя
