import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate for production
  // This sets the sample rate at 10% for production to reduce costs
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set sample rate for profiling - relative to tracesSampleRate
  profilesSampleRate: 1.0,

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking (useful for Vercel deployments)
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Integrations
  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/, /^https:\/\/shef-montazh\./],
    }),
    new Sentry.Replay({
      // Mask all text content for privacy
      maskAllText: true,
      // Block all media content (images, videos, etc)
      blockAllMedia: true,
    }),
  ],

  // Ignore certain errors that are not actionable
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Random plugins/extensions
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    // React hydration errors (often not fixable)
    'Hydration failed',
    'There was an error while hydrating',
    // ResizeObserver errors (not actionable)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // Non-Error promise rejections
    'Non-Error promise rejection captured',
    // Telegram WebApp errors
    'TelegramWebviewProxy',
  ],

  // Filter out localhost errors in production
  beforeSend(event, hint) {
    // Don't send errors from localhost in production
    if (
      process.env.NODE_ENV === 'production' &&
      event.request?.url?.includes('localhost')
    ) {
      return null
    }

    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    return event
  },

  // Set context for better debugging
  initialScope: {
    tags: {
      app: 'shef-montazh',
      platform: 'web',
    },
  },
})
