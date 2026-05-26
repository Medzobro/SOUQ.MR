import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import { firstImageUrl } from '@/lib/queries';
import ProductCard from '@/components/products/ProductCard';
import SearchBar from '@/components/search/SearchBar';
import SearchLoadMore from '@/components/search/SearchLoadMore';
import { categoryName } from '@/lib/categories';
import type { Product, ProductImage } from '@/lib/supabase/database.types';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ q?: string; category?: string; cursor?: string }>;
}

type ProductWithImages = Pick<
  Product,
  'id' | 'title' | 'price' | 'currency' | 'city' | 'badge' | 'status' | 'created_at' | 'category_id'
> & {
  product_images: Pick<ProductImage, 'url' | 'sort_order'>[];
};

type CategoryRow = {
  id: string;
  name_ar: string;
  name_fr: string | null;
  name_en: string | null;
  icon: string | null;
};

const PAGE_SIZE = 20;

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const { q, category: categorySlug, cursor } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const supabase = await createClient();

  let categoryId: string | null = null;
  let categoryRow: CategoryRow | null = null;
  if (categorySlug) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name_ar, name_fr, name_en, icon')
      .eq('slug', categorySlug)
      .maybeSingle();
    const cat = cast<CategoryRow | null>(catData);
    if (cat) {
      categoryId = cat.id;
      categoryRow = cat;
    }
  }

  let query = supabase
    .from('products')
    .select(
      'id, title, price, currency, city, badge, status, created_at, category_id, product_images(url, sort_order)',
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE + 1); // +1 to detect hasMore

  if (categoryId) query = query.eq('category_id', categoryId);
  if (q && q.trim().length > 0) {
    query = query.ilike('title', `%${q.trim()}%`);
  }
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data } = await query;
  const raw = cast<ProductWithImages[]>(data ?? []);
  const hasMore = raw.length > PAGE_SIZE;
  const list = hasMore ? raw.slice(0, PAGE_SIZE) : raw;
  const nextCursor = hasMore ? (list[list.length - 1]?.created_at ?? null) : null;

  // Build cursor search params for the load-more link
  const nextSearchParams = new URLSearchParams();
  if (q?.trim()) nextSearchParams.set('q', q.trim());
  if (categorySlug) nextSearchParams.set('category', categorySlug);
  if (nextCursor) nextSearchParams.set('cursor', nextCursor);

  return (
    <div style={{ paddingBottom: 80, paddingTop: 70 }}>
      <SearchBar />

      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div className="section-title">
            {categoryRow
              ? `${categoryRow.icon ?? ''} ${categoryName(categoryRow, locale)}`
              : q
                ? `"${q}"`
                : t('latestListings')}
            <span style={{ marginInlineStart: 8, color: 'var(--color-text-muted)', fontSize: 14 }}>
              {list.length}
            </span>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔎</div>
            <p>{t('noProducts')}</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {list.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    currency: p.currency,
                    city: p.city,
                    badge: p.badge,
                    imageUrl: firstImageUrl(p),
                  }}
                  locale={locale}
                  contactLabel={t('contact')}
                />
              ))}
            </div>
            {nextCursor && (
              <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
                <SearchLoadMore
                  searchParams={nextSearchParams.toString()}
                  label={locale === 'ar' ? 'تحميل المزيد' : locale === 'fr' ? 'Charger plus' : 'Load more'}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
