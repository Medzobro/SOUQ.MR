import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import {
  fetchCategories,
  fetchCategoryCounts,
  fetchLatestProducts,
  fetchMarketplaceStats,
  fetchUserFavoriteIds,
  firstImageUrl,
} from '@/lib/queries';
import CategoriesGrid from '@/components/categories/CategoriesGrid';
import ProductCard from '@/components/products/ProductCard';
import SearchBar from '@/components/search/SearchBar';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const supabase = await createClient();

  const [{ data: { user } }, categories, products, stats, counts] = await Promise.all([
    supabase.auth.getUser(),
    fetchCategories(supabase),
    fetchLatestProducts(supabase, 12),
    fetchMarketplaceStats(supabase),
    fetchCategoryCounts(supabase),
  ]);

  const favorites = await fetchUserFavoriteIds(supabase, user?.id ?? null);

  const categoriesWithCounts = categories.map((c) => ({
    ...c,
    products_count: counts[c.slug] ?? 0,
  }));

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {t('heroBadge')}
          </div>
          <div className="hero-title">
            <span>{t('heroTitleLine1')}</span>
            <span className="accent">{t('heroTitleLine2')}</span>
            <span
              style={{
                fontSize: '0.5em',
                fontFamily: 'var(--font-cairo), Cairo, sans-serif',
                fontWeight: 300,
                color: 'var(--color-text-muted)',
              }}
            >
              MARKETPLACE
            </span>
          </div>
          <p className="hero-sub">{t('heroSubtitle')}</p>
          <div className="hero-ctas">
            <Link
              href="/search"
              className="btn-primary"
              style={{ fontSize: 15, padding: '13px 30px' }}
            >
              {t('heroBrowse')}
            </Link>
            <Link href="/sell" className="btn-outline">
              {t('heroAddListing')}
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-num">{stats.activeProducts}+</div>
            <div className="stat-label">{t('statActiveListings')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{stats.sellers}</div>
            <div className="stat-label">{t('statTrustedSellers')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">98%</div>
            <div className="stat-label">{t('statSatisfaction')}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Categories */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">
            {t('browseCategories')} <span>{t('categories')}</span>
          </div>
          <Link href="/categories" className="see-all">
            {t('listings')} ←
          </Link>
        </div>
        <CategoriesGrid categories={categoriesWithCounts} locale={locale} countLabel={t('listingsCount')} />
      </div>

      {/* Latest products */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div className="section-title">
            {t('latestListings')} <span>{t('listings')}</span>
          </div>
          <Link href="/search" className="see-all">
            {t('listings')} ←
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <p>{t('noProducts')}</p>
            <p style={{ marginTop: 8 }}>{t('beFirst')}</p>
            <Link
              href="/sell"
              className="btn-primary"
              style={{ display: 'inline-block', marginTop: 16 }}
            >
              {t('heroAddListing')}
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
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
                isFavorite={favorites.has(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
