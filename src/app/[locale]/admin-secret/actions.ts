'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { checkAdmin } from '@/lib/supabase/admin-auth';
import type { Database } from '@/lib/supabase/database.types';

// ── Revalidation helper (all locales) ─────────────────────────────────

const ALL_LOCALES = ['/ar', '/fr', '/en'];

function revalidateAdmin(...paths: string[]) {
  for (const locale of ALL_LOCALES) {
    for (const p of paths) {
      revalidatePath(`${locale}${p}`);
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 50;

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type StoreRow = Database['public']['Tables']['stores']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];

type PaginatedResult<T> = { data: T[]; nextCursor: string | null };

function paginate<T extends { created_at: string }>(items: T[], limit: number): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? (result[result.length - 1]?.created_at ?? null) : null;
  return { data: result, nextCursor };
}

function safeRows<T>(data: unknown): T[] {
  return (data as T[]) ?? [];
}

/** Helper that works around Supabase type chain issues with update/delete */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: Awaited<ReturnType<typeof createClient>>): any {
  return supabase;
}

// ── Dashboard stats ──────────────────────────────────────────────────

export async function getAdminStats() {
  const supabase = await createClient();

  const [users, stores, products, pending] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    users: users.count ?? 0,
    stores: stores.count ?? 0,
    products: products.count ?? 0,
    pending: pending.count ?? 0,
  };
}

// ── Users ─────────────────────────────────────────────────────────────

export async function getUsers(params?: { cursor?: string; limit?: number }): Promise<PaginatedResult<ProfileRow>> {
  const supabase = await createClient();
  const limit = params?.limit ?? DEFAULT_LIMIT;
  let query = supabase
    .from('profiles')
    .select('id, full_name, phone, role, city, created_at')
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (params?.cursor) {
    query = query.lt('created_at', params.cursor);
  }

  const { data } = await query;
  return paginate(safeRows<ProfileRow>(data), limit);
}

// ── Stores ────────────────────────────────────────────────────────────

export async function getStores(params?: { cursor?: string; limit?: number }): Promise<PaginatedResult<StoreRow>> {
  const supabase = await createClient();
  const limit = params?.limit ?? DEFAULT_LIMIT;
  let query = supabase
    .from('stores')
    .select('id, name, owner_id, city, is_verified, products_count, followers_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (params?.cursor) {
    query = query.lt('created_at', params.cursor);
  }

  const { data } = await query;
  return paginate(safeRows<StoreRow>(data), limit);
}

// ── Products ──────────────────────────────────────────────────────────

export async function getAllProducts(params?: { cursor?: string; limit?: number }): Promise<PaginatedResult<ProductRow>> {
  const supabase = await createClient();
  const limit = params?.limit ?? DEFAULT_LIMIT;
  let query = supabase
    .from('products')
    .select('id, title, price, currency, status, city, seller_id, created_at, product_images(url, sort_order)')
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (params?.cursor) {
    query = query.lt('created_at', params.cursor);
  }

  const { data } = await query;
  return paginate(safeRows<ProductRow>(data), limit);
}

// ── Pending Products ──────────────────────────────────────────────────

export async function getPendingProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, title, price, currency, city, description, seller_id, created_at, product_images(url, sort_order)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return (data ?? []) as ProductRow[];
}

// ── Approve / Reject / Delete (ADMIN ONLY) ────────────────────────────

export async function approveProduct(productId: string) {
  const auth = await checkAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { error } = await db(supabase)
    .from('products')
    .update({ status: 'active' })
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidateAdmin('/admin-secret', '/admin-secret/pending', '/admin-secret/products');
  return { ok: true };
}

export async function rejectProduct(productId: string) {
  const auth = await checkAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { error } = await db(supabase)
    .from('products')
    .update({ status: 'hidden' })
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidateAdmin('/admin-secret', '/admin-secret/pending', '/admin-secret/products');
  return { ok: true };
}

export async function deleteProduct(productId: string) {
  const auth = await checkAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { error } = await db(supabase)
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) return { ok: false, error: error.message };
  revalidateAdmin('/admin-secret', '/admin-secret/pending', '/admin-secret/products');
  return { ok: true };
}

// ── Make Admin (ADMIN ONLY) ──────────────────────────────────────────

export async function makeAdmin(userId: string) {
  const auth = await checkAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { error } = await db(supabase)
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (error) return { ok: false, error: error.message };
  revalidateAdmin('/admin-secret/users');
  return { ok: true };
}
