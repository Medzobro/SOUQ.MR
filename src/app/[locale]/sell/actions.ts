'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { moderateText, checkImageNSFW } from '@/lib/moderation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: Awaited<ReturnType<typeof createClient>>): any {
  return supabase;
}

const imageSchema = z.object({
  url: z.string().url(),
  path: z.string().min(1),
});

const productSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(4000).optional().nullable(),
  price: z.coerce.number().nonnegative(),
  currency: z.string().default('MRU'),
  category_id: z.string().uuid().optional().nullable(),
  condition: z.enum(['new', 'like_new', 'used', 'refurbished']).default('used'),
  city: z.string().trim().max(80).optional().nullable(),
  is_negotiable: z.coerce.boolean().default(true),
  images: z.array(imageSchema).default([]),
});

export type CreateProductState = {
  ok: boolean;
  error?: string;
  productId?: string;
};

export async function createProductAction(
  _prev: CreateProductState | null,
  formData: FormData,
): Promise<CreateProductState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  // Parse images JSON
  let images: Array<{ url: string; path: string }> = [];
  const imagesRaw = formData.get('images');
  if (typeof imagesRaw === 'string' && imagesRaw.length > 0) {
    try {
      images = JSON.parse(imagesRaw);
    } catch {
      images = [];
    }
  }

  const parsed = productSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    currency: formData.get('currency') ?? 'MRU',
    category_id: formData.get('category_id') || null,
    condition: formData.get('condition') ?? 'used',
    city: formData.get('city') || null,
    is_negotiable: formData.get('is_negotiable') === 'on',
    images,
  });

  if (!parsed.success) {
    return { ok: false, error: 'validation' };
  }

  // Content moderation
  const modResult = moderateText(parsed.data.title, parsed.data.description);
  if (!modResult.ok) {
    return { ok: false, error: 'content_blocked' };
  }

  // NSFW image check
  if (parsed.data.images.length > 0) {
    for (const img of parsed.data.images) {
      const nsfwResult = await checkImageNSFW(img.url);
      if (!nsfwResult.ok) {
        return { ok: false, error: 'image_blocked' };
      }
    }
  }

  // Find owner store
  const { data: storeData } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  const { data: created, error } = await db(supabase)
    .from('products')
    .insert({
      seller_id: user.id,
      store_id: (storeData as { id: string } | null)?.id ?? null,
      category_id: parsed.data.category_id ?? null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      currency: parsed.data.currency,
      condition: parsed.data.condition,
      city: parsed.data.city ?? null,
      is_negotiable: parsed.data.is_negotiable,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !created) {
    console.error('[createProduct]', error);
    return { ok: false, error: error?.message ?? 'create_failed' };
  }

  if (parsed.data.images.length > 0) {
    const rows = parsed.data.images.map((img, i) => ({
      product_id: created.id,
      url: img.url,
      sort_order: i,
    }));
    const { error: imgErr } = await db(supabase)
      .from('product_images')
      .insert(rows);
    if (imgErr) console.error('[createProductImages]', imgErr);
  }

  for (const locale of ['/ar', '/fr', '/en']) {
    revalidatePath(`${locale}/`);
  }
  redirect(`/ar/product/${created.id}`);
}
