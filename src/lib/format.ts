import type { AppLocale } from '@/i18n/routing';

const localeMap: Record<AppLocale, string> = {
  ar: 'ar-MR',
  fr: 'fr-MR',
  en: 'en-US',
};

export function formatPrice(value: number | string, locale: AppLocale = 'ar'): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat(localeMap[locale]).format(n);
}

export function formatRelative(date: string | Date, locale: AppLocale = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(localeMap[locale], { numeric: 'auto' });

  const ranges: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2592000, 'week'],
    [31536000, 'month'],
    [Infinity, 'year'],
  ];

  for (let i = 0; i < ranges.length; i++) {
    const [limit, unit] = ranges[i];
    if (Math.abs(diffSec) < limit) {
      const divisor = i === 0 ? 1 : ranges[i - 1][0];
      return rtf.format(-Math.round(diffSec / divisor), unit);
    }
  }
  return d.toLocaleDateString(localeMap[locale]);
}

export function formatTime(date: string | Date, locale: AppLocale = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(localeMap[locale], { hour: '2-digit', minute: '2-digit' });
}

/** Convert an arbitrary string into a URL-safe slug (Latin + Arabic). */
export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
