import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },
  typedRoutes: false,

  // ── Security headers ─────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://*.supabase.in",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redirect locale-less paths to Arabic (default locale)
  async redirects() {
    return [
      { source: '/search', destination: '/ar/search', permanent: false },
      { source: '/sell', destination: '/ar/sell', permanent: false },
      { source: '/messages', destination: '/ar/messages', permanent: false },
      { source: '/profile', destination: '/ar/profile', permanent: false },
      { source: '/auth', destination: '/ar/auth', permanent: false },
      { source: '/categories', destination: '/ar/categories', permanent: false },
      { source: '/product/:id', destination: '/ar/product/:id', permanent: false },
      { source: '/store/:id', destination: '/ar/store/:id', permanent: false },
      { source: '/admin-secret', destination: '/ar/admin-secret', permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
