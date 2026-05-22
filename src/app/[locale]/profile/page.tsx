import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect, Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import { firstImageUrl } from '@/lib/queries';
import ProductCard from '@/components/products/ProductCard';
import { signOutAction } from './actions';
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: '/auth', locale });

  const userId = user!.id;
  const userEmail = user!.email ?? '';

  const [profileRes, storeRes, listingsRes, favoritesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('stores')
      .select('id, name, slug, avatar_url')
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
  ]);

  const profile = cast<Profile | null>(profileRes.data);
  const store = cast<Pick<Store, 'id' | 'name' | 'slug' | 'avatar_url'> | null>(storeRes.data);
  const myListings = cast<ProductWithImages[]>(listingsRes.data ?? []);
  const favoritesRows = cast<Array<{ product: ProductWithImages | null }>>(
    favoritesRes.data ?? [],
  );
  const favorites = favoritesRows
    .map((r) => r.product)
    .filter((p): p is ProductWithImages => Boolean(p));

  const isSeller = profile?.role === 'seller';

  return (
    <div style={{ paddingTop: 80, paddingBottom: 100 }}>
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="store-avatar" style={{ width: 70, height: 70, borderRadius: 18 }}>
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" />
            ) : (
              '👤'
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{profile?.full_name ?? '—'}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }} dir="ltr">
              {userEmail || profile?.phone || ''}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-accent)', marginTop: 4 }}>
              {isSeller ? '🏪 ' + t('myStore') : '🛒'}
            </div>
          </div>
        </div>
      </div>

      {/* Store CTA / link */}
      <div style={{ padding: '0 20px 24px' }}>
        {store ? (
          <Link href={`/store/${store.id}`} className="seller-mini" style={{ marginBottom: 0 }}>
            <div className="seller-mini-avatar">
              {store.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.avatar_url} alt="" />
              ) : (
                '🏪'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="seller-mini-name">{store.name}</div>
              <div className="seller-mini-sub">{t('myStore')}</div>
            </div>
            <Link
              href="/profile/store"
              className="btn-nav"
              style={{ fontSize: 11, padding: '6px 12px' }}
            >
              ✏️
            </Link>
          </Link>
        ) : (
          <div className="seller-mini" style={{ marginBottom: 0 }}>
            <div className="seller-mini-avatar">🏪</div>
            <div style={{ flex: 1 }}>
              <div className="seller-mini-name">{t('becomeSeller')}</div>
              <div className="seller-mini-sub">{t('createStoreSubtitle')}</div>
            </div>
            <Link
              href="/profile/store"
              className="btn-primary"
              style={{ fontSize: 12, padding: '8px 16px' }}
            >
              {t('createStore')}
            </Link>
          </div>
        )}
      </div>

      {myListings.length > 0 ? (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <div className="section-title">{t('myListings')}</div>
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

      {favorites.length > 0 ? (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <div className="section-title">{t('favorites')}</div>
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

      <div style={{ padding: '0 20px' }}>
        <form action={signOutAction}>
          <button
            type="submit"
            className="btn-outline"
            style={{ width: '100%', fontSize: 14, padding: '12px' }}
          >
            {t('logout')}
          </button>
        </form>
      </div>
    </div>
  );
}
