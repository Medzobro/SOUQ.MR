'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="empty-state">
      <span style={{ fontSize: '3rem' }}>🔍</span>
      <h2>{t('notFound') || 'Page not found'}</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        {t('notFoundDescription') || 'The page you are looking for does not exist.'}
      </p>
      <Link href="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
        {t('goHome') || 'Go home'}
      </Link>
    </div>
  );
}
