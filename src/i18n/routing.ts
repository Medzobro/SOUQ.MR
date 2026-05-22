import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ar', 'fr', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];

export const localeDirection: Record<AppLocale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  fr: 'ltr',
  en: 'ltr',
};

export const localeLabels: Record<AppLocale, string> = {
  ar: 'العربية',
  fr: 'Français',
  en: 'English',
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
