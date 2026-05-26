'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { checkAdmin } from '@/lib/supabase/admin-auth';

// ── Revalidation helper (all locales) ─────────────────────────────────

const ALL_LOCALES = ['/ar', '/fr', '/en'];

function revalidateAdmin(...paths: string[]) {
  for (const locale of ALL_LOCALES) {
    for (const p of paths) {
      revalidatePath(`${locale}${p}`);
    }
  }
}

/** Helper that works around Supabase type chain issues with update/delete */
function db(supabase: Awaited<ReturnType<typeof createClient>>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabase as any;
}

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

// ── Approve promotion (7 days default) — ADMIN ONLY ──────────────────

export async function approvePromotion(productId: string, days: number = 7) {
  const auth = await checkAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const until = new Date();
  until.setDate(until.getDate() + days);

  const { error } = await db(supabase)
    .from('products')
    .update({
      is_promoted: true,
      promotion_requested: false,
      promoted_until: until.toISOString(),
    })
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidateAdmin('/admin-secret/promotions');
  return { ok: true };
}

// ── Revoke promotion — ADMIN ONLY ────────────────────────────────────

export async function revokePromotion(productId: string) {
  const auth = await checkAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { error } = await db(supabase)
    .from('products')
    .update({
      is_promoted: false,
      promoted_until: null,
      promotion_requested: false,
    })
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidateAdmin('/admin-secret/promotions');
  return { ok: true };
}

// ── Reject promotion request — ADMIN ONLY ────────────────────────────

export async function rejectPromotionRequest(productId: string) {
  const auth = await checkAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { error } = await db(supabase)
    .from('products')
    .update({ promotion_requested: false })
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidateAdmin('/admin-secret/promotions');
  return { ok: true };
}
