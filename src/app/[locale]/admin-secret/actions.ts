'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

export async function getUsers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, city, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  return data ?? [];
}

// ── Stores ────────────────────────────────────────────────────────────

export async function getStores() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stores')
    .select('id, name, owner_id, city, is_verified, products_count, followers_count, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  return data ?? [];
}

// ── Products ──────────────────────────────────────────────────────────

export async function getAllProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, title, price, currency, status, city, seller_id, created_at, product_images(url, sort_order)')
    .order('created_at', { ascending: false })
    .limit(200);
  return data ?? [];
}

// ── Pending Products ──────────────────────────────────────────────────

export async function getPendingProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, title, price, currency, city, description, seller_id, created_at, product_images(url, sort_order)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return data ?? [];
}

// ── Approve / Reject ──────────────────────────────────────────────────

export async function approveProduct(productId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update({ status: 'active' } as any)
    .eq('id', productId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/admin-secret');
  revalidatePath('/ar/admin-secret/pending');
  revalidatePath('/ar/admin-secret/products');
  return { ok: true };
}

export async function rejectProduct(productId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update({ status: 'hidden' } as any)
    .eq('id', productId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/admin-secret');
  revalidatePath('/ar/admin-secret/pending');
  revalidatePath('/ar/admin-secret/products');
  return { ok: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .delete()
    .eq('id', productId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/admin-secret');
  revalidatePath('/ar/admin-secret/pending');
  revalidatePath('/ar/admin-secret/products');
  return { ok: true };
}

// ── Make Admin ────────────────────────────────────────────────────────

export async function makeAdmin(userId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .update({ role: 'admin' } as any)
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/ar/admin-secret/users');
  return { ok: true };
}
