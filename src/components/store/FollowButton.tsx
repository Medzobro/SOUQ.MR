'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/cn';

interface Props {
  storeId: string;
  initialFollowed?: boolean;
}

export default function FollowButton({ storeId, initialFollowed = false }: Props) {
  const t = useTranslations('store');
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowed);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUserId, setAuthedUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthedUserId(data.user?.id ?? null);
      setAuthChecked(true);
    });
  }, []);

  const onClick = () => {
    if (!authedUserId) {
      router.push('/auth');
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const next = !following;
      setFollowing(next);
      if (next) {
        await supabase
          .from('followers')
          .insert({ follower_id: authedUserId, store_id: storeId } as never);
      } else {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', authedUserId)
          .eq('store_id', storeId);
      }
    });
  };

  return (
    <button
      type="button"
      className={cn(following ? 'btn-primary' : 'btn-outline')}
      style={{ flex: 1 }}
      onClick={onClick}
      disabled={isPending || !authChecked}
    >
      {following ? t('following') : t('follow')}
    </button>
  );
}
