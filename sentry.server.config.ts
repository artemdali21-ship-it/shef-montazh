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
      platform: 'server',
    },
  },

  // Ignore certain errors
  ignoreErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
  ],

  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          // Remove authorization headers
          delete breadcrumb.data.authorization
          delete breadcrumb.data.cookie
          // Remove sensitive query params
          if (breadcrumb.data.query) {
            delete breadcrumb.data.query.token
            delete breadcrumb.data.query.api_key
          }
        }
        return breadcrumb
      })
    }

    // Remove sensitive request data
    if (event.request) {
      delete event.request.cookies
      if (event.request.headers) {
        delete event.request.headers.authorization
        delete event.request.headers.cookie
      }
    }

    return event
  },

  // Configure integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
})
