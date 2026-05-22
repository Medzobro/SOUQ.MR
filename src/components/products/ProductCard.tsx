import { Link } from '@/i18n/routing';
import { formatPrice } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import FavoriteButton from './FavoriteButton';

export interface ProductCardData {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string | null;
  badge: string | null;
  imageUrl: string | null;
  imageEmoji?: string;
}

interface Props {
  product: ProductCardData;
  locale: AppLocale;
  contactLabel: string;
  isFavorite?: boolean;
  showFavorite?: boolean;
}

export default function ProductCard({
  product,
  locale,
  contactLabel,
  isFavorite = false,
  showFavorite = true,
}: Props) {
  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-img">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} loading="lazy" />
        ) : (
          <span aria-hidden>{product.imageEmoji ?? '📦'}</span>
        )}
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}
        {showFavorite ? <FavoriteButton productId={product.id} initial={isFavorite} /> : null}
      </div>
      <div className="product-info">
        <div className="product-name">{product.title}</div>
        {product.city ? <div className="product-loc">📍 {product.city}</div> : null}
        <div className="product-footer">
          <div className="product-price">
            {formatPrice(product.price, locale)} <span>{product.currency}</span>
          </div>
          <span className="btn-chat">💬 {contactLabel}</span>
        </div>
      </div>
    </Link>
  );
}
