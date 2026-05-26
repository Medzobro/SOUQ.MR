'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/cn';

const ITEMS: Array<{ key: 'home' | 'search' | 'messages' | 'profile'; href: string; icon: string }> = [
  { key: 'home', href: '/', icon: '🏠' },
  { key: 'search', href: '/search', icon: '🔍' },
  { key: 'messages', href: '/messages', icon: '💬' },
  { key: 'profile', href: '/profile', icon: '👤' },
];

/**
 * Mobile-style bottom navigation with a centered "+" button to add a listing.
 * Hidden on /auth via the `data-hide-on-auth` attribute (CSS handles it).
 */
export default function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const isAuth = pathname.includes('/auth');
  const isAdmin = pathname.includes('/admin-secret');

  if (isAuth || isAdmin) return null;

  const isActive = (href: string) => {
    // Match pathname against href considering locale prefix
    // pathname is like /ar/search, href is like /search
    if (href === '/') return pathname === '/' || pathname === '/ar';
    return pathname.endsWith(href) || pathname.includes(href + '/');
  };

  return (
    <div className="bottom-nav" data-hide-on-auth>
      <Link
        href={ITEMS[0].href}
        className={cn('bottom-nav-item', isActive(ITEMS[0].href) && 'active')}
      >
        <span className="bottom-nav-icon">{ITEMS[0].icon}</span>
        <span className="bottom-nav-label">{t(ITEMS[0].key)}</span>
      </Link>

      <Link
        href={ITEMS[1].href}
        className={cn('bottom-nav-item', isActive(ITEMS[1].href) && 'active')}
      >
        <span className="bottom-nav-icon">{ITEMS[1].icon}</span>
        <span className="bottom-nav-label">{t(ITEMS[1].key)}</span>
      </Link>

      <div className="bottom-nav-add">
        <Link href="/sell" className="bottom-nav-add-btn" aria-label={t('addListing')}>
          +
        </Link>
      </div>

      <Link
        href={ITEMS[2].href}
        className={cn('bottom-nav-item', isActive(ITEMS[2].href) && 'active')}
      >
        <span className="bottom-nav-icon">{ITEMS[2].icon}</span>
        <span className="bottom-nav-label">{t(ITEMS[2].key)}</span>
      </Link>

      <Link
        href={ITEMS[3].href}
        className={cn('bottom-nav-item', isActive(ITEMS[3].href) && 'active')}
      >
        <span className="bottom-nav-icon">{ITEMS[3].icon}</span>
        <span className="bottom-nav-label">{t(ITEMS[3].key)}</span>
      </Link>
    </div>
  );
}
