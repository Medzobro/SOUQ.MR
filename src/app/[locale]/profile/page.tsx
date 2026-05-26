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
      .select('id, name, slug, avatar_url, products_count, followers_count, rating')
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
  const store = cast<Pick<Store, 'id' | 'name' | 'slug' | 'avatar_url' | 'products_count' | 'followers_count' | 'rating'> | null>(storeRes.data);
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
      {/* ═══════════════════════════════════════════════════════════
          🧑 SECTION 1 — ACCOUNT
          ═══════════════════════════════════════════════════════════ */}
      <div style={{
        margin: '0 20px 16px',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: 20,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 14,
        }}>
          👤 {t('title')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="store-avatar" style={{ width: 60, height: 60, borderRadius: 18, flexShrink: 0 }}>
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" fill sizes="60px" />
            ) : (
              <span style={{ fontSize: 28 }}>👤</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name ?? userEmail}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }} dir="ltr">
              {userEmail}
            </div>
          </div>
        </div>

        {/* Stats row inside account card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{totalProducts}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{t('myListings')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{favorites.length}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{t('favorites')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{profile?.role === 'seller' ? '🏪' : '🛒'}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{profile?.role === 'seller' ? t('myStore') : '—'}</div>
          </div>
        </div>

        {/* Logout */}
        <form action={signOutAction} style={{ marginTop: 14 }}>
          <button
            type="submit"
            style={{
              width: '100%',
              fontSize: 12,
              padding: '8px',
              borderRadius: 10,
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

      {/* ═══════════════════════════════════════════════════════════
          🏪 SECTION 2 — STORE
          ═══════════════════════════════════════════════════════════ */}
      <div style={{
        margin: '0 20px 16px',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: 20,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 14,
        }}>
          🏪 {t('myStore')}
        </div>

        {store ? (
          <>
            <Link href={`/store/${store.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div className="store-avatar" style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0 }}>
                {store.avatar_url ? (
                  <Image src={store.avatar_url} alt="" fill sizes="52px" />
                ) : (
                  <span style={{ fontSize: 24 }}>🏪</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>{store.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {store.products_count ?? 0} {t('myListings')} · {store.followers_count ?? 0} متابع · ⭐ {Number(store.rating || 0).toFixed(1)}
                </div>
              </div>
            </Link>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                href="/sell"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'var(--color-accent)',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '10px',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                ➕ {tNav('addListing')}
              </Link>
              <Link
                href="/profile/store"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  background: 'var(--color-bg-card-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                ✏️
              </Link>
              <Link
                href={`/store/${store.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-bg-card-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 18,
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                }}
              >
                👁
              </Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏪</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t('becomeSeller')}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
              {t('createStoreSubtitle')}
            </div>
            <Link
              href="/profile/store"
              style={{
                display: 'inline-block',
                background: 'var(--color-accent)',
                color: '#fff',
                borderRadius: 10,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {t('createStore')}
            </Link>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          📦 SECTION 3 — MY LISTINGS
          ═══════════════════════════════════════════════════════════ */}
      {myListings.length > 0 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <div className="section-title">📦 {t('myListings')} ({totalProducts})</div>
            {isSeller && (
              <Link
                href="/sell"
                style={{
                  background: 'var(--color-accent)',
                  color: '#000',
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 11,
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
      )}

      {/* ═══════════════════════════════════════════════════════════
          ❤️ SECTION 4 — FAVORITES
          ═══════════════════════════════════════════════════════════ */}
      {favorites.length > 0 && (
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
      )}

      {/* ═══════════════════════════════════════════════════════════
          ⚙️ SECTION 5 — PRODUCT MANAGEMENT
          ═══════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 20px' }}>
        <MyProducts />
      </div>
    </div>
  );
}
