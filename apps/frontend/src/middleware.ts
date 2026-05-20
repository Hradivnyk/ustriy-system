import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PREFIXES = ['/login', '/auth/'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublic) return NextResponse.next();

  if (!request.cookies.has('access_token')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
