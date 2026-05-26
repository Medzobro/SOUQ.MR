'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function SearchBar() {
  const t = useTranslations('home');
  const router = useRouter();
  const [q, setQ] = useState('');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = q.trim();
    router.push({ pathname: '/search', query: trimmed ? { q: trimmed } : {} });
  };

  return (
    <form onSubmit={onSubmit} className="search-wrap">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder={t('searchPlaceholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={t('searchPlaceholder')}
        />
        <button type="submit" className="filter-btn" aria-label={t('search')}>
          {t('search')}
        </button>
      </div>
    </form>
  );
}
