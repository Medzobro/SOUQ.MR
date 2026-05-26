import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect locale-less paths to default locale prefix
  // e.g. /search → /ar/search, /sell → /ar/sell
  const validLocales = ['ar', 'fr', 'en'];
  const firstSegment = pathname.split('/')[1];
  if (firstSegment && !validLocales.includes(firstSegment) && pathname !== '/') {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'ar';
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Run i18n middleware first (always works, no external deps)
  const intlResponse = intlMiddleware(request);

  // Try to refresh Supabase session (non-critical for page rendering)
  try {
    const authResponse = await updateSession(request);
    // Merge auth cookies onto the i18n response
    authResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
  } catch (e) {
    // Auth refresh failed — likely missing Supabase env vars
    // Continue serving the page without auth
    console.error('Session refresh failed:', (e as Error).message);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|_vercel|.*\\.*|api/).*)',
    // Always run for the root
    '/',
  ],
};
