import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

// `/api/cron` checks its own bearer token.
const PUBLIC_ROUTES = ['/login', '/api/auth', '/pending-confirmation', '/api/cron'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    // Remember where they wanted to go, so a shared restaurant link still lands on that restaurant after login.
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Icons and the manifest stay public: iOS fetches the home screen icon without the session cookie, often straight from
// /apple-touch-icon(-precomposed).png, so a redirect to /login would leave it without an icon.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.*\\.png|icon-.*\\.png|manifest\\.webmanifest).*)',
  ],
};
