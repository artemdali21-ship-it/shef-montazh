# YooKassa (ЮКасса) Integration Setup Guide

This guide explains how to set up YooKassa payment integration for the Shef-Montazh platform.

## 1. Install Dependencies

```bash
npm install @a2seven/yoo-checkout
```

## 2. Register with YooKassa

1. Visit [yookassa.ru](https://yookassa.ru) and create an account
2. Complete the registration process and verify your business
3. Access your merchant dashboard

## 3. Get API Credentials

### For Testing (Sandbox):
1. Go to Settings → API Keys in your YooKassa dashboard
2. Enable test mode
3. Copy your test credentials:
   - Shop ID (Идентификатор магазина)
   - Secret Key (Секретный ключ)

### For Production:
1. Complete all verification steps
2. Switch to production mode
3. Generate production API keys
4. Copy production credentials

## 4. Configure Environment Variables

Create or update `.env.local` file in project root:

```env
# YooKassa Credentials
YUKASSA_SHOP_ID=your_shop_id_here
YUKASSA_SECRET_KEY=your_secret_key_here

# App URL (for payment redirects)
NEXT_PUBLIC_WEBAPP_URL=http://localhost:3000
```

**Important:** Never commit `.env.local` to version control!

## 5. Database Setup

Run the payments migration:

```bash
# Apply migration in Supabase SQL Editor
cat supabase/migrations/012_payments.sql
```

This creates:
- `payments` table with all necessary fields
- Indexes for performance
- RLS policies for security
- Helper functions for statistics

## 6. Test Payment Flow

### 6.1 Create a Payment

```typescript
// Client-side code
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    shiftId: 'shift-uuid',
    workerId: 'worker-uuid',
    amount: 5000, // Amount in rubles
    description: 'Оплата смены: Монтаж стеллажей'
  })
})

const data = await response.json()

if (data.success) {
  // Redirect user to YooKassa payment page
  window.location.href = data.confirmationUrl
}
```

### 6.2 Payment Return Flow

After payment, user is redirected to:
```
/payments/success?shift_id={shiftId}
```

Create this page to handle successful payments.

## 7. Test Cards (Sandbox Mode)

Use these test cards in sandbox mode:

**Successful Payment:**
- Card: `5555 5555 5555 4477`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

**Failed Payment:**
- Card: `5555 5555 5555 5599`
- Expiry: Any future date
- CVC: Any 3 digits

## 8. Webhook Setup

Webhooks allow automatic payment status updates without manual checking.

### 8.1 Configure in YooKassa Dashboard

1. Log in to [YooKassa dashboard](https://yookassa.ru)
2. Go to **Settings** → **HTTP-уведомления** (HTTP Notifications)
3. Click **Добавить** (Add)
4. Enter webhook URL:
   - Development: `https://your-dev-url.ngrok.io/api/payments/webhook`
   - Production: `https://yourdomain.com/api/payments/webhook`
5. Select events:
   - ✅ `payment.succeeded` - Payment successful
   - ✅ `payment.canceled` - Payment canceled
   - ✅ `refund.succeeded` - Refund successful
6. Save settings

### 8.2 Test Webhook Locally

Use ngrok to expose local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js server
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Use this URL in YooKassa webhook settings
```

### 8.3 Webhook Events Handled

| Event | Description | Action |
|-------|-------------|--------|
| `payment.succeeded` | Payment completed | Update status to `succeeded`, notify users |
| `payment.canceled` | Payment canceled | Update status to `canceled`, notify client |
| `refund.succeeded` | Refund processed | Update status to `refunded`, notify both users |
| `payment.waiting_for_capture` | Payment authorized | Optional: Auto-capture or manual |

### 8.4 Verify Webhook

Test webhook endpoint:

```bash
# Check if webhook is accessible
curl https://yourdomain.com/api/payments/webhook

# Expected response:
{
  "status": "ok",
  "service": "YooKassa Webhook Handler",
  "version": "1.0"
}
```

### 8.5 Webhook Security

The webhook handler includes:
- ✅ Signature verification (HMAC SHA-256)
- ✅ Request validation
- ✅ Duplicate prevention
- ✅ Error handling with retries
- ✅ Detailed logging

## 9. Payment Statuses

The system tracks these payment statuses:

| Status | Description |
|--------|-------------|
| `pending` | Payment created, waiting for user action |
| `processing` | Payment is being processed |
| `succeeded` | Payment successful, funds captured |
| `canceled` | Payment canceled by user or system |
| `refunded` | Payment refunded to user |

## 10. Platform Fee

Default platform fee: **1,200 RUB** per shift

This is configured in:
- `supabase/migrations/012_payments.sql` (default value)
- `app/api/payments/create/route.ts` (can be customized)

## 11. Security Considerations

- ✅ Never expose Secret Key in client-side code
- ✅ Always verify payment status on server-side
- ✅ Implement webhook signature verification
- ✅ Use HTTPS in production
- ✅ Validate all payment amounts
- ✅ Check user authorization before creating payments
- ✅ Prevent duplicate payments for same shift

## 12. Troubleshooting

### Error: "YooKassa credentials not configured"
- Check that `YUKASSA_SHOP_ID` and `YUKASSA_SECRET_KEY` are set in `.env.local`
- Restart Next.js dev server after changing env variables

### Error: "Payment already exists for this shift"
- Each shift can only have one payment
- Check existing payments in database before creating new one

### Payment stuck in "pending" status
- Check YooKassa dashboard for payment details
- Verify user completed payment on YooKassa page
- Implement webhook to automatically update status

## 13. Production Checklist

Before going live:

- [ ] Switch to production YooKassa credentials
- [ ] Update `NEXT_PUBLIC_WEBAPP_URL` to production domain
- [ ] Test payment flow end-to-end
- [ ] Set up webhooks for automatic status updates
- [ ] Implement refund handling
- [ ] Add payment receipts/confirmations
- [ ] Set up payment analytics/monitoring
- [ ] Review and adjust platform fee
- [ ] Test error scenarios

## 14. API Reference

### Create Payment

```
POST /api/payments/create
```

**Body:**
```json
{
  "shiftId": "uuid",
  "workerId": "uuid",
  "amount": 5000,
  "description": "Optional description"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "payment-uuid",
  "yukassaPaymentId": "yukassa-id",
  "confirmationUrl": "https://yookassa.ru/...",
  "amount": 5000,
  "platformFee": 1200,
  "workerPayout": 3800
}
```

## 15. Support

- YooKassa Documentation: https://yookassa.ru/developers
- YooKassa Support: support@yookassa.ru
- YooKassa API Reference: https://yookassa.ru/developers/api

---

**Note:** This integration is ready for testing. For production use, complete YooKassa business verification and switch to production credentials.
