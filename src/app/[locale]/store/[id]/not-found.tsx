'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('store');
  const n = useTranslations('nav');

  return (
    <div className="empty-state">
      <span style={{ fontSize: '3rem' }}>🔎</span>
      <h2>{t('notFound') || 'Store not found'}</h2>
      <Link href="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
        {n('home') || 'Back to home'}
      </Link>
    </div>
  );
}
