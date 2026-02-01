import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ratelimit, authRatelimit, createRatelimit, sensitiveRatelimit, isRateLimitEnabled } from './lib/rate-limit'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ===== RATE LIMITING FOR API ROUTES =====
  if (pathname.startsWith('/api')) {
    // Only apply rate limiting if Upstash is configured
    if (isRateLimitEnabled()) {
      // Get IP address (with fallback)
      const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1'

      let rateLimiter = ratelimit
      let limiterType = 'general'

      // Choose appropriate rate limiter based on endpoint
      if (pathname.startsWith('/api/auth')) {
        rateLimiter = authRatelimit
        limiterType = 'auth'
      } else if (
        pathname.includes('/create') ||
        pathname.includes('/insert') ||
        pathname.startsWith('/api/shifts') && req.method === 'POST'
      ) {
        rateLimiter = createRatelimit
        limiterType = 'create'
      } else if (
        pathname.includes('/payment') ||
        pathname.includes('/refund') ||
        pathname.includes('/dispute')
      ) {
        rateLimiter = sensitiveRatelimit
        limiterType = 'sensitive'
      }

      if (rateLimiter) {
        try {
          const { success, limit, reset, remaining } = await rateLimiter.limit(ip)

          // Create response
          const response = success
            ? NextResponse.next()
            : new NextResponse(JSON.stringify({
                error: 'Too Many Requests',
                message: `Rate limit exceeded for ${limiterType} endpoints. Please try again later.`,
                retryAfter: Math.ceil((reset - Date.now()) / 1000)
              }), {
                status: 429,
                headers: {
                  'Content-Type': 'application/json'
                }
              })

          // Add rate limit headers
          response.headers.set('X-RateLimit-Limit', limit.toString())
          response.headers.set('X-RateLimit-Remaining', remaining.toString())
          response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())
          response.headers.set('X-RateLimit-Type', limiterType)

          if (!success) {
            response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString())
          }

          return response
        } catch (error) {
          // If rate limiting fails, log and continue without rate limiting
          console.error('Rate limiting error:', error)
          return NextResponse.next()
        }
      }
    }

    // Continue to API route if rate limit passed or not configured
    return NextResponse.next()
  }

  // ===== AUTHENTICATION FOR PAGE ROUTES =====

  // Define protected routes (both client and worker prefixes)
  const protectedRoutes = [
    '/client',
    '/worker',
    '/dashboard',
    '/shef',
    '/applications',
    '/monitoring',
    '/create-shift'
  ]

  // Define admin routes (require authentication, role check happens in layout)
  const adminRoutes = ['/admin']

  // Define public routes
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password']

  // Check if current path is protected or admin
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Get auth token from cookies
  const authToken = req.cookies.get('sb-access-token')?.value ||
                    req.cookies.get('supabase-auth-token')?.value

  // Check for Telegram Mini App authentication (via query params or headers)
  const telegramAuth = req.nextUrl.searchParams.get('tgWebAppData') ||
                       req.headers.get('x-telegram-auth')

  // Admin routes MUST have authentication - no Telegram bypass
  if (isAdminRoute && !authToken) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is not authenticated (no token AND no Telegram auth) and trying to access protected route
  if (!authToken && !telegramAuth && isProtectedRoute) {
    // For Telegram Mini App, allow access without redirect
    // In production, we'll get Telegram user data from the WebApp
    // For now, allow access to enable development/testing
    return NextResponse.next()
  }

  // For authenticated users trying to access auth pages, we'll handle redirect on client side
  // to avoid issues with token validation in middleware

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
