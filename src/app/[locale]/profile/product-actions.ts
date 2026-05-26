'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { moderateText } from '@/lib/moderation';

function db(supabase: Awaited<ReturnType<typeof createClient>>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabase as any;
}

const ALL_LOCALES = ['/ar', '/fr', '/en'];

function revalidateAll(...paths: string[]) {
  for (const locale of ALL_LOCALES) {
    for (const p of paths) {
      revalidatePath(`${locale}${p}`);
    }
  }
}

// ── Get user's products ───────────────────────────────────────────────

export async function getMyProducts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('products')
    .select('id, title, price, currency, status, city, created_at, is_promoted, promotion_requested, product_images(url, sort_order)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  return data ?? [];
}

// ── Delete product ────────────────────────────────────────────────────

export async function deleteMyProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'غير مصرح' };

  // Verify ownership
  const { data } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  const product = data as { seller_id: string } | null;

  if (!product || product.seller_id !== user.id) {
    return { ok: false, error: 'غير مصرح بحذف هذا المنتج' };
  }

  const { error } = await db(supabase).from('products').delete().eq('id', productId);
  if (error) return { ok: false, error: error.message };

  revalidateAll('/profile');
  return { ok: true };
}

// ── Mark as sold ──────────────────────────────────────────────────────

export async function markAsSold(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'غير مصرح' };

  const { data } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  const product = data as { seller_id: string } | null;

  if (!product || product.seller_id !== user.id) {
    return { ok: false, error: 'غير مصرح' };
  }

  const { error } = await db(supabase)
    .from('products')
    .update({ status: 'sold', is_promoted: false })
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidateAll('/profile');
  return { ok: true };
}

// ── Request promotion ─────────────────────────────────────────────────

export async function requestPromotion(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'غير مصرح' };

  const { data } = await supabase
    .from('products')
    .select('seller_id, status, promotion_requested, is_promoted')
    .eq('id', productId)
    .single();

  const product = data as { seller_id: string; status: string; promotion_requested: boolean; is_promoted: boolean } | null;

  if (!product || product.seller_id !== user.id) return { ok: false, error: 'غير مصرح' };
  if (product.status !== 'active') return { ok: false, error: 'يمكن ترويج المنتجات النشطة فقط' };
  if (product.promotion_requested || product.is_promoted) return { ok: false, error: 'تم طلب الترويج مسبقاً' };

  const { error } = await db(supabase)
    .from('products')
    .update({ promotion_requested: true, promotion_requested_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidateAll('/profile');
  return { ok: true };
}

// ── Content moderation for sell form ──────────────────────────────────

export async function checkContent(title: string, description?: string) {
  return moderateText(title, description);
}
