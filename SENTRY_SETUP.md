# Sentry Setup Guide

## Overview

Sentry provides real-time error tracking, performance monitoring, and session replay for the ШЕФ-МОНТАЖ application.

## Setup Steps

### 1. Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new organization

### 2. Create Project

1. Click "Create Project"
2. Select "Next.js" as the platform
3. Set Alert frequency (e.g., "On every new issue")
4. Name your project: `shef-montazh` or `chef-montazh`
5. Click "Create Project"

### 3. Get DSN

1. Go to Settings → Projects → shef-montazh
2. Click on "Client Keys (DSN)"
3. Copy the DSN URL (looks like: `https://abc123@o123.ingest.sentry.io/456`)

### 4. Install Sentry

Run the Sentry wizard (interactive setup):

```bash
npx @sentry/wizard@latest -i nextjs
```

Or install manually:

```bash
npm install @sentry/nextjs
```

### 5. Configure Environment Variables

Add to `.env.local`:

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=shef-montazh
SENTRY_AUTH_TOKEN=your-auth-token
```

To get `SENTRY_AUTH_TOKEN`:
1. Go to Settings → Account → Auth Tokens
2. Click "Create New Token"
3. Select scopes: `project:read`, `project:releases`, `org:read`
4. Copy the token

### 6. Update next.config.js

Add Sentry webpack plugin:

```javascript
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // Your existing config
}

module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry webpack plugin options
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Upload sourcemaps for better stack traces
    widenClientFileUpload: true,

    // Automatically tree-shake Sentry logger statements
    disableLogger: true,

    // Hide source maps from generated client bundles
    hideSourceMaps: true,

    // Transpile SDK for older browsers
    transpileClientSDK: true,
  }
)
```

### 7. Restart Development Server

```bash
npm run dev
```

## Usage Examples

### Capture Exceptions

```typescript
import { captureException } from '@/lib/sentry-utils'

try {
  await createShift(data)
} catch (error) {
  captureException(error as Error, {
    shiftData: data,
    userId: user.id
  })
  throw error
}
```

### Capture Messages

```typescript
import { captureMessage } from '@/lib/sentry-utils'

captureMessage('Payment failed', 'error', {
  shiftId: '123',
  amount: 5000,
  paymentMethod: 'card'
})
```

### Set User Context

```typescript
import { setUser, clearUser } from '@/lib/sentry-utils'

// After login
setUser({
  id: user.id,
  email: user.email,
  username: user.full_name
})

// After logout
clearUser()
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/sentry-utils'

addBreadcrumb('User clicked create shift button', 'user-action', {
  buttonId: 'create-shift',
  timestamp: Date.now()
})
```

### Error Boundary

Wrap your app or specific components:

```tsx
import ErrorBoundary from '@/components/ErrorBoundary'

export default function RootLayout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
```

### With Error Handling Wrapper

```typescript
import { withErrorHandling } from '@/lib/sentry-utils'

const createShiftSafe = withErrorHandling(createShift, {
  operation: 'create-shift'
})

// Now createShiftSafe will automatically report errors to Sentry
await createShiftSafe(data)
```

## Configuration

### Sample Rates

Adjust in `sentry.client.config.ts`:

```typescript
// Traces (performance monitoring)
tracesSampleRate: 0.1  // 10% of transactions

// Session Replay
replaysSessionSampleRate: 0.1  // 10% of sessions
replaysOnErrorSampleRate: 1.0  // 100% of sessions with errors
```

### Ignored Errors

Add patterns to ignore in `sentry.client.config.ts`:

```typescript
ignoreErrors: [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
  // Add more patterns
]
```

### Environment Detection

Sentry only runs in production by default:

```typescript
enabled: process.env.NODE_ENV === 'production'
```

## Features

### 1. Error Tracking
- Automatic capture of unhandled errors
- Stack traces with source maps
- Breadcrumbs showing user actions
- User context and tags

### 2. Performance Monitoring
- Page load times
- API response times
- Database query performance
- Custom transactions

### 3. Session Replay
- Video-like replay of user sessions
- Privacy-first (masks text and blocks media)
- Replay on errors for debugging
- 10% sample rate for all sessions

### 4. Alerts
- Slack/Email notifications
- Custom alert rules
- Issue assignment
- Auto-resolve when fixed

## Dashboard

### View Errors

1. Go to sentry.io
2. Select your project
3. Click "Issues" to see all errors
4. Click on an issue for details:
   - Stack trace
   - Breadcrumbs
   - User info
   - Session replay (if available)

### View Performance

1. Click "Performance"
2. See transaction overview
3. Filter by operation type
4. View slow transactions

### View Releases

1. Click "Releases"
2. See deployment history
3. Track error rates per release
4. Compare releases

## Testing

### Test Error Tracking

Add a test button:

```tsx
<button onClick={() => {
  throw new Error('Sentry test error')
}}>
  Test Sentry
</button>
```

### Test Message Capture

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.captureMessage('Test message from app', 'info')
```

### Verify Setup

```bash
# Run in production mode
npm run build
npm start

# Trigger an error
# Check Sentry dashboard for the error
```

## Best Practices

1. **Set User Context** - Always set user info after login
2. **Add Breadcrumbs** - Log important user actions
3. **Use Tags** - Add tags for filtering (e.g., `shift_id`, `payment_status`)
4. **Set Context** - Add extra data to errors
5. **Filter Sensitive Data** - Remove passwords, tokens, etc.
6. **Monitor Performance** - Track slow operations
7. **Review Issues** - Check Sentry daily for new issues

## Troubleshooting

### Errors Not Appearing

1. Check DSN is correct
2. Verify `enabled: true` in production
3. Check browser console for Sentry errors
4. Verify network requests to sentry.io

### Source Maps Not Working

1. Check `SENTRY_AUTH_TOKEN` is set
2. Verify `org` and `project` in next.config.js
3. Run `npm run build` to upload source maps
4. Check Sentry → Settings → Source Maps

### High Event Volume

1. Adjust sample rates
2. Add more ignored errors
3. Use `beforeSend` to filter events
4. Check for error loops

## Cost Optimization

Free tier includes:
- 5,000 errors per month
- 10,000 performance transactions
- 50 replays per month

To optimize:
1. Set sample rates appropriately
2. Ignore non-actionable errors
3. Filter out development errors
4. Use breadcrumbs efficiently

## Support

- Sentry Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Status Page: https://status.sentry.io/
- Contact: support@shef-montazh.ru
