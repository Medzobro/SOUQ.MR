import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const LOCALES = ['ar', 'fr', 'en'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const locale of LOCALES) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    });
    entries.push({
      url: `${BASE_URL}/${locale}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
    entries.push({
      url: `${BASE_URL}/${locale}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });
    entries.push({
      url: `${BASE_URL}/${locale}/sell`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // Products
  const { data: products } = await supabase
    .from('products')
    .select('id, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5000);

  for (const p of products ?? []) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/product/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      });
    }
  }

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at')
    .limit(100);

  for (const c of categories ?? []) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/search?category=${c.slug}`,
        lastModified: c.created_at ? new Date(c.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    }
  }

  // Stores
  const { data: stores } = await supabase
    .from('stores')
    .select('id, created_at')
    .limit(5000);

  for (const s of stores ?? []) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/store/${s.id}`,
        lastModified: s.created_at ? new Date(s.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.85,
      });
    }
  }

  return entries;
}
