import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase auth cookies
  const authResponse = await updateSession(request);

  // 2. Run i18n middleware (handles locale routing)
  const intlResponse = intlMiddleware(request);

  // Merge auth cookies onto the i18n response
  authResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|_vercel|.*\\..*|api/).*)',
    // Always run for the root
    '/',
  ],
};
