import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Don't log errors in development
  enabled: process.env.NODE_ENV === 'production',

  // Set context for better debugging
  initialScope: {
    tags: {
      app: 'shef-montazh',
      platform: 'edge',
    },
  },
})
