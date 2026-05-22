import type { Category } from '@/lib/supabase/database.types';
import type { AppSupabaseClient } from '@/lib/supabase/client';
import { cast } from '@/lib/supabase/helpers';

export type Supa = AppSupabaseClient;

/** Reusable shape: a product with its first image and category info. */
export type ProductListRow = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string | null;
  badge: string | null;
  status: string;
  created_at: string;
  category_id: string | null;
  product_images: Array<{ url: string; sort_order: number }>;
};

/** Latest active products for the home page. */
export async function fetchLatestProducts(supabase: Supa, limit = 12): Promise<ProductListRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      `id, title, price, currency, city, badge, status, created_at, category_id,
       product_images(url, sort_order)`,
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[fetchLatestProducts]', error);
    return [];
  }
  return cast<ProductListRow[]>(data ?? []);
}

/** All categories ordered for nav grids. */
export async function fetchCategories(supabase: Supa): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[fetchCategories]', error);
    return [];
  }
  return cast<Category[]>(data ?? []);
}

/** Counts of active products per category, returned as a slug -> count map. */
export async function fetchCategoryCounts(supabase: Supa): Promise<Record<string, number>> {
  // Cheap aggregation — for production, materialize via a view.
  const { data, error } = await supabase
    .from('products')
    .select('category_id')
    .eq('status', 'active');

  if (error || !data) return {};

  const byId: Record<string, number> = {};
  for (const row of cast<{ category_id: string | null }[]>(data)) {
    if (!row.category_id) continue;
    byId[row.category_id] = (byId[row.category_id] ?? 0) + 1;
  }

  // Map category_id -> slug
  const cats = await supabase.from('categories').select('id, slug');
  const catRows = cast<{ id: string; slug: string }[]>(cats.data ?? []);
  const out: Record<string, number> = {};
  for (const c of catRows) out[c.slug] = byId[c.id] ?? 0;
  return out;
}

/** First image URL for a product, falling back to null. */
export function firstImageUrl(row: { product_images: Array<{ url: string; sort_order: number }> }): string | null {
  if (!row.product_images || row.product_images.length === 0) return null;
  const sorted = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0]?.url ?? null;
}

/** Marketplace-wide stats for the hero. Cheap but uncached for now. */
export async function fetchMarketplaceStats(supabase: Supa) {
  const [products, stores] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
  ]);

  return {
    activeProducts: products.count ?? 0,
    sellers: stores.count ?? 0,
  };
}

/** IDs of products favourited by the current user (or [] when signed out). */
export async function fetchUserFavoriteIds(supabase: Supa, userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);
  if (error || !data) return new Set();
  return new Set(cast<{ product_id: string }[]>(data).map((r) => r.product_id));
}
