# 🤖 Telegram Bot Setup Guide

This guide explains how to set up and test the Telegram bot webhook for Шеф-Монтаж.

## 📋 Prerequisites

- Bot token: `8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU`
- Deployed app URL: `https://v0-chef-montazh.vercel.app`
- Webhook endpoint: `/api/telegram/webhook`

## 🚀 Quick Setup

### Method 1: Using the setup script (Recommended)

```bash
./scripts/setup-telegram-webhook.sh
```

### Method 2: Manual setup

1. **Set the webhook:**

```bash
curl "https://api.telegram.org/bot8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU/setWebhook?url=https://v0-chef-montazh.vercel.app/api/telegram/webhook"
```

Expected response:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

2. **Verify the webhook:**

```bash
curl "https://api.telegram.org/bot8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU/getWebhookInfo"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "url": "https://v0-chef-montazh.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

## 🧪 Testing

1. **Open your bot in Telegram**
   - Search for your bot username (e.g., `@shef_montazh_bot`)
   - Or open: `https://t.me/YOUR_BOT_USERNAME`

2. **Send `/start` command**

3. **Expected response:**
   - Welcome message with emoji
   - Button "🚀 Открыть платформу"
   - Clicking the button opens the Mini App

## 📝 What happens when user sends /start

1. Telegram sends update to webhook endpoint
2. Webhook handler parses the update
3. Extracts user info (chat_id, first_name, username)
4. Sends welcome message with Web App button
5. User can click button to open the Mini App

## 🔧 Environment Variables

Make sure these are set in `.env.local`:

```env
TELEGRAM_BOT_TOKEN=8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU
NEXT_PUBLIC_WEBAPP_URL=https://v0-chef-montazh.vercel.app
```

## 📊 Monitoring

### Check webhook status:
```bash
curl "https://api.telegram.org/bot8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU/getWebhookInfo"
```

### View Vercel logs:
```bash
vercel logs
```

### Debug locally:
1. Use ngrok to expose local server:
   ```bash
   ngrok http 3000
   ```

2. Set webhook to ngrok URL:
   ```bash
   curl "https://api.telegram.org/bot8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU/setWebhook?url=https://YOUR_NGROK_URL/api/telegram/webhook"
   ```

3. Send /start in Telegram and check console logs

## 🔄 Updating the webhook

If you change the deployment URL:

```bash
curl "https://api.telegram.org/bot8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU/setWebhook?url=https://NEW_URL/api/telegram/webhook"
```

## 🗑️ Removing the webhook

To stop receiving updates:

```bash
curl "https://api.telegram.org/bot8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU/deleteWebhook"
```

## 🐛 Troubleshooting

### Webhook not receiving updates

1. Check webhook info for errors:
   ```bash
   curl "https://api.telegram.org/bot8512724141:AAF0qDzfQgDGf8VECNHW7bNGRrrNXDN-0YU/getWebhookInfo"
   ```

2. Check `last_error_date` and `last_error_message` fields

3. Verify TELEGRAM_BOT_TOKEN is set in Vercel environment variables

4. Check Vercel function logs for errors

### Bot not responding

1. Verify bot token is correct
2. Check if bot is not blocked by user
3. Verify webhook URL is accessible (try GET request in browser)
4. Check Vercel function logs

### Web App button not working

1. Verify NEXT_PUBLIC_WEBAPP_URL is correct
2. Check if URL is accessible
3. Verify Telegram Web App is properly configured

## 📚 Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Web Apps Documentation](https://core.telegram.org/bots/webapps)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## ✅ Checklist

- [ ] Bot created via @BotFather
- [ ] Bot token added to .env.local
- [ ] App deployed to Vercel
- [ ] Webhook URL set
- [ ] Webhook verified with getWebhookInfo
- [ ] /start command tested
- [ ] Web App button opens correctly

## 🎉 Success!

If everything works:
- User sends /start
- Bot responds with welcome message
- User clicks "🚀 Открыть платформу"
- Mini App opens in Telegram

🚀 Day 1 Complete! ✅
