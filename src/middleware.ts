import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Strict Route Protection
 * Enforces production security by ensuring all internal dashboard and vault routes
 * are protected against unauthenticated access.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected internal route prefixes
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/vault');

  const authToken = request.cookies.get('nailed_it_auth_token')?.value;

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and navigating to /login, redirect to /dashboard
  if (pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/vault',
    '/vault/:path*',
    '/login',
  ],
};
