import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const middleware: any = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/api/auth', '/api/health'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Supplier portal routes (token-based, no login required)
  const isSupplierRoute = pathname.startsWith('/fragebogen');

  // Static files and Next.js internals
  const isStaticRoute =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.');

  if (isStaticRoute || isSupplierRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export default middleware;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
