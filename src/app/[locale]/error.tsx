'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="empty-state">
      <span style={{ fontSize: '3rem' }}>⚠️</span>
      <h2>{t('errorTitle') || 'Something went wrong'}</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        {error.message || t('errorDescription') || 'An unexpected error occurred.'}
      </p>
      <button onClick={() => reset()} className="btn-primary" style={{ marginTop: '1rem' }}>
        {t('tryAgain') || 'Try again'}
      </button>
    </div>
  );
}
