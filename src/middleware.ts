import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

// ── In-memory rate limiting ────────────────────────────────────────────
// Map<IP, { windowStart: number; count: number }[]>
// Each IP gets an array of window entries, one per route bucket

interface RateLimitEntry {
  count: number;
  resetAt: number; // epoch ms
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks (every 5 min)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStore() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function getClientIP(request: NextRequest): string {
  // Vercel-compatible: use X-Forwarded-For or fallback to direct IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // X-Forwarded-For may contain multiple IPs (comma-separated);
    // the first one is the original client
    return forwarded.split(',')[0].trim();
  }
  // Fallback: Next.js geolocation IP or socket IP
  return request.headers.get('x-real-ip') ?? '127.0.0.1';
}

/** Rate limit configuration per route pattern */
function getRouteConfig(pathname: string): { bucket: string; max: number; windowMs: number } | null {
  if (pathname.startsWith('/api/')) {
    return { bucket: 'api', max: 5, windowMs: 60_000 };
  }
  // /sell appears in any locale prefix, e.g. /ar/sell, /fr/sell, /en/sell
  if (/^\/(ar|fr|en)\/sell/.test(pathname)) {
    return { bucket: 'sell', max: 5, windowMs: 60_000 };
  }
  // /messages/*
  if (/^\/(ar|fr|en)\/messages/.test(pathname)) {
    return { bucket: 'messages', max: 20, windowMs: 60_000 };
  }
  return null; // no rate limit for this route
}

function checkRateLimit(ip: string, config: { bucket: string; max: number; windowMs: number }): boolean {
  const key = `${ip}:${config.bucket}`;
  const now = Date.now();

  cleanupStore();

  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAt <= now) {
    // First request or window expired — reset
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return true; // allowed
  }

  if (existing.count >= config.max) {
    return false; // rate limited
  }

  existing.count++;
  return true; // allowed
}

// ── Locale redirect ──────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Rate limiting ────────────────────────────────────────────────────
  // Only rate limit POST requests to sensitive routes
  if (request.method === 'POST') {
    const routeConfig = getRouteConfig(pathname);
    if (routeConfig) {
      const ip = getClientIP(request);
      const allowed = checkRateLimit(ip, routeConfig);
      if (!allowed) {
        return NextResponse.json(
          { error: 'طلبات كثيرة جداً. الرجاء الانتظار قليلاً.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(routeConfig.windowMs / 1000)),
              'Content-Type': 'application/json; charset=utf-8',
            },
          },
        );
      }
    }
  }

  // ── Locale redirect ──────────────────────────────────────────────────
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
    // Include API routes for rate limiting
    '/api/:path*',
    // Locale-prefixed pages
    '/ar/:path*',
    '/fr/:path*',
    '/en/:path*',
    // Skip Next.js internals and static files, but run for root
    '/((?!_next|_vercel|.*\\.).*)',
    '/',
  ],
};
