import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { cast } from '@/lib/supabase/helpers';
import { categoryName } from '@/lib/categories';
import { formatPrice, formatRelative } from '@/lib/format';
import ProductGallery from '@/components/products/ProductGallery';
import FavoriteButton from '@/components/products/FavoriteButton';
import ContactSellerButton from '@/components/chat/ContactSellerButton';
import type { ProductCondition } from '@/lib/supabase/database.types';
import type { AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

interface ProductRow {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  condition: ProductCondition;
  city: string | null;
  badge: string | null;
  is_negotiable: boolean;
  views_count: number;
  favorites_count: number;
  status: string;
  created_at: string;
  store_id: string | null;
  seller_id: string;
  category: {
    id: string;
    slug: string;
    name_ar: string;
    name_fr: string | null;
    name_en: string | null;
    icon: string | null;
  } | null;
  images: Array<{ url: string; sort_order: number }>;
  store: {
    id: string;
    slug: string;
    name: string;
    avatar_url: string | null;
    is_verified: boolean;
    products_count: number;
    rating: number;
    phone: string | null;
    whatsapp: string | null;
  } | null;
  seller: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: AppLocale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('product');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `id, title, description, price, currency, condition, city, badge, is_negotiable,
       views_count, favorites_count, status, created_at, store_id, seller_id,
       category:categories(id, slug, name_ar, name_fr, name_en, icon),
       images:product_images(url, sort_order),
       store:stores(id, slug, name, avatar_url, is_verified, products_count, rating, phone, whatsapp),
       seller:profiles!products_seller_id_fkey(id, full_name, avatar_url, phone)`,
    )
    .eq('id', id)
    .maybeSingle();

  const product = cast<ProductRow | null>(data);
  if (error || !product) notFound();

  // increment views_count (fire-and-forget)
  void supabase
    .from('products')
    .update({ views_count: (product.views_count ?? 0) + 1 } as never)
    .eq('id', product.id)
    .then(() => undefined);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isFavorite = false;
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();
    isFavorite = Boolean(fav);
  }

  const sortedImages = [...product.images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.url);

  const conditionLabel = (() => {
    switch (product.condition) {
      case 'new':
        return t('conditionNew');
      case 'like_new':
        return t('conditionLikeNew');
      case 'refurbished':
        return t('conditionRefurbished');
      case 'used':
      default:
        return t('conditionUsed');
    }
  })();

  const tags: string[] = [conditionLabel];
  if (product.is_negotiable) tags.push(t('negotiable'));
  if (product.badge) tags.push(product.badge);

  const sellerName = product.store?.name ?? product.seller?.full_name ?? '—';
  const phoneToCall = product.store?.phone ?? product.seller?.phone ?? null;

  return (
    <div className="product-detail" style={{ paddingBottom: 100 }}>
      <ProductGallery
        images={sortedImages}
        emojiFallback={product.category?.icon ?? '📦'}
        title={product.title}
      />

      <div
        style={{
          position: 'absolute',
          top: 76,
          insetInlineEnd: 16,
          zIndex: 3,
        }}
      >
        <FavoriteButton productId={product.id} initial={isFavorite} />
      </div>

      <div className="product-detail-body">
        {product.category ? (
          <Link href={`/search?category=${product.category.slug}`} className="product-detail-cat">
            {product.category.icon} {categoryName(product.category, locale)}
          </Link>
        ) : null}

        <div className="product-detail-title">{product.title}</div>
        <div className="product-detail-price">
          {formatPrice(product.price, locale)} <span>{product.currency}</span>
        </div>

        <div className="product-detail-info">
          {product.city ? (
            <span className="product-detail-info-item">📍 {product.city}</span>
          ) : null}
          <span className="product-detail-info-item">
            🕐 {formatRelative(product.created_at, locale)}
          </span>
          <span className="product-detail-info-item">👁 {product.views_count}</span>
          <span className="product-detail-info-item">❤ {product.favorites_count}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>

        {product.description ? (
          <div className="product-detail-desc">{product.description}</div>
        ) : null}

        {product.store ? (
          <Link href={`/store/${product.store.id}`} className="seller-mini">
            <div className="seller-mini-avatar">
              {product.store.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.store.avatar_url} alt={sellerName} />
              ) : (
                '🏪'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="seller-mini-name">{sellerName}</div>
              <div className="seller-mini-sub">
                ⭐ {Number(product.store.rating).toFixed(1)} · {product.store.products_count}
                {product.store.is_verified ? ' · ✅' : ''}
              </div>
            </div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>←</span>
          </Link>
        ) : (
          <div className="seller-mini">
            <div className="seller-mini-avatar">
              {product.seller?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.seller.avatar_url} alt={sellerName} />
              ) : (
                '👤'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="seller-mini-name">{sellerName}</div>
            </div>
          </div>
        )}

        <div className="product-ctas">
          <ContactSellerButton
            sellerId={product.seller_id}
            productId={product.id}
            selfId={user?.id ?? null}
          />
          {phoneToCall ? (
            <a
              href={`tel:${phoneToCall}`}
              className="btn-outline"
              style={{
                fontSize: 15,
                padding: '14px',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              {t('callSeller')}
            </a>
          ) : (
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: 15, padding: '14px' }}
              disabled
            >
              {t('callSeller')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
