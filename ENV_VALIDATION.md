# Environment Variables Validation

## Overview

Автоматическая валидация environment variables при старте приложения с использованием Zod schema.

## Implementation

**File**: `lib/env.ts`

Содержит:
- ✅ Zod schema для всех env переменных
- ✅ Валидация при старте приложения
- ✅ Типизированный доступ к переменным
- ✅ Helper функции для проверки сервисов

## Required Variables

### Production (Required):

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Service Role Key (Backend only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Optional Services:

```env
# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=1234567890:ABC...
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBot

# YooKassa Payments (Optional)
YUKASSA_SHOP_ID=123456
YUKASSA_SECRET_KEY=live_...

# Upstash Redis for Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Sentry Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/123456
SENTRY_DSN=https://...@sentry.io/123456

# Vercel (Auto-populated)
VERCEL_URL=your-app.vercel.app
VERCEL_ENV=production
```

## Validation Rules

### Supabase URL:
```typescript
NEXT_PUBLIC_SUPABASE_URL: z.string().url()
```
- Must be valid URL
- Example: `https://abcdefgh.supabase.co`

### Telegram Bot Token:
```typescript
TELEGRAM_BOT_TOKEN: z.string().regex(/^\d+:[A-Za-z0-9_-]+$/)
```
- Format: `1234567890:ABCdef_123-xyz`
- Pattern: `{bot_id}:{token}`

### Redis URL:
```typescript
UPSTASH_REDIS_REST_URL: z.string().url()
```
- Must be valid HTTPS URL
- Example: `https://us1-abc.upstash.io`

## Usage

### Automatic Validation:

Validation runs automatically when app starts:

```typescript
// app/layout.tsx
import { validateEnv } from '@/lib/env'

if (typeof window === 'undefined') {
  validateEnv()  // ✅ Validates on server start
}
```

### Typed Access:

```typescript
import { env } from '@/lib/env'

// ✅ Type-safe access
const supabaseUrl = env.supabase.url
const botToken = env.telegram.botToken

// ✅ Boolean helpers
if (env.isDevelopment) {
  console.log('Running in development mode')
}

if (env.isProduction) {
  // Production-only code
}
```

### Service Availability Check:

```typescript
import { hasService } from '@/lib/env'

// ✅ Check if service is configured
if (hasService.telegram) {
  await sendTelegramNotification(...)
} else {
  console.warn('Telegram not configured')
}

if (hasService.yukassa) {
  await createPayment(...)
}

if (hasService.redis) {
  await rateLimit(...)
}
```

## Error Handling

### Missing Required Variable:

```
❌ Invalid environment variables:
  - NEXT_PUBLIC_SUPABASE_URL: Required
  - NEXT_PUBLIC_SUPABASE_ANON_KEY: Required
```

**In Production**: App exits with code 1
**In Development**: Warning logged, app continues

### Invalid Format:

```
❌ Invalid environment variables:
  - TELEGRAM_BOT_TOKEN: Invalid format
  - UPSTASH_REDIS_REST_URL: Invalid url
```

### Success:

```
✅ Environment variables validated successfully
```

## Development Setup

### 1. Copy example file:

```bash
cp .env.example .env.local
```

### 2. Fill in required values:

```env
# Minimum required for development:
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Start dev server:

```bash
pnpm dev
# ✅ Environment variables validated successfully
```

## Production Deployment

### Vercel:

1. **Settings** → **Environment Variables**
2. Add all required variables
3. **Redeploy**

### Validation on Deploy:

Build will fail if required variables missing:
```
❌ Invalid environment variables:
  - NEXT_PUBLIC_SUPABASE_URL: Required

Build failed
```

## Testing

### Manual Test:

```bash
# Remove a required variable
unset NEXT_PUBLIC_SUPABASE_URL

# Start app
pnpm dev

# Should see error:
# ❌ Invalid environment variables:
#   - NEXT_PUBLIC_SUPABASE_URL: Required
```

### In Tests:

```typescript
// tests/env.test.ts
import { validateEnv } from '@/lib/env'

test('should validate environment variables', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

  expect(() => validateEnv()).not.toThrow()
})

test('should reject invalid URL', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url'

  expect(() => validateEnv()).toThrow()
})
```

## Common Issues

### Issue: App won't start

**Error**:
```
❌ Invalid environment variables:
  - NEXT_PUBLIC_SUPABASE_URL: Required
```

**Fix**:
1. Copy `.env.example` to `.env.local`
2. Fill in Supabase credentials
3. Restart dev server

### Issue: Telegram not working

**Check**:
```typescript
import { hasService } from '@/lib/env'

