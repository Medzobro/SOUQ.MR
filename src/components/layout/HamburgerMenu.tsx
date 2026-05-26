'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { routing, type AppLocale } from '@/i18n/routing';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const t = useTranslations('nav');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthed(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    close();
    router.push('/');
  };

  const handleLocale = (next: AppLocale) => {
    router.replace(pathname, { locale: next });
    close();
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('menu')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text)',
          fontSize: 24,
          cursor: 'pointer',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          lineHeight: 1,
        }}
      >
        ≡
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          insetInlineEnd: 0,
          width: 280,
          height: '100%',
          background: 'var(--color-bg-card)',
          zIndex: 1001,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          gap: 8,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          aria-label={t('close')}
          style={{
            alignSelf: 'flex-end',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: 28,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Logo */}
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, marginBottom: 16 }}>
          SOUQ.MR
        </div>

        {/* Language section */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('language')}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleLocale(l)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 8,
                  border: l === locale ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: l === locale ? 'var(--color-accent)' : 'transparent',
                  color: l === locale ? '#000' : 'var(--color-text)',
                  fontSize: 13,
                  fontWeight: l === locale ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {l === 'ar' ? '🇲🇷 عربي' : l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Account section */}
        {authed ? (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => { router.push('/profile'); close(); }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--color-bg-card-2)',
                color: 'var(--color-text)',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              👤 {t('profile')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: '#e74c3c',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              🚪 {t('logout') ?? 'تسجيل خروج'}
            </button>
          </div>
        ) : (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => { router.push('/auth'); close(); }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--color-accent)',
                color: '#000',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {t('login')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
