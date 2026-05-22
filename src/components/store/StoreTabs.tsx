'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

type TabKey = 'products' | 'about' | 'reviews';

interface Props {
  productsContent: ReactNode;
  aboutContent: ReactNode;
  reviewsContent: ReactNode;
}

export default function StoreTabs({ productsContent, aboutContent, reviewsContent }: Props) {
  const t = useTranslations('store');
  const [tab, setTab] = useState<TabKey>('products');

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'products', label: t('tabProducts') },
    { key: 'about', label: t('tabAbout') },
    { key: 'reviews', label: t('tabReviews') },
  ];

  return (
    <>
      <div className="tab-pills">
        {tabs.map((x) => (
          <button
            key={x.key}
            type="button"
            className={cn('tab-pill', tab === x.key && 'active')}
            onClick={() => setTab(x.key)}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === 'products' && productsContent}
      {tab === 'about' && aboutContent}
      {tab === 'reviews' && reviewsContent}
    </>
  );
}
