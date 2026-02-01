#!/bin/bash

# Переменные
DB_URL="postgresql://user:password@host:5432/database"
BACKUP_DIR="/var/backups/chef-montazh"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="backup-$TIMESTAMP.sql"
S3_BUCKET="s3://your-bucket/backups/"

# Создаем директорию если нет
mkdir -p $BACKUP_DIR

# Делаем backup
pg_dump $DB_URL > "$BACKUP_DIR/$FILENAME"

# Сжимаем
gzip "$BACKUP_DIR/$FILENAME"

# Загружаем в S3 (опционально)
# aws s3 cp "$BACKUP_DIR/$FILENAME.gz" $S3_BUCKET

# Удаляем старые бэкапы (старше 7 дней)
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +7 -delete

echo "Backup completed: $FILENAME.gz"
