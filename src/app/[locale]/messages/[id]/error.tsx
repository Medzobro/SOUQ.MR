'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function MessageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('messages');

  useEffect(() => {
    console.error('Message page error:', error);
  }, [error]);

  return (
    <div className="chat-page">
      <div className="empty-state">
        <span style={{ fontSize: '3rem' }}>💬</span>
        <h2>{t('errorTitle') || 'Could not load messages'}</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          {error.message || 'Please try again later.'}
        </p>
        <button onClick={() => reset()} className="btn-primary" style={{ marginTop: '1rem' }}>
          Try again
        </button>
      </div>
    </div>
  );
}
