#!/bin/bash

echo "🧹 Очистка кешей Next.js..."

# Остановить dev server если запущен
echo "Останавливаю dev server..."
pkill -f "next dev" 2>/dev/null || true

# Удалить .next
echo "Удаляю .next папку..."
rm -rf .next

# Удалить node_modules/.cache
echo "Удаляю кеш node_modules..."
rm -rf node_modules/.cache

# Очистить npm cache
echo "Очищаю npm кеш..."
npm cache clean --force 2>/dev/null || true

echo "✅ Кеш очищен!"
echo ""
echo "Теперь запустите:"
echo "npm run dev"
echo ""
echo "И обновите страницу в браузере с Ctrl+Shift+R (или Cmd+Shift+R на Mac)"
