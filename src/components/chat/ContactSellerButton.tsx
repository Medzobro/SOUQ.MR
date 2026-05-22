'use client';

import { useTransition, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { startConversationAction } from '@/app/[locale]/messages/actions';

interface Props {
  sellerId: string;
  productId: string;
  /** Hide the button if the viewer is the seller themselves */
  selfId?: string | null;
}

export default function ContactSellerButton({ sellerId, productId, selfId }: Props) {
  const t = useTranslations('product');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (selfId && selfId === sellerId) return null;

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await startConversationAction({ sellerId, productId });
      if (result.ok && result.conversationId) {
        router.push(`/messages/${result.conversationId}`);
      } else if (!result.ok && result.needsAuth) {
        router.push('/auth');
      } else {
        setError('errorGeneric');
      }
    });
  };

  return (
    <>
      <button
        type="button"
        className="btn-primary"
        style={{ fontSize: 15, padding: '14px' }}
        onClick={onClick}
        disabled={pending}
      >
        {t('messageSeller')}
      </button>
      {error ? <div className="toast error">{error}</div> : null}
    </>
  );
}
