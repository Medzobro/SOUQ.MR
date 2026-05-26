import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
