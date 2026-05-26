'use client';

import { useActionState, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { signInAction, signUpAction, signInWithGoogleAction, type AuthState } from './actions';
import { cn } from '@/lib/cn';

type Tab = 'login' | 'register';
type Role = 'buyer' | 'seller';

const initialState: AuthState | null = null;

export default function AuthForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const params = useSearchParams();
  const initialMode = params.get('mode') === 'register' ? 'register' : 'login';

  const [tab, setTab] = useState<Tab>(initialMode);
  const [role, setRole] = useState<Role>('buyer');

  const [loginState, loginFormAction, loginPending] = useActionState(signInAction, initialState);
  const [signupState, signupFormAction, signupPending] = useActionState(signUpAction, initialState);

  const state = tab === 'login' ? loginState : signupState;
  const pending = tab === 'login' ? loginPending : signupPending;

  // Reset role when switching tabs
  useEffect(() => {
    if (tab === 'login') setRole('buyer');
  }, [tab]);

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-text">SOUQ.MR</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {tCommon('tagline')}
        </div>
      </div>

      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'login'}
          className={cn('auth-tab', tab === 'login' && 'active')}
          onClick={() => setTab('login')}
        >
          {t('login')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'register'}
          className={cn('auth-tab', tab === 'register' && 'active')}
          onClick={() => setTab('register')}
        >
          {t('register')}
        </button>
      </div>

      {state?.ok === false && state.error ? (
        <div className="toast error" style={{ position: 'static', transform: 'none', marginBottom: 16 }}>
          {t(state.error as 'errorGeneric' | 'errorInvalidCredentials' | 'errorEmailExists')}
        </div>
      ) : null}

      {state?.ok === true && state.message ? (
        <div className="toast success" style={{ position: 'static', transform: 'none', marginBottom: 16 }}>
          {t(state.message as 'successCheckEmail')}
        </div>
      ) : null}

      {tab === 'login' ? (
        <form action={loginFormAction}>
          <div className="input-group">
            <label className="input-label">{t('email')}</label>
            <div className="input-wrap">
              <input
                className="input-field"
                name="email"
                type="email"
                required
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('password')}</label>
            <div className="input-wrap">
              <input
                className="input-field"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder={t('passwordPlaceholder')}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div style={{ textAlign: 'start', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: 'var(--color-accent)', cursor: 'pointer' }}>
              {t('forgotPassword')}
            </span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', fontSize: 16, padding: '14px' }}
            disabled={pending}
          >
            {pending ? tCommon('loading') : t('loginButton')}
          </button>
        </form>
      ) : (
        <form action={signupFormAction}>
          <input type="hidden" name="role" value={role} />
          <div className="role-select">
            <button
              type="button"
              className={cn('role-btn', role === 'buyer' && 'active')}
              onClick={() => setRole('buyer')}
            >
              <div className="role-btn-icon">🛒</div>
              <div className="role-btn-label">{t('roleBuyer')}</div>
            </button>
            <button
              type="button"
              className={cn('role-btn', role === 'seller' && 'active')}
              onClick={() => setRole('seller')}
            >
              <div className="role-btn-icon">🏪</div>
              <div className="role-btn-label">{t('roleSeller')}</div>
            </button>
          </div>

          <div className="input-group">
            <label className="input-label">{t('fullName')}</label>
            <div className="input-wrap">
              <input
                className="input-field"
                name="fullName"
                type="text"
                required
                minLength={2}
                placeholder={t('fullNamePlaceholder')}
                autoComplete="name"
              />
            </div>
          </div>

          {role === 'seller' && (
            <div className="input-group">
              <label className="input-label">{t('storeName')}</label>
              <div className="input-wrap">
                <input
                  className="input-field"
                  name="storeName"
                  type="text"
                  required
                  minLength={2}
                  placeholder={t('storeNamePlaceholder')}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">{t('phone')}</label>
            <div className="input-wrap">
              <input
                className="input-field"
                name="phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                autoComplete="tel"
                dir="ltr"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('email')}</label>
            <div className="input-wrap">
              <input
                className="input-field"
                name="email"
                type="email"
                required
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('password')}</label>
            <div className="input-wrap">
              <input
                className="input-field"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder={t('passwordPlaceholder')}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', fontSize: 16, padding: '14px' }}
            disabled={pending}
          >
            {pending ? tCommon('loading') : t('registerButton')}
          </button>
        </form>
      )}

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <div className="auth-divider-text">{t('or')}</div>
        <div className="auth-divider-line" />
      </div>

      <button
        type="button"
        onClick={() => signInWithGoogleAction()}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          background: '#fff',
          color: '#333',
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontWeight: 600,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t('loginWithGoogle')}
      </button>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--color-text-muted)' }}>
        {tab === 'login' ? t('noAccount') : t('hasAccount')}
        <span
          style={{ color: 'var(--color-accent)', cursor: 'pointer' }}
          onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
        >
          {tab === 'login' ? t('registerNow') : t('loginNow')}
        </span>
      </p>
    </div>
  );
}
