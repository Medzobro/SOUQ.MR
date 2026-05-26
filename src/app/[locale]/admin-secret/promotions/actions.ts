'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ── Get promotion requests ────────────────────────────────────────────

export async function getPromotionRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, title, price, currency, city, seller_id, created_at, promotion_requested_at, product_images(url, sort_order)')
    .eq('promotion_requested', true)
    .eq('is_promoted', false)
    .order('promotion_requested_at', { ascending: true });
  return data ?? [];
}

// ── Get promoted products ─────────────────────────────────────────────

export async function getPromotedProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, title, price, currency, city, seller_id, promoted_until, product_images(url, sort_order)')
    .eq('is_promoted', true)
    .order('promoted_until', { ascending: true });
  return data ?? [];
}

// ── Approve promotion (7 days default) ────────────────────────────────

export async function approvePromotion(productId: string, days: number = 7) {
  const supabase = await createClient();
  const until = new Date();
  until.setDate(until.getDate() + days);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update({
      is_promoted: true,
      promotion_requested: false,
      promoted_until: until.toISOString(),
    } as any)
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/admin-secret/promotions');
  revalidatePath('/ar');
  return { ok: true };
}

// ── Revoke promotion ──────────────────────────────────────────────────

export async function revokePromotion(productId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update({
      is_promoted: false,
      promoted_until: null,
      promotion_requested: false,
    } as any)
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/admin-secret/promotions');
  revalidatePath('/ar');
  return { ok: true };
}

// ── Reject promotion request ──────────────────────────────────────────

export async function rejectPromotionRequest(productId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update({ promotion_requested: false } as any)
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/admin-secret/promotions');
  return { ok: true };
}
