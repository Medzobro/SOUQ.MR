'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('product');

  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="empty-state">
      <span style={{ fontSize: '3rem' }}>🛍️</span>
      <h2>{t('errorLoading') || 'Could not load product'}</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        {error.message || 'Please try again later.'}
      </p>
      <button onClick={() => reset()} className="btn-primary" style={{ marginTop: '1rem' }}>
        {t('tryAgain') || 'Try again'}
      </button>
    </div>
  );
}
