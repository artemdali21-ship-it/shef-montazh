import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/shifts',
    '/messages',
    '/shef',
    '/applications',
    '/monitoring',
    '/create-shift',
    '/settings',
  ]

  // Define public routes
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password']

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Get auth token from cookies
  const authToken = req.cookies.get('sb-access-token')?.value ||
                    req.cookies.get('supabase-auth-token')?.value

  // If user is not authenticated and trying to access protected route
  if (!authToken && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', req.url)
    // Save return URL to redirect after login
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
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
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
}
