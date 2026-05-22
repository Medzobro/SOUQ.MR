'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { startConversationAction } from '@/app/[locale]/messages/actions';

interface Props {
  ownerId: string;
  selfId?: string | null;
}

export default function MessageStoreButton({ ownerId, selfId }: Props) {
  const t = useTranslations('store');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (selfId && selfId === ownerId) return null;

  const onClick = () => {
    startTransition(async () => {
      const result = await startConversationAction({ sellerId: ownerId });
      if (result.ok && result.conversationId) {
        router.push(`/messages/${result.conversationId}`);
      } else if (!result.ok && result.needsAuth) {
        router.push('/auth');
      }
    });
  };

  return (
    <button
      type="button"
      className="btn-primary"
      style={{ flex: 1 }}
      onClick={onClick}
      disabled={pending}
    >
      {t('messageStore')}
    </button>
  );
}
