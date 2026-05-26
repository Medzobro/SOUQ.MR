'use client';

import { useActionState, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { signInAction, signUpAction, type AuthState } from './actions';
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