console.log('Telegram configured:', hasService.telegram)
```

**Fix**: Add `TELEGRAM_BOT_TOKEN` to env

### Issue: Build fails on Vercel

**Fix**:
1. Vercel Dashboard → Settings → Environment Variables
2. Add missing variables
3. Redeploy

## Best Practices

### 1. Never commit .env files:

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### 2. Document all variables:

Keep `.env.example` updated:
```env
# .env.example
REQUIRED_VAR=example-value
OPTIONAL_VAR=optional-value
```

### 3. Use descriptive names:

```env
# ✅ Good
NEXT_PUBLIC_SUPABASE_URL=...

# ❌ Bad
PUBLIC_URL=...
```

### 4. Prefix public variables:

```env
# ✅ Exposed to browser
NEXT_PUBLIC_API_URL=...

# ✅ Server-only
SECRET_KEY=...
```

### 5. Validate early:

Call `validateEnv()` in root layout so errors appear immediately on startup.

## Security

### Public vs Private:

**Public** (NEXT_PUBLIC_*):
- Exposed to browser
- Visible in client bundle
- Use for: API URLs, public keys

**Private** (no prefix):
- Server-only
- Never exposed to client
- Use for: Secret keys, tokens

### Sensitive Values:

```env
# ✅ Private - server only
SUPABASE_SERVICE_ROLE_KEY=secret...
YUKASSA_SECRET_KEY=secret...
TELEGRAM_BOT_TOKEN=secret...

# ✅ Public - safe to expose
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Rotation:

Rotate secrets regularly:
1. Generate new key in service dashboard
2. Update env variable in Vercel
3. Redeploy
4. Revoke old key

## Migration Guide

### From untyped to typed access:

**Before**:
```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
```

**After**:
```typescript
import { env } from '@/lib/env'

const url = env.supabase.url  // ✅ Type-safe
```

### Benefits:
- ✅ Autocomplete
- ✅ Type checking
- ✅ Validation
- ✅ Centralized config

## Extending

### Add new variable:

1. **Update schema**:
```typescript
// lib/env.ts
const envSchema = z.object({
  ...
  MY_NEW_VAR: z.string().min(1),
})
```

2. **Add to typed access**:
```typescript
export const env = {
  ...
  myService: {
    apiKey: process.env.MY_NEW_VAR!,
  },
}
```

3. **Update .env.example**:
```env
# My Service
MY_NEW_VAR=your-api-key
```

4. **Document in ENV_VALIDATION.md**

## CI/CD Integration

### GitHub Actions:

```yaml
# .github/workflows/deploy.yml
- name: Validate Environment
  run: |
    pnpm build  # Validation runs during build
```

### Pre-deploy Hook:

```bash
# scripts/pre-deploy.sh
#!/bin/bash

# Validate env before deploy
pnpm preflight

if [ $? -ne 0 ]; then
  echo "❌ Environment validation failed"
  exit 1
fi
```

## Monitoring

### Sentry Context:

Add env info to error reports:
```typescript
Sentry.setContext('environment', {
  nodeEnv: env.nodeEnv,
  vercelEnv: env.vercel.env,
  hasRedis: hasService.redis,
  hasTelegram: hasService.telegram,
})
```

### Health Check:

```typescript
// app/api/health/route.ts
import { hasService } from '@/lib/env'

export async function GET() {
  return Response.json({
    status: 'healthy',
    services: {
      telegram: hasService.telegram,
      payments: hasService.yukassa,
      rateLimit: hasService.redis,
      errorTracking: hasService.sentry,
    },
  })
}
```

## Environment-specific Config

### Development:

```env
# .env.local (development)
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
```

### Staging:

```env
# Vercel preview deployments
VERCEL_ENV=preview
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
```

### Production:

```env
# Vercel production
VERCEL_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
```

## Troubleshooting

### Variable not loading:

1. Check file name: `.env.local` (not `.env`)
2. Restart dev server (env cached)
3. Check prefix: `NEXT_PUBLIC_*` for client
4. Verify no syntax errors in .env file

### Build failing:

```bash
# Check which variables are missing
pnpm build

# Output will show specific missing variables
```

### Runtime errors:

```typescript
// Check if variable is actually set
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

// Use typed access for validation
import { env } from '@/lib/env'
console.log('Validated URL:', env.supabase.url)
```

## Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Zod Documentation](https://zod.dev/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Checklist

Before deploying:
- [ ] All required variables in Vercel
- [ ] Variables validated locally
- [ ] .env.example up to date
- [ ] Documentation updated
- [ ] No secrets in git
- [ ] Build passes with all env set

## Summary

**Benefits**:
- ✅ Early error detection
- ✅ Type-safe access
- ✅ Auto-completion
- ✅ Clear error messages
- ✅ Production safety
- ✅ Developer experience

**Usage**:
```bash
# Validate
pnpm dev  # Auto-validates on start

# Typed access
import { env } from '@/lib/env'
const url = env.supabase.url

# Check service
import { hasService } from '@/lib/env'
if (hasService.telegram) { ... }
```

**Result**: No more runtime errors from missing environment variables! 🎉
