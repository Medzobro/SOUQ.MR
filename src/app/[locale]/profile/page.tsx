import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { redirect, Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import { firstImageUrl } from '@/lib/queries';
import ProductCard from '@/components/products/ProductCard';
import { signOutAction } from './actions';
import { MyProducts } from './MyProducts';
import type { Profile, Product, ProductImage, Store } from '@/lib/supabase/database.types';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

type ProductWithImages = Pick<
  Product,
  'id' | 'title' | 'price' | 'currency' | 'city' | 'badge' | 'status' | 'created_at' | 'category_id'
> & {
  product_images: Pick<ProductImage, 'url' | 'sort_order'>[];
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('profile');
  const tHome = await getTranslations('home');
  const tNav = await getTranslations('nav');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: '/auth', locale });

  const userId = user!.id;
  const userEmail = user!.email ?? '';

  const [profileRes, storeRes, listingsRes, favoritesRes, productsCount] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('stores')
      .select('id, name, slug, avatar_url, products_count, followers_count')
      .eq('owner_id', userId)
      .maybeSingle(),
    supabase
      .from('products')
      .select(
        'id, title, price, currency, city, badge, status, created_at, category_id, product_images(url, sort_order)',
      )
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('favorites')
      .select(
        'product:products(id, title, price, currency, city, badge, status, created_at, category_id, product_images(url, sort_order))',
      )
      .eq('user_id', userId)
      .limit(12),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', userId),
  ]);

  const profile = cast<Profile | null>(profileRes.data);
  const store = cast<Pick<Store, 'id' | 'name' | 'slug' | 'avatar_url' | 'products_count' | 'followers_count'> | null>(storeRes.data);
  const myListings = cast<ProductWithImages[]>(listingsRes.data ?? []);
  const favoritesRows = cast<Array<{ product: ProductWithImages | null }>>(
    favoritesRes.data ?? [],
  );
  const favorites = favoritesRows
    .map((r) => r.product)
    .filter((p): p is ProductWithImages => Boolean(p));

  const isSeller = profile?.role === 'seller';
  const totalProducts = productsCount.count ?? 0;

  return (
    <div style={{ paddingTop: 80, paddingBottom: 100 }}>
      {/* ── Profile Header ──────────────────────────────────────── */}
      <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
        <div className="store-avatar" style={{ width: 80, height: 80, borderRadius: 24, marginInline: 'auto' }}>
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill sizes="80px" />
          ) : (
            <span style={{ fontSize: 36 }}>👤</span>
          )}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, marginTop: 12 }}>{profile?.full_name ?? userEmail}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }} dir="ltr">
          {userEmail}
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────── */}
      <div style={{
        padding: '0 20px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
      }}>
        <div className="stat-card">
          <div className="stat-num">{totalProducts}</div>
          <div className="stat-label">{t('myListings')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{favorites.length}</div>
          <div className="stat-label">{t('favorites')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{isSeller ? '🏪' : '🛒'}</div>
          <div className="stat-label">{isSeller ? t('myStore') : t('becomeSeller')}</div>
        </div>
      </div>

      {/* ── Store Card or Create Store CTA ──────────────────────── */}
      <div style={{ padding: '0 20px 20px' }}>
        {store ? (
          <div style={{
            background: 'var(--color-bg-card-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <Link href={`/store/${store.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                <div className="store-avatar" style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0 }}>
                  {store.avatar_url ? (
                    <Image src={store.avatar_url} alt="" fill sizes="52px" />
                  ) : (
                    <span style={{ fontSize: 24 }}>🏪</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)' }}>{store.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {store.products_count ?? 0} {t('myListings')} · {store.followers_count ?? 0} متابع
                  </div>
                </div>
              </Link>
              <Link
                href="/profile/store"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                ✏️ تعديل
              </Link>
            </div>
            <Link
              href="/sell"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'var(--color-accent)',
                color: '#fff',
                borderRadius: 12,
                padding: '12px',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              ➕ {tNav('addListing')}
            </Link>
          </div>
        ) : (
          <div style={{
            background: 'var(--color-bg-card-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏪</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t('becomeSeller')}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              {t('createStoreSubtitle')}
            </div>
            <Link
              href="/profile/store"
              style={{
                display: 'inline-block',
                background: 'var(--color-accent)',
                color: '#fff',
                borderRadius: 12,
                padding: '12px 28px',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {t('createStore')}
            </Link>
          </div>
        )}
      </div>

      {/* ── Quick Add Listing ────────────────────────────────────── */}
      {isSeller && totalProducts === 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <Link
            href="/sell"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-gold))',
              color: '#000',
              borderRadius: 14,
              padding: '16px',
              fontSize: 15,
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            ➕ {tNav('addListing')}
          </Link>
        </div>
      )}

      {/* ── My Listings ─────────────────────────────────────────── */}
      {myListings.length > 0 ? (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <div className="section-title">📦 {t('myListings')} ({totalProducts})</div>
            {isSeller && (
              <Link
                href="/sell"
                style={{
                  background: 'var(--color-accent)',
                  color: '#000',
                  borderRadius: 10,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                ➕ {tNav('addListing')}
              </Link>
            )}
          </div>
          <div className="products-grid">
            {myListings.map((p) => (
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
                contactLabel={tHome('contact')}
                showFavorite={false}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Favorites ───────────────────────────────────────────── */}
      {favorites.length > 0 ? (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <div className="section-title">❤️ {t('favorites')} ({favorites.length})</div>
          </div>
          <div className="products-grid">
            {favorites.map((p) => (
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
                contactLabel={tHome('contact')}
                isFavorite
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Product Management (mark sold / promote / delete) ────── */}
      <div style={{ padding: '0 20px' }}>
        <MyProducts />
      </div>

      {/* ── Logout ──────────────────────────────────────────────── */}
      <div style={{ padding: '24px 20px 0' }}>
        <form action={signOutAction}>
          <button
            type="submit"
            style={{
              width: '100%',
              fontSize: 14,
              padding: '12px',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            🚪 {t('logout')}
          </button>
        </form>
      </div>
    </div>
  );
}
