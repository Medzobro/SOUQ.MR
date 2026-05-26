'use client';

import { useRouter } from '@/i18n/routing';

interface Props {
  searchParams: string;
  label: string;
}

export default function SearchLoadMore({ searchParams, label }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        router.push(`/search?${searchParams}`);
      }}
      style={{
        background: 'var(--color-bg-card)',
        color: 'var(--color-accent)',
        border: '1px solid var(--color-accent)',
        borderRadius: 10,
        padding: '12px 32px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      📥 {label}
    </button>
  );
}
