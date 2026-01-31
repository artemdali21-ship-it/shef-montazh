#!/bin/bash

# Telegram Webhook Setup Script
# This script sets up the Telegram webhook for the bot

BOT_TOKEN="8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU"
WEBHOOK_URL="https://v0-chef-montazh.vercel.app/api/telegram/webhook"

echo "🤖 Setting up Telegram webhook..."
echo ""
echo "Bot Token: ${BOT_TOKEN:0:20}..."
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Set webhook
echo "📡 Setting webhook..."
RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}")
echo "$RESPONSE" | jq '.'

echo ""
echo "✅ Checking webhook info..."
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq '.'

echo ""
echo "✅ Done! Test your bot by sending /start in Telegram"
echo "Bot: @shef_montazh_bot (или ваш бот)"
