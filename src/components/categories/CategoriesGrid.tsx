import { Link } from '@/i18n/routing';
import { categoryName } from '@/lib/categories';
import type { Category } from '@/lib/supabase/database.types';
import type { AppLocale } from '@/i18n/routing';

interface Props {
  categories: Array<Category & { products_count?: number }>;
  locale: AppLocale;
  countLabel: string;
}

export default function CategoriesGrid({ categories, locale, countLabel }: Props) {
  return (
    <div className="cats-grid">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={{ pathname: '/search', query: { category: c.slug } }}
          className="cat-card"
        >
          <div className="cat-icon">{c.icon ?? '📦'}</div>
          <div className="cat-name">{categoryName(c, locale)}</div>
          {typeof c.products_count === 'number' ? (
            <div className="cat-count">
              {c.products_count} {countLabel}
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
