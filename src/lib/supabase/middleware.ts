import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import type { CookieOptions } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect authenticated routes — redirect to /auth if not logged in
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/').filter(Boolean);

  // Extract locale (first segment should be 'ar', 'en', or 'fr')
  const validLocales = ['ar', 'en', 'fr'];
  const locale = validLocales.includes(segments[0]) ? segments[0] : null;

  // Protected route prefixes (relative to locale segment)
  const protectedRouteSegments = ['profile', 'sell', 'messages'];
  const isProtected =
    locale !== null &&
    segments.length >= 2 &&
    protectedRouteSegments.includes(segments[1]);

  if (!user && isProtected && locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
