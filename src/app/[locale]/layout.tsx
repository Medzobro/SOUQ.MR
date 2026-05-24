import type { Metadata, Viewport } from 'next';
import { Cairo, Bebas_Neue } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { routing, localeDirection, type AppLocale } from '@/i18n/routing';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';

import '../globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600', '700', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: {
      default: `${t('appName')} — ${t('tagline')}`,
      template: `%s · ${t('appName')}`,
    },
    description: t('tagline'),
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    },
    openGraph: {
      title: `${t('appName')} — ${t('tagline')}`,
      description: t('tagline'),
      type: 'website',
      locale,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) notFound();
  const typedLocale = locale as AppLocale;

  setRequestLocale(typedLocale);
  const messages = await getMessages();

  return (
    <html
      lang={typedLocale}
      dir={localeDirection[typedLocale]}
      className={`${cairo.variable} ${bebas.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <TopNav />
          <main>{children}</main>
          <BottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
