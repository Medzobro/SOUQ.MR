'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { routing, type AppLocale } from '@/i18n/routing';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const t = useTranslations('nav');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(Boolean(data.user));
      setUserName(data.user?.user_metadata?.full_name ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session?.user));
      setUserName(session?.user?.user_metadata?.full_name ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    // Lock body scroll when open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    close();
    router.push('/');
    router.refresh();
  };

  const handleLocale = (next: AppLocale) => {
    close();
    router.replace(pathname, { locale: next });
  };

  return (
    <>
      {/* Hamburger button — 3 lines */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('menu')}
        style={{
          background: 'var(--color-bg-card-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          cursor: 'pointer',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-card)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-card-2)'; }}
      >
        <span style={{ width: 18, height: 2, background: 'var(--color-text)', borderRadius: 2 }} />
        <span style={{ width: 18, height: 2, background: 'var(--color-text)', borderRadius: 2 }} />
        <span style={{ width: 18, height: 2, background: 'var(--color-text)', borderRadius: 2 }} />
      </button>

      {/* Overlay — click to close */}
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
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            insetInlineEnd: 0,
            width: 280,
            height: '100%',
            background: 'var(--color-bg-card)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 20px',
            gap: 8,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
            animation: 'slideInRight 0.25s ease-out',
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
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>
            SOUQ.MR
          </div>

          {/* User greeting */}
          {authed && userName && (
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--color-text)',
              marginBottom: 8,
              padding: '8px 0',
            }}>
              👋 {userName}
            </div>
          )}

          {/* Language section */}
          <div style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 11,
              color: 'var(--color-text-muted)',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
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

          {/* Logout */}
          {authed ? (
            <div style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: 16,
            }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(231,76,60,0.3)',
                  background: 'transparent',
                  color: '#e74c3c',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                🚪 {t('logout')}
              </button>
            </div>
          ) : (
            <div style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: 16,
            }}>
              <button
                type="button"
                onClick={() => { close(); router.push('/auth'); }}
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
      )}

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
