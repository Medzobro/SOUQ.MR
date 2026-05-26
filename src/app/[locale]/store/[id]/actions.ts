'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: Awaited<ReturnType<typeof createClient>>): any {
  return supabase;
}

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable()
    .transform((v) => (v === '' || v == null ? null : v)),
});

export type SubmitReviewState = {
  ok: boolean;
  error?: string;
};

export async function submitReviewAction(
  storeId: string,
  ownerId: string,
  _prev: SubmitReviewState | null,
  formData: FormData,
): Promise<SubmitReviewState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  // Prevent self-review
  if (user.id === ownerId) {
    return { ok: false, error: 'cannotReviewOwn' };
  }

  const parsed = reviewSchema.safeParse({
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    if (first?.path?.includes('rating')) {
      return { ok: false, error: 'Invalid rating (1-5)' };
    }
    return { ok: false, error: first?.message ?? 'Invalid input' };
  }

  const { rating, comment } = parsed.data;

  const { error } = await db(supabase)
    .from('reviews')
    .insert({
    store_id: storeId,
    reviewer_id: user.id,
    rating,
    comment,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
