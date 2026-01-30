import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

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
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  // Allow shift details page for viewing (but some actions may require auth)
  const isShiftDetailsPage = /^\/shift\/[^/]+$/.test(pathname)

  // If user is not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', req.url)
    // Save return URL to redirect after login
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to appropriate dashboard
  if (session && (pathname === '/auth/login' || pathname === '/auth/register')) {
    // Get user role from users table
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userData) {
      let redirectPath = '/'
      switch (userData.role) {
        case 'worker':
          redirectPath = '/feed'
          break
        case 'client':
          redirectPath = '/dashboard'
          break
        case 'shef':
          redirectPath = '/shef/dashboard'
          break
      }
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  return res
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
