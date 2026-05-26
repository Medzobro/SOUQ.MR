'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { moderateText } from '@/lib/moderation';

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
  const { data: product } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!product || (product as any).seller_id !== user.id) {
    return { ok: false, error: 'غير مصرح بحذف هذا المنتج' };
  }

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/ar/profile');
  return { ok: true };
}

// ── Mark as sold ──────────────────────────────────────────────────────

export async function markAsSold(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'غير مصرح' };

  const { data: product } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!product || (product as any).seller_id !== user.id) {
    return { ok: false, error: 'غير مصرح' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update({ status: 'sold', is_promoted: false } as any)
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/profile');
  return { ok: true };
}

// ── Request promotion ─────────────────────────────────────────────────

export async function requestPromotion(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'غير مصرح' };

  const { data: product } = await supabase
    .from('products')
    .select('seller_id, status, promotion_requested, is_promoted')
    .eq('id', productId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any;
  if (!p || p.seller_id !== user.id) return { ok: false, error: 'غير مصرح' };
  if (p.status !== 'active') return { ok: false, error: 'يمكن ترويج المنتجات النشطة فقط' };
  if (p.promotion_requested || p.is_promoted) return { ok: false, error: 'تم طلب الترويج مسبقاً' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update({ promotion_requested: true, promotion_requested_at: new Date().toISOString() } as any)
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/profile');
  return { ok: true };
}

// ── Content moderation for sell form ──────────────────────────────────

export async function checkContent(title: string, description?: string) {
  return moderateText(title, description);
}
