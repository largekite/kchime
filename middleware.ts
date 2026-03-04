import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware can't access localStorage (it's server-side).
// We rely on client-side OnboardingGuard for the actual redirect.
// This middleware is a placeholder to enable future edge-level logic.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|sw.js).*)'],
};
