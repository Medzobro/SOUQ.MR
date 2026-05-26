import { notFound } from 'next/navigation';
import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import { firstImageUrl } from '@/lib/queries';
import { formatRelative } from '@/lib/format';
import ProductCard from '@/components/products/ProductCard';
import FollowButton from '@/components/store/FollowButton';
import MessageStoreButton from '@/components/store/MessageStoreButton';
import StoreTabs from '@/components/store/StoreTabs';
import type { Store, Product, ProductImage } from '@/lib/supabase/database.types';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

type ProductWithImages = Pick<
  Product,
  'id' | 'title' | 'price' | 'currency' | 'city' | 'badge' | 'status' | 'created_at' | 'category_id'
> & {
  product_images: Pick<ProductImage, 'url' | 'sort_order'>[];
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

export default async function StorePage({
  params,
}: {
  params: Promise<{ locale: AppLocale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('store');
  const tHome = await getTranslations('home');
  const supabase = await createClient();

  // Lookup by id first, fallback to slug
  const byId = await supabase.from('stores').select('*').eq('id', id).maybeSingle();
  let store: Store | null = cast<Store | null>(byId.data);
  if (!store) {
    const bySlug = await supabase.from('stores').select('*').eq('slug', id).maybeSingle();
    store = cast<Store | null>(bySlug.data);
  }
  if (!store) notFound();

  const storeId = store.id;
  const ownerId = store.owner_id;

  const userResp = await supabase.auth.getUser();
  const user = userResp.data.user;

  const [productsRes, reviewsRes, followingRes] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, title, price, currency, city, badge, status, created_at, category_id, product_images(url, sort_order)',
      )
      .eq('store_id', storeId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(24),
    supabase
      .from('reviews')
      .select(
        'id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)',
      )
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(20),
    user
      ? supabase
          .from('followers')
          .select('store_id')
          .eq('follower_id', user.id)
          .eq('store_id', storeId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const products = cast<ProductWithImages[]>(productsRes.data ?? []);
  const reviews = cast<ReviewRow[]>(reviewsRes.data ?? []);
  const isFollowing = Boolean(followingRes.data);

  const productsTab =
    products.length === 0 ? (
      <div className="empty-state">
        <div className="empty-state-icon">📦</div>
        <p>{tHome('noProducts')}</p>
      </div>
    ) : (
      <div className="products-grid" style={{ padding: '0 20px' }}>
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
            contactLabel={tHome('contact')}
            showFavorite={false}
          />
        ))}
      </div>
    );

  const aboutTab = (
    <div style={{ padding: '0 20px' }}>
      {store.description ? (
        <div className="product-detail-desc">{store.description}</div>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {store.phone ? (
          <div className="seller-mini">
            <span className="seller-mini-avatar" style={{ fontSize: 20 }}>
              📞
            </span>
            <div style={{ flex: 1 }}>
              <div className="seller-mini-sub">{t('directCall')}</div>
              <div className="seller-mini-name" dir="ltr">
                {store.phone}
              </div>
            </div>
          </div>
        ) : null}
        {store.address || store.city ? (
          <div className="seller-mini">
            <span className="seller-mini-avatar" style={{ fontSize: 20 }}>
              📍
            </span>
            <div style={{ flex: 1 }}>
              <div className="seller-mini-sub">{t('tabAbout')}</div>
              <div className="seller-mini-name">
                {[store.address, store.city].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
        ) : null}
        {store.opening_hours ? (
          <div className="seller-mini">
            <span className="seller-mini-avatar" style={{ fontSize: 20 }}>
              🕐
            </span>
            <div style={{ flex: 1 }}>
              <div className="seller-mini-sub">{t('openingHours')}</div>
              <div className="seller-mini-name">{store.opening_hours}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const reviewsTab =
    reviews.length === 0 ? (
      <div className="empty-state">
        <div className="empty-state-icon">⭐</div>
        <p>{t('tabReviews')}</p>
      </div>
    ) : (
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviews.map((r) => (
          <div
            key={r.id}
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>{r.reviewer?.full_name ?? '—'}</span>
              <span style={{ fontSize: 12 }}>{'⭐'.repeat(r.rating)}</span>
            </div>
            {r.comment ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                {r.comment}
              </p>
            ) : null}
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
              {formatRelative(r.created_at, locale)}
            </p>
          </div>
        ))}
      </div>
    );

  return (
    <div style={{ paddingBottom: 80, paddingTop: 60 }}>
      <div className="store-cover">
        {store.cover_url ? (
          <Image src={store.cover_url} alt={store.name} fill sizes="100vw" priority />
        ) : (
          <span aria-hidden>🏪</span>
        )}
        <div className="store-cover-overlay" />
      </div>

      <div className="store-profile">
        <div className="store-avatar">
          {store.avatar_url ? (
            <Image src={store.avatar_url} alt={store.name} fill sizes="80px" />
          ) : (
            '🏪'
          )}
        </div>
        <div className="store-info">
          <div className="store-name">{store.name}</div>
          <div className="store-meta">
            {store.is_verified ? <span className="verified-badge">{t('verified')}</span> : null}
            {store.city ? <span className="store-meta-item">📍 {store.city}</span> : null}
            <span className="store-meta-item">⭐ {Number(store.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="store-stats">
        <div className="store-stat">
          <div className="store-stat-num">{store.products_count}</div>
          <div className="store-stat-label">{t('statProducts')}</div>
        </div>
        <div className="store-stat">
          <div className="store-stat-num">{store.followers_count}</div>
          <div className="store-stat-label">{t('statFollowers')}</div>
        </div>
        <div className="store-stat">
          <div className="store-stat-num">{store.reviews_count}</div>
          <div className="store-stat-label">{t('tabReviews')}</div>
        </div>
      </div>

      <div className="store-actions">
        <MessageStoreButton ownerId={ownerId} selfId={user?.id ?? null} />
        <FollowButton storeId={storeId} initialFollowed={isFollowing} />
      </div>

      <StoreTabs
        productsContent={productsTab}
        aboutContent={aboutTab}
        reviewsContent={reviewsTab}
      />
    </div>
  );
}
