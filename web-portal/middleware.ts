import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session cookie
  const sessionCookie = request.cookies.get('session');
  const hasSession = !!sessionCookie?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/leaderboard',
    '/api/auth/login',
    '/api/leaderboard',
    '/_next',
    '/favicon.ico',
  ];
  
  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Redirect to login if accessing protected route without session
  if (!isPublicRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect to dashboard if accessing login with active session
  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect root to dashboard if logged in, otherwise to login
  if (pathname === '/') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes that are public
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
