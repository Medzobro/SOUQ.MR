'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: Awaited<ReturnType<typeof createClient>>): any {
  return supabase;
}

const storeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(2000).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  opening_hours: z.string().trim().max(120).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  cover_url: z.string().url().optional().nullable(),
});

export type StoreFormState = {
  ok: boolean;
  error?: string;
};

export async function upsertStoreAction(
  _prev: StoreFormState | null,
  formData: FormData,
): Promise<StoreFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  // Parse nullable URL fields safely
  const parseUrl = (key: string) => {
    const raw = formData.get(key);
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  };

  const parsed = storeSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || null,
    city: formData.get('city') || null,
    phone: formData.get('phone') || null,
    whatsapp: formData.get('whatsapp') || null,
    opening_hours: formData.get('opening_hours') || null,
    avatar_url: parseUrl('avatar_url'),
    cover_url: parseUrl('cover_url'),
  });

  if (!parsed.success) {
    return { ok: false, error: 'validation' };
  }

  // Promote profile to seller if needed
  await db(supabase).from('profiles').update({ role: 'seller' }).eq('id', user.id);

  const { data: existingData } = await supabase
    .from('stores')
    .select('id, slug')
    .eq('owner_id', user.id)
    .maybeSingle();
  const existing = existingData as { id: string; slug: string } | null;

  if (existing) {
    const { error } = await db(supabase)
      .from('stores')
      .update({
        name: parsed.data.name,
        description: parsed.data.description,
        city: parsed.data.city,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp,
        opening_hours: parsed.data.opening_hours,
        avatar_url: parsed.data.avatar_url,
        cover_url: parsed.data.cover_url,
      })
      .eq('id', existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const slugBase = slugify(parsed.data.name) || `store-${user.id.slice(0, 8)}`;
    const { error } = await db(supabase).from('stores').insert({
      owner_id: user.id,
      name: parsed.data.name,
      slug: `${slugBase}-${user.id.slice(0, 6)}`,
      description: parsed.data.description,
      city: parsed.data.city,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      opening_hours: parsed.data.opening_hours,
      avatar_url: parsed.data.avatar_url,
      cover_url: parsed.data.cover_url,
    });
    if (error) return { ok: false, error: error.message };
  }

  for (const locale of ['/ar', '/fr', '/en']) {
    revalidatePath(`${locale}/profile`);
  }
  redirect('/profile');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
