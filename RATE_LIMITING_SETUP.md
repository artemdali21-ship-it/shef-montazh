# Rate Limiting Setup Guide

## Overview

The application uses Upstash Redis for rate limiting to protect API endpoints from spam and abuse.

## Setup Steps

### 1. Create Upstash Account

1. Go to [https://upstash.com](https://upstash.com)
2. Sign up for a free account
3. Verify your email

### 2. Create Redis Database

1. Click "Create Database"
2. Choose a name (e.g., "shef-montazh-ratelimit")
3. Select region closest to your deployment (e.g., EU-West for Europe)
4. Choose "Global" for multi-region or "Regional" for single region
5. Click "Create"

### 3. Get Credentials

1. Click on your database
2. Scroll down to "REST API" section
3. Copy the following values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. Add to Environment Variables

Add to your `.env.local` file:

```env
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 5. Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

### 6. Restart Development Server

```bash
npm run dev
```

## Rate Limit Tiers

### General API (100 requests / 15 minutes)
- All API endpoints by default
- Applied per IP address
- Suitable for normal usage

### Auth Endpoints (5 requests / 1 hour)
- `/api/auth/*`
- Prevents brute force attacks
- Login, register, password reset

### Create Endpoints (20 requests / 1 hour)
- POST requests to `/api/shifts`
- Any endpoint containing `/create` or `/insert`
- Prevents spam creation

### Sensitive Endpoints (3 requests / 1 hour)
- `/api/payment/*`
- `/api/refund/*`
- `/api/dispute/*`
- Critical operations

## Testing Rate Limits

### Using curl

```bash
# Test general API
curl -I http://localhost:3000/api/test

# Check headers
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 2024-01-31T12:00:00.000Z
# X-RateLimit-Type: general

# Test until rate limited
for i in {1..101}; do
  curl -I http://localhost:3000/api/test
done

# Should return 429 Too Many Requests after 100 requests
```

### Using JavaScript

```javascript
async function testRateLimit() {
  const response = await fetch('/api/test')

  console.log('Status:', response.status)
  console.log('Limit:', response.headers.get('X-RateLimit-Limit'))
  console.log('Remaining:', response.headers.get('X-RateLimit-Remaining'))
  console.log('Reset:', response.headers.get('X-RateLimit-Reset'))
  console.log('Type:', response.headers.get('X-RateLimit-Type'))

  if (response.status === 429) {
    const data = await response.json()
    console.log('Rate limited:', data.message)
    console.log('Retry after:', data.retryAfter, 'seconds')
  }
}
```

## Response Headers

All API responses include these headers:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - When the limit resets (ISO timestamp)
- `X-RateLimit-Type` - Which rate limiter was applied
- `Retry-After` - Seconds until retry (only when rate limited)

## 429 Response Format

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded for auth endpoints. Please try again later.",
  "retryAfter": 3600
}
```

## Disable Rate Limiting

If you need to disable rate limiting (e.g., in development):

1. Don't set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Rate limiting will be automatically skipped
3. Middleware will log: "Rate limiting is not configured"

## Upstash Free Tier Limits

- 10,000 commands per day
- 256 MB storage
- TLS/SSL included
- Durable storage
- Multi-region replication (optional)

For most applications, this is more than enough.

## Monitoring

### Upstash Dashboard

1. Go to your Upstash dashboard
2. Click on your database
3. View "Analytics" tab
4. See request count, bandwidth, etc.

### Application Logs

Rate limit events are logged in development:

```bash
Rate limiting error: [error details]
```

## Production Considerations

1. **Increase limits** for production if needed
2. **Use environment variables** for different limits per environment
3. **Monitor Upstash usage** to avoid hitting free tier limits
4. **Add custom limits** per user role if needed
5. **Consider caching** frequently accessed data

## Custom Rate Limits

Edit `lib/rate-limit.ts` to add custom limits:

```typescript
export const customRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '10 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/custom'
    })
  : null
```

Then use in middleware:

```typescript
if (pathname.startsWith('/api/custom')) {
  rateLimiter = customRatelimit
  limiterType = 'custom'
}
```

## Troubleshooting

### Rate limiting not working

1. Check environment variables are set correctly
2. Verify Upstash credentials
3. Check middleware is running: add console.log
4. Verify `matcher` config in middleware.ts

### Too many requests immediately

1. Check if multiple IPs are being used (proxies, load balancers)
2. Use `x-forwarded-for` header for real IP
3. Adjust limits if needed

### Upstash connection errors

1. Check Upstash dashboard for database status
2. Verify REST URL and token
3. Check network connectivity
4. Review Upstash logs

## Support

- Upstash Docs: https://docs.upstash.com/redis
- Rate Limit Package: https://github.com/upstash/ratelimit
- Contact: support@shef-montazh.ru
