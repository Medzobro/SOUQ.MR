'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import LocaleSwitcher from './LocaleSwitcher';

/**
 * Sticky top navigation. Hides itself on /auth.
 * Reads the current user via the browser Supabase client.
 */
export default function TopNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setAuthed(Boolean(data.user)));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session?.user));
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (pathname.includes('/auth') || pathname.includes('/admin-secret')) return null;

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        SOUQ.MR
      </Link>

      <div className="nav-actions">
        <LocaleSwitcher />
        {authed === true ? (
          <Link href="/profile" className="btn-nav" aria-label={t('profile')}>
            {t('profile')}
          </Link>
        ) : authed === false ? (
          <>
            <Link href="/auth" className="btn-nav">
              {t('login')}
            </Link>
            <Link href="/auth?mode=register" className="btn-primary">
              {t('registerFree')}
            </Link>
          </>
        ) : (
          // initial render — keep space stable to avoid layout shift
          <span style={{ width: 140, height: 36 }} aria-hidden />
        )}
      </div>
    </nav>
  );
}
