import { NextResponse } from 'next/server';

export function middleware(request) {
  const authToken = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  const publicPaths = ['/login', '/api/login', '/api/logout', '/favicon.ico'];

  const isPublicPath = publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/backend-api') ||
    (pathname.includes('.') && !pathname.endsWith('.html'));

  // No auth token + not a public path → redirect to login
  if (!authToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in and visiting /login → redirect to home
  if (authToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
