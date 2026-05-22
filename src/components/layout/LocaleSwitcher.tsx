'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { routing, localeLabels, type AppLocale } from '@/i18n/routing';

/**
 * Compact language switcher used in the top nav.
 * Switches locale by re-pushing the current pathname under the new locale segment.
 */
export default function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onChange = (next: AppLocale) => {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => onChange(e.target.value as AppLocale)}
      disabled={isPending}
      className="btn-nav"
      style={{ paddingInline: 12 }}
    >
      {routing.locales.map((l) => (
        <option key={l} value={l} style={{ background: '#12121A', color: '#F0EDE8' }}>
          {l === 'ar' ? '🇲🇷 ' : l === 'fr' ? '🇫🇷 ' : '🇬🇧 '}
          {localeLabels[l]}
        </option>
      ))}
    </select>
  );
}
