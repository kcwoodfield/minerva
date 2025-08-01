import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth is temporarily disabled but code is kept for future use
const AUTH_ENABLED = false;

export function middleware(request: NextRequest) {
  // If auth is disabled, bypass all checks
  if (!AUTH_ENABLED) {
    return NextResponse.next();
  }

  const auth = request.cookies.get('auth');
  const isAuthPage = request.nextUrl.pathname === '/login';

  if (!auth && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (auth && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};