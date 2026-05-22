'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';

interface Props {
  productId: string;
  initial: boolean;
}

export default function FavoriteButton({ productId, initial }: Props) {
  const [isFav, setIsFav] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      const next = !isFav;
      setIsFav(next);

      if (next) {
        await supabase.from('favorites').insert({ user_id: user.id, product_id: productId } as never);
      } else {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      }
    });
  };

  return (
    <button
      type="button"
      className="product-fav"
      onClick={toggle}
      disabled={isPending}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFav ? '❤️' : '♡'}
    </button>
  );
}
